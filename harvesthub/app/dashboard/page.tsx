'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import BottomNavBar from '@/components/BottomNavBar';

const CROP_NAMES: Record<string, string> = {
    paddy: 'Paddy', cotton: 'Cotton', maize: 'Maize', turmeric: 'Turmeric', red_chilli: 'Red Chilli'
};
const STATUS_ORDER = ['growing', 'harvested', 'stored', 'transported', 'sold'];

interface DashboardData {
    farmer: {
        uid: string; name: string; crop: string; variety: string; sownDate: string;
        fieldSize_acres: number; expectedQtl: number | null; viability_days: number;
        harvestWeek: number; status: string; estimatedPrice: number | null; actualPrice: number | null;
    };
    supply_pressure: { farmer_count: number; level: string; label: string };
    msp: number;
    current_mandi_price: number;
    viability_status: string;
}

interface AIResult {
    loading: boolean; data: Record<string, unknown> | null; error: boolean;
}

export default function DashboardPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [dashboard, setDashboard] = useState<DashboardData | null>(null);
    const [pageLoading, setPageLoading] = useState(true);
    const [harvestAI, setHarvestAI] = useState<AIResult>({ loading: false, data: null, error: false });
    const [sellAI, setSellAI] = useState<AIResult>({ loading: false, data: null, error: false });
    const [quantityAI, setQuantityAI] = useState<AIResult>({ loading: false, data: null, error: false });
    const [showSellPanel, setShowSellPanel] = useState(false);
    const [showStatusSheet, setShowStatusSheet] = useState(false);
    const [actualPrice, setActualPrice] = useState('');
    const [toast, setToast] = useState('');

    // Redirect if not authed
    useEffect(() => {
        if (!authLoading && !user) router.push('/auth');
    }, [user, authLoading, router]);

    const showToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(''), 4000);
    };

    // Load dashboard data
    useEffect(() => {
        if (!user) return;
        const uid = user.uid;

        const fetchDashboard = async () => {
            try {
                const res = await fetch(`/api/dashboard/summary?uid=${uid}`);
                if (res.ok) {
                    const data = await res.json();
                    setDashboard(data);
                }
            } catch {
                showToast('Connection issue. Some data may be outdated.');
            } finally {
                setPageLoading(false);
            }
        };

        fetchDashboard();

        // Real-time listener
        const unsub = onSnapshot(doc(db, 'farmers', uid), () => fetchDashboard());
        return () => unsub();
    }, [user]);

    // Load Harvest AI
    const loadHarvestAI = useCallback(async () => {
        if (!dashboard) return;
        setHarvestAI({ loading: true, data: null, error: false });
        const timeout = setTimeout(() => setHarvestAI(prev => ({ ...prev, loading: false, error: true })), 8000);
        try {
            const res = await fetch('/api/ai/harvest', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    crop: dashboard.farmer.crop,
                    variety: dashboard.farmer.variety,
                    sownDate: dashboard.farmer.sownDate,
                    fieldSize_acres: dashboard.farmer.fieldSize_acres,
                    district: 'Warangal',
                    viability_days: dashboard.farmer.viability_days,
                    current_price: dashboard.current_mandi_price,
                    msp: dashboard.msp,
                    farmer_count: dashboard.supply_pressure.farmer_count,
                    language: 'te',
                }),
            });
            clearTimeout(timeout);
            const data = await res.json();
            setHarvestAI({ loading: false, data, error: false });
        } catch {
            clearTimeout(timeout);
            setHarvestAI({ loading: false, data: null, error: true });
        }
    }, [dashboard]);

    useEffect(() => {
        if (dashboard) loadHarvestAI();
    }, [dashboard, loadHarvestAI]);

    // Load Quantity AI
    useEffect(() => {
        if (!dashboard) return;
        setQuantityAI({ loading: true, data: null, error: false });
        const timeout = setTimeout(() => setQuantityAI(prev => ({ ...prev, loading: false, error: true })), 8000);
        fetch('/api/ai/quantity', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                crop: dashboard.farmer.crop,
                variety: dashboard.farmer.variety,
                fieldSize_acres: dashboard.farmer.fieldSize_acres,
                district: 'Warangal',
                season: 'Kharif',
                district_avg_qtl_per_acre: 18,
            }),
        })
            .then(r => r.json())
            .then(data => { clearTimeout(timeout); setQuantityAI({ loading: false, data, error: false }); })
            .catch(() => { clearTimeout(timeout); setQuantityAI({ loading: false, data: null, error: true }); });
    }, [dashboard]);

    // Load Sell AI
    const loadSellAI = async () => {
        if (!dashboard) return;
        setShowSellPanel(true);
        setSellAI({ loading: true, data: null, error: false });
        const timeout = setTimeout(() => setSellAI(prev => ({ ...prev, loading: false, error: true })), 8000);
        try {
            const res = await fetch('/api/ai/sell', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    viability_days: dashboard.farmer.viability_days,
                    rain_in_3_days: false,
                    current_price: dashboard.current_mandi_price,
                    msp: dashboard.msp,
                    farmer_count_this_week: dashboard.supply_pressure.farmer_count,
                    storage_capacity_pct: 70,
                    transport_availability: 'medium',
                    matched_buyer_offer: { exists: false },
                    language: 'te',
                }),
            });
            clearTimeout(timeout);
            const data = await res.json();
            setSellAI({ loading: false, data, error: false });
        } catch {
            clearTimeout(timeout);
            setSellAI({ loading: false, data: null, error: true });
        }
    };

    // Accept harvest window
    const acceptHarvestWindow = async () => {
        if (!user || !harvestAI.data) return;
        try {
            await updateDoc(doc(db, 'farmers', user.uid), { harvestWeek: 1 });
            showToast('Harvest window accepted! ✓');
        } catch {
            showToast('Failed to update. Please try again.');
        }
    };

    // Advance status
    const advanceStatus = async () => {
        if (!user || !dashboard) return;
        const current = dashboard.farmer.status;
        const currentIdx = STATUS_ORDER.indexOf(current);
        if (currentIdx === STATUS_ORDER.length - 1) return;
        const next = STATUS_ORDER[currentIdx + 1];
        try {
            await updateDoc(doc(db, 'farmers', user.uid), { status: next });
            setShowStatusSheet(false);
            showToast(`Status updated to ${next} ✓`);
        } catch {
            showToast('Failed to update status.');
        }
    };

    // Save actual price
    const saveActualPrice = async () => {
        if (!user || !actualPrice) return;
        try {
            await updateDoc(doc(db, 'farmers', user.uid), { actualPrice: Number(actualPrice) });
            showToast('Actual price saved ✓');
        } catch {
            showToast('Failed to save price.');
        }
    };

    if (authLoading || pageLoading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F7F7F7' }}>
                <div style={{ width: '32px', height: '32px', border: '3px solid #E8E8E8', borderTopColor: '#2E7D32', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    if (!dashboard) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '12px', background: '#F7F7F7', padding: '24px' }}>
                <span style={{ fontSize: '48px' }}>🌾</span>
                <p style={{ color: '#616161', fontSize: '15px', textAlign: 'center' }}>No farm data found. Please complete onboarding.</p>
                <button onClick={() => router.push('/onboarding')} style={{ background: '#2E7D32', color: 'white', border: 'none', borderRadius: '9999px', padding: '14px 28px', fontWeight: 700, fontSize: '15px', cursor: 'pointer' }}>
                    Set Up My Farm
                </button>
                <BottomNavBar />
            </div>
        );
    }

    const f = dashboard.farmer;
    const sp = dashboard.supply_pressure;
    const isEmergency = f.viability_days < 3 || (harvestAI.data as { emergency_sell?: boolean })?.emergency_sell;
    const vdColor = dashboard.viability_status === 'green' ? '#2E7D32' : dashboard.viability_status === 'yellow' ? '#F9A825' : '#C62828';
    const spColor = sp.level === 'green' ? '#2E7D32' : sp.level === 'yellow' ? '#F9A825' : '#C62828';
    const currentStatusIdx = STATUS_ORDER.indexOf(f.status);

    return (
        <div style={{ minHeight: '100vh', background: '#F7F7F7', fontFamily: 'system-ui, -apple-system, sans-serif' }}>

            {/* Emergency Banner */}
            {isEmergency && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, background: '#C62828', padding: '16px', zIndex: 200, textAlign: 'center' }}>
                    <span style={{ color: 'white', fontWeight: 800, fontSize: '16px' }}>⚠️ Sell Now — Your crop cannot wait. Waiting risks complete loss.</span>
                </div>
            )}

            <div style={{ paddingTop: isEmergency ? '56px' : '0', paddingBottom: '80px' }}>
                <div style={{ padding: '24px 16px', maxWidth: '480px', margin: '0 auto' }}>

                    {/* Header */}
                    <div style={{ marginBottom: '20px' }}>
                        <p style={{ fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#2E7D32', marginBottom: '4px' }}>YOUR FARM OVERVIEW</p>
                        <h1 style={{ fontWeight: 900, fontSize: '28px', color: '#0A0A0A', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
                            {CROP_NAMES[f.crop] || f.crop}<br />
                            <span style={{ fontSize: '18px', fontWeight: 600, color: '#616161' }}>{f.variety}</span>
                        </h1>
                    </div>

                    {/* Hero Stat Cards */}
                    <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', marginBottom: '16px', paddingBottom: '4px' }}>
                        {[
                            { num: f.viability_days, label: 'Days Left', lime: true },
                            { num: `${f.fieldSize_acres} Ac`, label: 'Field Size', lime: false },
                            { num: f.expectedQtl ? `${f.expectedQtl} Qt` : '—', label: 'Expected Yield', lime: false },
                            { num: `₹${dashboard.current_mandi_price}`, label: 'Mandi Price', lime: false },
                        ].map((s, i) => (
                            <div key={i} style={{
                                background: s.lime ? '#C8FF00' : 'white', borderRadius: '16px',
                                padding: '16px', border: s.lime ? 'none' : '1px solid #E8E8E8',
                                minWidth: '90px', flexShrink: 0,
                            }}>
                                <div style={{ fontWeight: 900, fontSize: '22px', color: s.lime ? '#0A0A0A' : '#2E7D32', letterSpacing: '-0.02em' }}>{s.num}</div>
                                <div style={{ fontWeight: 600, fontSize: '11px', color: s.lime ? '#0A0A0A' : '#616161' }}>{s.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Viability Badge */}
                    <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E8E8E8', padding: '16px', marginBottom: '16px' }}>
                        <span style={{ background: vdColor, color: 'white', borderRadius: '9999px', padding: '6px 14px', fontWeight: 700, fontSize: '13px', textTransform: 'uppercase' }}>
                            {f.viability_days > 7 ? `${f.viability_days} days — Safe` : f.viability_days >= 3 ? `${f.viability_days} days — Monitor` : `${f.viability_days} days — CRITICAL`}
                        </span>
                    </div>

                    {/* Section 1: Supply Pressure */}
                    <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E8E8E8', padding: '20px', marginBottom: '16px' }}>
                        <p style={{ fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#2E7D32', marginBottom: '4px' }}>ZONE ACTIVITY</p>
                        <h2 style={{ fontWeight: 800, fontSize: '18px', color: '#0A0A0A', marginBottom: '16px', letterSpacing: '-0.02em' }}>This Week in Your Mandal</h2>
                        <div style={{ textAlign: 'center' }}>
                            <span style={{ background: spColor, color: spColor === '#F9A825' ? '#1B1B1B' : 'white', borderRadius: '9999px', padding: '8px 20px', fontWeight: 700, fontSize: '16px', textTransform: 'uppercase', display: 'inline-block', marginBottom: '12px' }}>
                                {sp.level.toUpperCase()} PRESSURE
                            </span>
                            <div style={{ fontWeight: 900, fontSize: '40px', color: '#2E7D32', letterSpacing: '-0.03em' }}>{sp.farmer_count}</div>
                            <div style={{ fontSize: '14px', color: '#616161' }}>farmers harvesting {CROP_NAMES[f.crop]} this week</div>
                            <div style={{ fontSize: '13px', color: '#616161', marginTop: '4px' }}>{sp.label}</div>
                        </div>
                    </div>

                    {/* Section 2: Harvest Recommendation (AI) */}
                    <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E8E8E8', padding: '20px', marginBottom: '16px' }}>
                        <p style={{ fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#2E7D32', marginBottom: '4px' }}>AI POWERED</p>
                        <h2 style={{ fontWeight: 800, fontSize: '18px', color: '#0A0A0A', marginBottom: '12px', letterSpacing: '-0.02em' }}>Harvest Window</h2>
                        <div style={{ height: '1px', background: '#E8E8E8', margin: '0 0 12px' }} />
                        {harvestAI.loading ? (
                            <div style={{ display: 'flex', justifyContent: 'center', padding: '24px 0' }}>
                                <div style={{ width: '32px', height: '32px', border: '3px solid #E8E8E8', borderTopColor: '#2E7D32', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                            </div>
                        ) : harvestAI.error || !harvestAI.data ? (
                            <p style={{ color: '#616161', textAlign: 'center', fontSize: '14px' }}>Recommendation unavailable. Showing last saved data.</p>
                        ) : (
                            <div>
                                {(harvestAI.data as { emergency_sell?: boolean }).emergency_sell ? (
                                    <div style={{ background: '#FFF3F3', borderRadius: '12px', padding: '16px', marginBottom: '12px' }}>
                                        <span style={{ background: '#C62828', color: 'white', borderRadius: '9999px', padding: '6px 14px', fontWeight: 700, fontSize: '13px' }}>⚠️ EMERGENCY — Sell Now</span>
                                    </div>
                                ) : (
                                    <>
                                        <div style={{ fontWeight: 900, fontSize: '32px', color: '#2E7D32', letterSpacing: '-0.02em', marginBottom: '4px' }}>
                                            {(harvestAI.data as { recommended_window: string }).recommended_window}
                                        </div>
                                        <div style={{ fontWeight: 600, fontSize: '16px', color: '#1B1B1B', marginBottom: '12px' }}>
                                            {(harvestAI.data as { price_estimate: string }).price_estimate}
                                        </div>
                                    </>
                                )}
                                <p style={{ fontSize: '13px', color: '#616161', lineHeight: 1.6, marginBottom: '16px' }}>
                                    {(harvestAI.data as { reasoning_telugu: string }).reasoning_telugu}
                                </p>
                                {!(harvestAI.data as { emergency_sell?: boolean }).emergency_sell && (
                                    <button onClick={acceptHarvestWindow} style={{ background: '#2E7D32', color: 'white', fontWeight: 700, fontSize: '15px', borderRadius: '9999px', padding: '14px 28px', width: '100%', minHeight: '52px', border: 'none', cursor: 'pointer' }}>
                                        Accept This Window
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Section 3: Sell Decision (AI) */}
                    <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E8E8E8', padding: '20px', marginBottom: '16px' }}>
                        <p style={{ fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#2E7D32', marginBottom: '4px' }}>SELL INTELLIGENCE</p>
                        <h2 style={{ fontWeight: 800, fontSize: '18px', color: '#0A0A0A', marginBottom: '12px', letterSpacing: '-0.02em' }}>Should I Sell Now?</h2>
                        <div style={{ height: '1px', background: '#E8E8E8', margin: '0 0 12px' }} />
                        {!showSellPanel ? (
                            <button onClick={loadSellAI} style={{ background: '#2E7D32', color: 'white', fontWeight: 700, fontSize: '15px', borderRadius: '9999px', padding: '14px 28px', width: '100%', minHeight: '52px', border: 'none', cursor: 'pointer' }}>
                                Get Recommendation
                            </button>
                        ) : sellAI.loading ? (
                            <div style={{ display: 'flex', justifyContent: 'center', padding: '24px 0' }}>
                                <div style={{ width: '32px', height: '32px', border: '3px solid #E8E8E8', borderTopColor: '#2E7D32', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                            </div>
                        ) : sellAI.error || !sellAI.data ? (
                            <p style={{ color: '#616161', textAlign: 'center', fontSize: '14px' }}>Recommendation unavailable. Showing last saved data.</p>
                        ) : (
                            <div>
                                {(() => {
                                    const sd = sellAI.data as { decision: string; factor_breakdown: { factor: string; status: string; impact: string }[]; reasoning_telugu: string };
                                    const decisionColor = sd.decision.includes('Emergency') ? '#C62828' : sd.decision.includes('Wait') ? '#F9A825' : '#2E7D32';
                                    return (
                                        <>
                                            <div style={{ fontWeight: 900, fontSize: '28px', color: decisionColor, textTransform: 'uppercase', letterSpacing: '-0.02em', marginBottom: '16px' }}>
                                                {sd.decision}
                                            </div>
                                            {sd.factor_breakdown.map((row, i) => (
                                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #F7F7F7' }}>
                                                    <span style={{ fontWeight: 700, fontSize: '14px', color: '#1B1B1B' }}>{row.factor}</span>
                                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                                                        <span style={{ fontSize: '12px', color: '#616161' }}>{row.status}</span>
                                                        {row.impact !== 'none' && (
                                                            <span style={{ background: '#F7F7F7', color: '#616161', borderRadius: '9999px', padding: '2px 8px', fontSize: '11px', fontWeight: 600 }}>{row.impact}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                            <p style={{ fontSize: '13px', color: '#616161', lineHeight: 1.6, marginTop: '12px' }}>{sd.reasoning_telugu}</p>
                                        </>
                                    );
                                })()}
                            </div>
                        )}
                    </div>

                    {/* Section 4: Yield Estimate (AI) */}
                    <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E8E8E8', padding: '20px', marginBottom: '16px' }}>
                        <p style={{ fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#2E7D32', marginBottom: '4px' }}>YIELD INTELLIGENCE</p>
                        <h2 style={{ fontWeight: 800, fontSize: '18px', color: '#0A0A0A', marginBottom: '12px', letterSpacing: '-0.02em' }}>Expected Yield</h2>
                        <div style={{ height: '1px', background: '#E8E8E8', margin: '0 0 12px' }} />
                        {quantityAI.loading ? (
                            <div style={{ display: 'flex', justifyContent: 'center', padding: '24px 0' }}>
                                <div style={{ width: '32px', height: '32px', border: '3px solid #E8E8E8', borderTopColor: '#2E7D32', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                            </div>
                        ) : quantityAI.error || !quantityAI.data ? (
                            <p style={{ color: '#616161', textAlign: 'center', fontSize: '14px' }}>Recommendation unavailable.</p>
                        ) : (
                            <div>
                                {(() => {
                                    const qd = quantityAI.data as { estimated_quintals: number; range_low: number; range_high: number };
                                    return (
                                        <>
                                            <div style={{ fontWeight: 900, fontSize: '40px', color: '#2E7D32', letterSpacing: '-0.03em' }}>{qd.estimated_quintals} Qt</div>
                                            <div style={{ fontSize: '14px', color: '#616161', marginBottom: '16px' }}>{qd.range_low} – {qd.range_high} quintals estimated range</div>
                                            <button style={{ background: '#2E7D32', color: 'white', fontWeight: 700, fontSize: '15px', borderRadius: '9999px', padding: '14px 28px', width: '100%', minHeight: '52px', border: 'none', cursor: 'pointer' }}>
                                                Confirm This Quantity
                                            </button>
                                        </>
                                    );
                                })()}
                            </div>
                        )}
                    </div>

                    {/* Section 5: Post-Harvest Status Tracker */}
                    <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E8E8E8', padding: '20px', marginBottom: '16px' }}>
                        <p style={{ fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#2E7D32', marginBottom: '4px' }}>HARVEST PROGRESS</p>
                        <h2 style={{ fontWeight: 800, fontSize: '18px', color: '#0A0A0A', marginBottom: '16px', letterSpacing: '-0.02em' }}>Track Your Crop</h2>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                            {STATUS_ORDER.map((status, i) => (
                                <div key={status} style={{ display: 'flex', alignItems: 'center', flex: i < STATUS_ORDER.length - 1 ? '1' : '0 0 auto' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                                        <div style={{
                                            width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            background: i <= currentStatusIdx ? '#2E7D32' : 'transparent',
                                            border: i <= currentStatusIdx ? 'none' : '2px solid #E8E8E8',
                                            color: i <= currentStatusIdx ? 'white' : '#BDBDBD',
                                            fontWeight: 700, fontSize: '12px', flexShrink: 0,
                                        }}>
                                            {i < currentStatusIdx ? '✓' : i + 1}
                                        </div>
                                        <span style={{ fontSize: '9px', fontWeight: 600, textTransform: 'uppercase', color: i <= currentStatusIdx ? '#2E7D32' : '#BDBDBD', letterSpacing: '0.04em', textAlign: 'center', maxWidth: '44px' }}>
                                            {status}
                                        </span>
                                    </div>
                                    {i < STATUS_ORDER.length - 1 && (
                                        <div style={{ flex: 1, height: '2px', background: i < currentStatusIdx ? '#2E7D32' : '#E8E8E8', margin: '0 4px', marginBottom: '20px' }} />
                                    )}
                                </div>
                            ))}
                        </div>

                        {f.status !== 'sold' && (
                            <button onClick={() => setShowStatusSheet(true)} style={{ background: '#2E7D32', color: 'white', fontWeight: 700, fontSize: '15px', borderRadius: '9999px', padding: '12px 24px', width: '100%', minHeight: '48px', border: 'none', cursor: 'pointer' }}>
                                Mark as {STATUS_ORDER[currentStatusIdx + 1]} →
                            </button>
                        )}

                        {/* Profit Tracker (after Sold) */}
                        {f.status === 'sold' && (
                            <div style={{ marginTop: '16px' }}>
                                <p style={{ fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#2E7D32', marginBottom: '8px' }}>PROFIT TRACKER</p>
                                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                                    <input
                                        value={actualPrice}
                                        onChange={e => setActualPrice(e.target.value)}
                                        type="number"
                                        placeholder="Actual price received (₹/qtl)"
                                        style={{ flex: 1, padding: '12px 14px', fontSize: '14px', border: '1px solid #E8E8E8', borderRadius: '12px', outline: 'none', color: '#1B1B1B' }}
                                    />
                                    <button onClick={saveActualPrice} style={{ background: '#2E7D32', color: 'white', border: 'none', borderRadius: '12px', padding: '12px 16px', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>Save</button>
                                </div>
                                {f.actualPrice && f.estimatedPrice && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '14px', color: '#616161' }}>Estimated ₹{f.estimatedPrice} vs Actual ₹{f.actualPrice}</span>
                                        <span style={{ fontWeight: 800, fontSize: '20px', color: f.actualPrice >= f.estimatedPrice ? '#2E7D32' : '#C62828' }}>
                                            {f.actualPrice >= f.estimatedPrice ? '+' : ''}₹{f.actualPrice - f.estimatedPrice}
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                </div>
            </div>

            {/* Status confirmation bottom sheet */}
            {showStatusSheet && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 300, display: 'flex', alignItems: 'flex-end' }}
                    onClick={() => setShowStatusSheet(false)}>
                    <div style={{ background: 'white', borderRadius: '20px 20px 0 0', padding: '24px 16px', width: '100%', maxWidth: '480px', margin: '0 auto' }}
                        onClick={e => e.stopPropagation()}>
                        <h3 style={{ fontWeight: 800, fontSize: '18px', color: '#0A0A0A', marginBottom: '8px' }}>
                            Mark as {STATUS_ORDER[currentStatusIdx + 1]}?
                        </h3>
                        <p style={{ color: '#616161', fontSize: '14px', marginBottom: '20px' }}>This will update your crop status in HarvestHub.</p>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button onClick={() => setShowStatusSheet(false)} style={{ flex: 1, background: 'transparent', border: '1.5px solid #1B1B1B', borderRadius: '9999px', padding: '14px', fontWeight: 700, fontSize: '15px', cursor: 'pointer', color: '#1B1B1B' }}>
                                Cancel
                            </button>
                            <button onClick={advanceStatus} style={{ flex: 1, background: '#2E7D32', color: 'white', border: 'none', borderRadius: '9999px', padding: '14px', fontWeight: 700, fontSize: '15px', cursor: 'pointer' }}>
                                Yes, Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast */}
            {toast && (
                <div style={{ position: 'fixed', bottom: '76px', left: '16px', right: '16px', background: '#1B1B1B', color: 'white', borderRadius: '16px', padding: '14px 20px', fontSize: '14px', zIndex: 999 }}>
                    {toast}
                </div>
            )}

            <BottomNavBar />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}

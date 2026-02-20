'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

const MSP_VALUES: Record<string, number> = {
    paddy: 2183, cotton: 7121, maize: 2225, turmeric: 7000, red_chilli: 5500,
};
const CROP_NAMES: Record<string, string> = {
    paddy: 'Paddy', cotton: 'Cotton', maize: 'Maize', turmeric: 'Turmeric', red_chilli: 'Red Chilli',
};
const CROPS = ['paddy', 'cotton', 'maize', 'turmeric', 'red_chilli'];

interface Listing {
    listingId: string; crop: string; variety: string; quantityQtl: number;
    targetDate: string; pricePerQtl: number; district: string; status: string; isBelowMSP: boolean;
}
interface Match {
    matchId: string; farmerUid: string; crop: string; quantityQtl: number; pricePerQtl: number; matchedAt: { seconds: number };
}

export default function BuyerDashboardPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [listings, setListings] = useState<Listing[]>([]);
    const [matches, setMatches] = useState<Match[]>([]);
    const [loading, setLoading] = useState(true);
    const [posting, setPosting] = useState(false);
    const [toast, setToast] = useState('');

    // Form state
    const [crop, setCrop] = useState('paddy');
    const [variety, setVariety] = useState('');
    const [quantity, setQuantity] = useState('');
    const [targetDate, setTargetDate] = useState('');
    const [price, setPrice] = useState('');
    const [district, setDistrict] = useState('Warangal');

    useEffect(() => {
        if (!authLoading && !user) router.push('/auth');
    }, [user, authLoading, router]);

    useEffect(() => {
        if (!user) return;
        const fetchData = async () => {
            try {
                const [listingSnap, matchSnap] = await Promise.all([
                    getDocs(query(collection(db, 'buyer_listings'), where('buyerUid', '==', user.uid))),
                    getDocs(query(collection(db, 'matches'), where('buyerUid', '==', user.uid))),
                ]);
                setListings(listingSnap.docs.map(d => d.data() as Listing));
                setMatches(matchSnap.docs.map(d => d.data() as Match));
            } catch { }
            setLoading(false);
        };
        fetchData();
    }, [user]);

    const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 4000); };

    const msp = MSP_VALUES[crop] || 2183;
    const priceNum = Number(price);
    const belowMSP = priceNum > 0 && priceNum < msp;

    const handlePost = async () => {
        if (!user) return;
        if (!crop || !quantity || !price) { showToast('Please fill all required fields.'); return; }
        setPosting(true);
        try {
            const res = await fetch('/api/marketplace/post-demand', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ buyerUid: user.uid, crop, variety, quantityQtl: Number(quantity), targetDate, pricePerQtl: Number(price), district }),
            });
            const data = await res.json();
            if (data.success) {
                showToast('Listing posted ✓');
                setVariety(''); setQuantity(''); setTargetDate(''); setPrice('');
                // Refresh listings
                const snap = await getDocs(query(collection(db, 'buyer_listings'), where('buyerUid', '==', user.uid)));
                setListings(snap.docs.map(d => d.data() as Listing));
            }
        } catch { showToast('Failed to post listing.'); }
        setPosting(false);
    };

    const inputStyle = { width: '100%', padding: '12px 14px', fontSize: '14px', border: '1px solid #E8E8E8', borderRadius: '12px', outline: 'none', color: '#1B1B1B', background: 'white', boxSizing: 'border-box' as const, fontFamily: 'inherit' };
    const labelStyle = { fontWeight: 700, fontSize: '11px', textTransform: 'uppercase' as const, letterSpacing: '0.1em', color: '#2E7D32', display: 'block', marginBottom: '4px' };

    return (
        <div style={{ minHeight: '100vh', background: '#F7F7F7', fontFamily: 'system-ui, -apple-system, sans-serif', paddingBottom: '40px' }}>
            {/* Header */}
            <div style={{ background: 'white', borderBottom: '1px solid #E8E8E8', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '20px' }}>🌾</span>
                    <span style={{ fontWeight: 800, fontSize: '17px', color: '#0A0A0A' }}>HarvestHub</span>
                </div>
                <button onClick={() => { auth.signOut(); router.push('/auth'); }} style={{ background: 'none', border: 'none', color: '#616161', fontSize: '14px', cursor: 'pointer' }}>Logout</button>
            </div>

            <div style={{ padding: '24px 16px', maxWidth: '480px', margin: '0 auto' }}>
                <p style={{ fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#2E7D32', marginBottom: '4px' }}>POST DEMAND</p>
                <h1 style={{ fontWeight: 900, fontSize: '26px', color: '#0A0A0A', letterSpacing: '-0.03em', marginBottom: '20px' }}>What Do You Need?</h1>

                {/* Post Demand Form */}
                <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E8E8E8', padding: '20px', marginBottom: '16px' }}>
                    <div style={{ marginBottom: '12px' }}>
                        <label style={labelStyle}>CROP</label>
                        <select style={{ ...inputStyle, appearance: 'none' as const }} value={crop} onChange={e => setCrop(e.target.value)}>
                            {CROPS.map(c => <option key={c} value={c}>{CROP_NAMES[c]}</option>)}
                        </select>
                    </div>
                    <div style={{ marginBottom: '12px' }}>
                        <label style={labelStyle}>VARIETY</label>
                        <input style={inputStyle} value={variety} onChange={e => setVariety(e.target.value)} placeholder="e.g. Sona Masuri" />
                    </div>
                    <div style={{ marginBottom: '12px' }}>
                        <label style={labelStyle}>QUANTITY (QUINTALS)</label>
                        <input type="number" style={inputStyle} value={quantity} onChange={e => setQuantity(e.target.value)} placeholder="e.g. 50" />
                    </div>
                    <div style={{ marginBottom: '12px' }}>
                        <label style={labelStyle}>TARGET DATE</label>
                        <input type="date" style={inputStyle} value={targetDate} onChange={e => setTargetDate(e.target.value)} />
                    </div>
                    <div style={{ marginBottom: '8px' }}>
                        <label style={labelStyle}>PRICE (₹/QUINTAL)</label>
                        <input
                            type="number" value={price}
                            onChange={e => setPrice(e.target.value)}
                            placeholder={`e.g. ${msp}`}
                            style={{ ...inputStyle, borderColor: belowMSP ? '#C62828' : '#E8E8E8', boxShadow: belowMSP ? '0 0 0 1px #C62828' : 'none' }}
                        />
                        {belowMSP && (
                            <div style={{ marginTop: '8px' }}>
                                <span style={{ background: '#C62828', color: 'white', borderRadius: '9999px', padding: '4px 12px', fontWeight: 700, fontSize: '12px' }}>
                                    ⚠️ Below MSP (₹{msp}/qtl)
                                </span>
                            </div>
                        )}
                    </div>
                    <button onClick={handlePost} disabled={posting} style={{ background: posting ? '#BDBDBD' : '#2E7D32', color: 'white', fontWeight: 700, fontSize: '15px', borderRadius: '9999px', padding: '14px 28px', width: '100%', minHeight: '52px', border: 'none', cursor: posting ? 'not-allowed' : 'pointer', marginTop: '8px' }}>
                        {posting ? 'Posting...' : 'Post Listing'}
                    </button>
                </div>

                {/* My Listings */}
                <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E8E8E8', padding: '20px', marginBottom: '16px' }}>
                    <p style={{ fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#2E7D32', marginBottom: '12px' }}>YOUR LISTINGS</p>
                    {listings.length === 0 ? (
                        <p style={{ color: '#616161', fontSize: '14px' }}>No listings posted yet.</p>
                    ) : listings.map(l => (
                        <div key={l.listingId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #F7F7F7' }}>
                            <div>
                                <span style={{ fontWeight: 600, fontSize: '14px' }}>{CROP_NAMES[l.crop]} • {l.quantityQtl} qtl • ₹{l.pricePerQtl}</span>
                                {l.isBelowMSP && <span style={{ background: '#FFF3F3', color: '#C62828', borderRadius: '9999px', padding: '2px 8px', fontSize: '11px', fontWeight: 700, marginLeft: '6px' }}>Below MSP</span>}
                            </div>
                            <span style={{
                                background: l.status === 'matched' ? '#E8F5E9' : '#F7F7F7',
                                color: l.status === 'matched' ? '#2E7D32' : '#616161',
                                borderRadius: '9999px', padding: '4px 10px', fontWeight: 700, fontSize: '12px',
                            }}>
                                {l.status}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Accepted Matches */}
                <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E8E8E8', padding: '20px' }}>
                    <p style={{ fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#2E7D32', marginBottom: '12px' }}>MATCHED FARMERS</p>
                    {matches.length === 0 ? (
                        <p style={{ color: '#616161', fontSize: '14px' }}>No matches yet.</p>
                    ) : matches.map(m => (
                        <div key={m.matchId} style={{ padding: '10px 0', borderBottom: '1px solid #F7F7F7' }}>
                            <div style={{ fontWeight: 600, fontSize: '14px' }}>{CROP_NAMES[m.crop] || m.crop} • {m.quantityQtl} qtl • ₹{m.pricePerQtl}/qtl</div>
                            <div style={{ fontSize: '12px', color: '#616161' }}>Farmer: {m.farmerUid.slice(0, 8)}...</div>
                        </div>
                    ))}
                </div>
            </div>

            {toast && (
                <div style={{ position: 'fixed', bottom: '24px', left: '16px', right: '16px', background: '#1B1B1B', color: 'white', borderRadius: '16px', padding: '14px 20px', fontSize: '14px', zIndex: 999 }}>
                    {toast}
                </div>
            )}
        </div>
    );
}

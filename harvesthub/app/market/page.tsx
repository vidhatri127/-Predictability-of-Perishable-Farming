'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import BottomNavBar from '@/components/BottomNavBar';
import {
    Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
    Title, Tooltip, Legend, Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const CROPS = [
    { value: 'paddy', label: 'Paddy' },
    { value: 'cotton', label: 'Cotton' },
    { value: 'maize', label: 'Maize' },
    { value: 'turmeric', label: 'Turmeric' },
    { value: 'red_chilli', label: 'Red Chilli' },
];
const MSP_VALUES: Record<string, number> = {
    paddy: 2183, cotton: 7121, maize: 2225, turmeric: 7000, red_chilli: 5500,
};

export default function MarketPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [selectedCrop, setSelectedCrop] = useState('paddy');
    const [days, setDays] = useState(30);
    const [priceData, setPriceData] = useState<{ date: string; price: number }[]>([]);
    const [currentPrice, setCurrentPrice] = useState(0);
    const [source, setSource] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && !user) router.push('/auth');
    }, [user, authLoading, router]);

    const fetchPrices = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/market/prices?crop=${selectedCrop}&days=${days}`);
            const data = await res.json();
            setPriceData(data.prices || []);
            setCurrentPrice(data.current_price || 0);
            setSource(data.source || 'fallback');
        } catch {
            setPriceData([]);
        } finally {
            setLoading(false);
        }
    }, [selectedCrop, days]);

    useEffect(() => { fetchPrices(); }, [fetchPrices]);

    const msp = MSP_VALUES[selectedCrop] || 2183;
    const chartData = {
        labels: priceData.map(p => p.date.slice(5)), // Show MM-DD
        datasets: [{
            label: `${selectedCrop} price`,
            data: priceData.map(p => p.price),
            borderColor: '#2E7D32',
            backgroundColor: 'rgba(46,125,50,0.08)',
            fill: true,
            tension: 0.3,
            pointRadius: 0,
            borderWidth: 2,
        }],
    };
    const chartOptions = {
        responsive: true,
        plugins: { legend: { display: false }, tooltip: { mode: 'index' as const, intersect: false } },
        scales: {
            x: { grid: { color: '#F7F7F7' }, ticks: { color: '#BDBDBD', font: { size: 11 } } },
            y: { grid: { color: '#F7F7F7' }, ticks: { color: '#BDBDBD', font: { size: 11 } } },
        },
    };

    const pillActive = { background: '#2E7D32', color: 'white', border: 'none', borderRadius: '9999px', padding: '8px 16px', fontWeight: 700, fontSize: '14px', cursor: 'pointer' };
    const pillInactive = { background: '#F7F7F7', color: '#616161', border: '1px solid #E8E8E8', borderRadius: '9999px', padding: '8px 16px', fontWeight: 600, fontSize: '14px', cursor: 'pointer' };

    return (
        <div style={{ minHeight: '100vh', background: '#F7F7F7', fontFamily: 'system-ui, -apple-system, sans-serif', paddingBottom: '80px' }}>
            <div style={{ padding: '24px 16px', maxWidth: '480px', margin: '0 auto' }}>
                <p style={{ fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#2E7D32', marginBottom: '4px' }}>MARKET INTELLIGENCE</p>
                <h1 style={{ fontWeight: 900, fontSize: '28px', color: '#0A0A0A', letterSpacing: '-0.03em', marginBottom: '16px' }}>Mandi Prices</h1>

                {/* Crop Selector */}
                <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginBottom: '16px', paddingBottom: '4px' }}>
                    {CROPS.map(c => (
                        <button key={c.value} onClick={() => setSelectedCrop(c.value)} style={selectedCrop === c.value ? pillActive : pillInactive}>
                            {c.label}
                        </button>
                    ))}
                </div>

                {/* Current Price Card */}
                <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E8E8E8', padding: '20px', marginBottom: '16px' }}>
                    <p style={{ fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#2E7D32', marginBottom: '12px' }}>LIVE RATE</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                        <div>
                            <span style={{ fontWeight: 900, fontSize: '40px', color: '#2E7D32', letterSpacing: '-0.03em' }}>₹{currentPrice.toLocaleString()}</span>
                            <span style={{ fontSize: '14px', color: '#616161' }}>/quintal</span>
                            <div style={{ fontSize: '13px', color: '#616161', marginTop: '4px' }}>MSP: ₹{msp.toLocaleString()}</div>
                        </div>
                        <span style={{
                            background: source === 'agmarknet' ? '#C8FF00' : '#F7F7F7',
                            color: source === 'agmarknet' ? '#0A0A0A' : '#616161',
                            borderRadius: '9999px', padding: '4px 12px', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase'
                        }}>
                            {source === 'agmarknet' ? 'LIVE' : 'CACHED'}
                        </span>
                    </div>
                    {currentPrice < msp && (
                        <div style={{ marginTop: '12px', background: '#FFF3F3', borderRadius: '8px', padding: '8px 12px' }}>
                            <span style={{ color: '#C62828', fontSize: '13px', fontWeight: 600 }}>⚠️ Current price is below MSP — wait if possible</span>
                        </div>
                    )}
                </div>

                {/* Price Trend Chart */}
                <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E8E8E8', padding: '20px', marginBottom: '16px' }}>
                    <p style={{ fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#2E7D32', marginBottom: '12px' }}>PRICE TREND</p>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                        {[30, 60, 90].map(d => (
                            <button key={d} onClick={() => setDays(d)} style={days === d ? { ...pillActive, padding: '6px 14px', fontSize: '13px' } : { ...pillInactive, padding: '6px 14px', fontSize: '13px' }}>
                                {d} days
                            </button>
                        ))}
                    </div>
                    {loading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '32px 0' }}>
                            <div style={{ width: '32px', height: '32px', border: '3px solid #E8E8E8', borderTopColor: '#2E7D32', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                        </div>
                    ) : priceData.length > 0 ? (
                        <Line data={chartData} options={chartOptions} />
                    ) : (
                        <p style={{ textAlign: 'center', color: '#616161', fontSize: '14px', padding: '24px 0' }}>No price data available.</p>
                    )}
                </div>

                {/* Supply Overview */}
                <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E8E8E8', padding: '20px', marginBottom: '16px' }}>
                    <p style={{ fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#2E7D32', marginBottom: '4px' }}>ZONE SUPPLY</p>
                    <h2 style={{ fontWeight: 800, fontSize: '18px', color: '#0A0A0A', marginBottom: '16px', letterSpacing: '-0.02em' }}>Who&apos;s Harvesting This Week?</h2>
                    {[
                        { mandal: 'Warangal Urban', count: 8, level: 'red' },
                        { mandal: 'Hanamkonda', count: 3, level: 'yellow' },
                        { mandal: 'Kazipet', count: 2, level: 'green' },
                        { mandal: 'Parkal', count: 1, level: 'green' },
                    ].map((row, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #F7F7F7' }}>
                            <span style={{ fontSize: '14px', color: '#1B1B1B', fontWeight: 500 }}>{row.mandal}</span>
                            <span style={{
                                background: row.level === 'red' ? '#C62828' : row.level === 'yellow' ? '#F9A825' : '#2E7D32',
                                color: row.level === 'yellow' ? '#1B1B1B' : 'white',
                                borderRadius: '9999px', padding: '4px 10px', fontWeight: 700, fontSize: '12px',
                            }}>
                                {row.count} farmers
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <BottomNavBar />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}

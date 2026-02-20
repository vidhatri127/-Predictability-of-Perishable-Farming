'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { collection, query, where, getDocs, getDoc, doc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import BottomNavBar from '@/components/BottomNavBar';

const MSP_VALUES: Record<string, number> = {
    paddy: 2183, cotton: 7121, maize: 2225, turmeric: 7000, red_chilli: 5500,
};
const CROP_NAMES: Record<string, string> = {
    paddy: 'Paddy', cotton: 'Cotton', maize: 'Maize', turmeric: 'Turmeric', red_chilli: 'Red Chilli',
};

interface Listing {
    listingId: string; buyerUid: string; crop: string; variety: string;
    quantityQtl: number; targetDate: string; pricePerQtl: number;
    district: string; isBelowMSP: boolean; status: string;
}

export default function MarketplacePage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [listings, setListings] = useState<Listing[]>([]);
    const [farmerCrop, setFarmerCrop] = useState('paddy');
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState('');
    const [accepting, setAccepting] = useState<string | null>(null);

    useEffect(() => {
        if (!authLoading && !user) router.push('/auth');
    }, [user, authLoading, router]);

    useEffect(() => {
        if (!user) return;
        const fetchListings = async () => {
            try {
                const farmerSnap = await getDoc(doc(db, 'farmers', user.uid));
                const crop = farmerSnap.exists() ? farmerSnap.data().crop : 'paddy';
                setFarmerCrop(crop);

                const q = query(collection(db, 'buyer_listings'), where('crop', '==', crop), where('status', '==', 'open'));
                const snap = await getDocs(q);
                setListings(snap.docs.map(d => d.data() as Listing));
            } catch {
                setToast('Connection issue. Some data may be outdated.');
            } finally {
                setLoading(false);
            }
        };
        fetchListings();
    }, [user]);

    const handleAccept = async (listing: Listing) => {
        if (!user) return;
        if (listing.isBelowMSP) return;
        setAccepting(listing.listingId);
        try {
            const res = await fetch('/api/marketplace/accept', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ farmerUid: user.uid, listingId: listing.listingId }),
            });
            const data = await res.json();
            if (data.success) {
                setListings(prev => prev.filter(l => l.listingId !== listing.listingId));
                setToast('Offer accepted! Match created ✓');
            } else {
                setToast(data.message || 'Could not accept offer.');
            }
        } catch {
            setToast('Connection issue. Please try again.');
        } finally {
            setAccepting(null);
        }
    };

    if (authLoading || loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F7F7F7' }}>
                <div style={{ width: '32px', height: '32px', border: '3px solid #E8E8E8', borderTopColor: '#2E7D32', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: '#F7F7F7', fontFamily: 'system-ui, -apple-system, sans-serif', paddingBottom: '80px' }}>
            <div style={{ padding: '24px 16px', maxWidth: '480px', margin: '0 auto' }}>
                <p style={{ fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#2E7D32', marginBottom: '4px' }}>BUYERS NEAR YOU</p>
                <h1 style={{ fontWeight: 900, fontSize: '28px', color: '#0A0A0A', letterSpacing: '-0.03em', marginBottom: '4px' }}>Active Buyers</h1>
                <p style={{ color: '#616161', fontSize: '14px', marginBottom: '24px' }}>Filtered to your crop and district</p>

                {listings.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '48px 24px' }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🌿</div>
                        <p style={{ color: '#616161', fontSize: '15px' }}>No buyers for {CROP_NAMES[farmerCrop]} in your district yet.</p>
                    </div>
                ) : (
                    listings.map(listing => {
                        const msp = MSP_VALUES[listing.crop] || 2183;
                        const belowMSP = listing.pricePerQtl < msp;
                        return (
                            <div key={listing.listingId} style={{ background: 'white', borderRadius: '16px', border: '1px solid #E8E8E8', padding: '20px', marginBottom: '12px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                    <span style={{ fontWeight: 700, fontSize: '15px', color: '#1B1B1B' }}>{CROP_NAMES[listing.crop]} • {listing.variety}</span>
                                    <span style={{ fontSize: '13px', color: '#616161' }}>{listing.targetDate}</span>
                                </div>
                                <div style={{ fontWeight: 900, fontSize: '32px', color: '#2E7D32', letterSpacing: '-0.02em' }}>₹{listing.pricePerQtl.toLocaleString()}</div>
                                <div style={{ fontSize: '14px', color: '#616161', display: 'inline' }}>/quintal</div>
                                <div style={{ fontSize: '13px', color: '#616161', marginTop: '4px', marginBottom: '12px' }}>Needs: {listing.quantityQtl} quintals</div>
                                {belowMSP && (
                                    <div style={{ marginBottom: '12px' }}>
                                        <span style={{ background: '#C62828', color: 'white', borderRadius: '9999px', padding: '4px 12px', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase' }}>
                                            Below MSP
                                        </span>
                                        <div style={{ fontSize: '12px', color: '#C62828', marginTop: '4px' }}>MSP for {CROP_NAMES[listing.crop]} is ₹{msp}/qtl</div>
                                    </div>
                                )}
                                <button
                                    onClick={() => handleAccept(listing)}
                                    disabled={belowMSP || accepting === listing.listingId}
                                    title={belowMSP ? 'This offer is below the minimum support price' : ''}
                                    style={{
                                        background: belowMSP ? '#BDBDBD' : '#2E7D32', color: 'white',
                                        fontWeight: 700, fontSize: '15px', borderRadius: '9999px',
                                        padding: '14px 28px', width: '100%', minHeight: '52px',
                                        border: 'none', cursor: belowMSP ? 'not-allowed' : 'pointer',
                                    }}
                                >
                                    {accepting === listing.listingId ? 'Accepting...' : belowMSP ? 'Below MSP — Cannot Accept' : 'Accept Offer'}
                                </button>
                            </div>
                        );
                    })
                )}
            </div>

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

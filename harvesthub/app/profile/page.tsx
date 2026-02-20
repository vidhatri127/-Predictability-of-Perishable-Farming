'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { useT, type Lang } from '@/contexts/LangContext';
import BottomNavBar from '@/components/BottomNavBar';

interface UserProfile {
    name: string;
    phone: string;
    role: string;
    district: string;
    mandal: string;
    language: Lang;
}

export default function ProfilePage() {
    const router = useRouter();
    const { user, loading } = useAuth();
    const { t, lang, setLang } = useT();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [savingLang, setSavingLang] = useState(false);

    useEffect(() => {
        if (!loading && !user) { router.push('/'); return; }
        if (!user) return;
        getDoc(doc(db, 'users', user.uid)).then(snap => {
            if (snap.exists()) setProfile(snap.data() as UserProfile);
        }).catch(() => { });
    }, [user, loading, router]);

    const handleLanguageChange = async (l: Lang) => {
        setSavingLang(true);
        setLang(l); // <500ms — instant UI change
        if (user) {
            try {
                await updateDoc(doc(db, 'users', user.uid), { language: l });
            } catch { /* silent */ }
        }
        setSavingLang(false);
    };

    const handleLogout = async () => {
        await signOut(auth);
        router.push('/');
    };

    if (loading || !profile) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F7F7F7' }}>
                <div style={{ width: '32px', height: '32px', border: '3px solid #E8E8E8', borderTopColor: '#2E7D32', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    const LANGUAGES: { value: Lang; label: string; native: string }[] = [
        { value: 'te', label: 'Telugu', native: 'తెలుగు' },
        { value: 'hi', label: 'Hindi', native: 'हिंदी' },
        { value: 'en', label: 'English', native: 'English' },
    ];

    return (
        <div style={{ minHeight: '100vh', background: '#F7F7F7', fontFamily: 'system-ui, -apple-system, sans-serif', paddingBottom: '80px' }}>
            {/* Header */}
            <div style={{ background: '#2E7D32', padding: '20px 20px 40px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                    <span style={{ fontSize: '20px' }}>🌾</span>
                    <span style={{ fontWeight: 800, fontSize: '17px', color: 'white' }}>HarvestHub</span>
                </div>
                {/* Avatar */}
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <div style={{
                        width: '64px', height: '64px', borderRadius: '50%',
                        background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', fontSize: '28px', flexShrink: 0,
                    }}>
                        {profile.role === 'farmer' ? '👨‍🌾' : '🏪'}
                    </div>
                    <div>
                        <div style={{ color: 'white', fontWeight: 800, fontSize: '20px' }}>{profile.name}</div>
                        <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: '14px', marginTop: '2px' }}>
                            {profile.phone} · {profile.role === 'farmer' ? t('common.farmer') : t('common.buyer')}
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ padding: '0 16px', marginTop: '-16px', maxWidth: '480px', margin: '-16px auto 0' }}>

                {/* Location card */}
                <div style={{ background: 'white', borderRadius: '16px', padding: '20px', marginBottom: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                    <p style={{ fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#2E7D32', marginBottom: '12px' }}>LOCATION</p>
                    <div style={{ display: 'flex', gap: '24px' }}>
                        <div>
                            <div style={{ fontSize: '11px', color: '#616161', marginBottom: '2px' }}>{t('profile.district')}</div>
                            <div style={{ fontWeight: 700, color: '#1B1B1B', fontSize: '15px' }}>{profile.district}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '11px', color: '#616161', marginBottom: '2px' }}>{t('profile.mandal')}</div>
                            <div style={{ fontWeight: 700, color: '#1B1B1B', fontSize: '15px' }}>{profile.mandal}</div>
                        </div>
                    </div>
                </div>

                {/* Language card */}
                <div style={{ background: 'white', borderRadius: '16px', padding: '20px', marginBottom: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <p style={{ fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#2E7D32', margin: 0 }}>
                            {t('profile.language').toUpperCase()}
                        </p>
                        {savingLang && <span style={{ fontSize: '11px', color: '#9E9E9E' }}>Saving…</span>}
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {LANGUAGES.map(l => (
                            <button
                                key={l.value}
                                onClick={() => handleLanguageChange(l.value)}
                                style={{
                                    borderRadius: '9999px', padding: '10px 18px', fontWeight: 700,
                                    fontSize: '14px', cursor: 'pointer', minHeight: '44px',
                                    border: lang === l.value ? 'none' : '1px solid #E8E8E8',
                                    background: lang === l.value ? '#2E7D32' : '#F7F7F7',
                                    color: lang === l.value ? 'white' : '#616161',
                                    transition: 'all 150ms ease',
                                }}
                            >
                                {l.native}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Logout */}
                <button
                    onClick={handleLogout}
                    style={{
                        width: '100%', padding: '16px', borderRadius: '16px',
                        background: 'white', border: '1.5px solid #FFCDD2',
                        color: '#D32F2F', fontWeight: 700, fontSize: '15px',
                        cursor: 'pointer', minHeight: '52px', display: 'flex',
                        alignItems: 'center', justifyContent: 'center', gap: '8px',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                    }}
                >
                    🚪 {t('profile.logout')}
                </button>
            </div>

            <BottomNavBar />
        </div>
    );
}

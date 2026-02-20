'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { CropType, SoilType, Language } from '@/lib/types';
import { useT } from '@/contexts/LangContext';
import VoiceInputButton from '@/components/VoiceInputButton';

const DISTRICTS = ['Warangal', 'Nizamabad', 'Karimnagar', 'Nalgonda', 'Khammam'];
const MANDALS: Record<string, string[]> = {
    Warangal: ['Warangal Urban', 'Hanamkonda', 'Kazipet', 'Parkal', 'Narsampet'],
    Nizamabad: ['Nizamabad Urban', 'Armoor', 'Bodhan', 'Kamareddy', 'Balkonda'],
    Karimnagar: ['Karimnagar Urban', 'Huzurabad', 'Jagtial', 'Metpally', 'Siricilla'],
    Nalgonda: ['Nalgonda Urban', 'Miryalaguda', 'Suryapet', 'Bhongir', 'Yadagirigutta'],
    Khammam: ['Khammam Urban', 'Kothagudem', 'Bhadrachalam', 'Sattupalli', 'Wyra'],
};
const CROPS: { value: CropType; label: string; emoji: string }[] = [
    { value: 'paddy', label: 'Paddy', emoji: '🌾' },
    { value: 'cotton', label: 'Cotton', emoji: '🌿' },
    { value: 'maize', label: 'Maize', emoji: '🌽' },
    { value: 'turmeric', label: 'Turmeric', emoji: '🟡' },
    { value: 'red_chilli', label: 'Red Chilli', emoji: '🌶️' },
];
const DEFAULT_VIABILITY: Record<CropType, number> = {
    paddy: 14, cotton: 21, maize: 10, turmeric: 30, red_chilli: 7,
};

function OnboardingContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const role = searchParams.get('role') || 'farmer';
    const { t, lang, setLang } = useT();

    const [step, setStep] = useState(1);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Step 1 fields
    const [name, setName] = useState('');
    const [district, setDistrict] = useState('');
    const [mandal, setMandal] = useState('');
    const [language, setLanguage] = useState<Language>('te');

    // Step 2 fields (farmer only)
    const [crops, setCrops] = useState<CropType[]>([]);
    const [variety, setVariety] = useState('');
    const [sownDate, setSownDate] = useState('');
    const [fieldSize, setFieldSize] = useState('');
    const [soilType, setSoilType] = useState<SoilType | ''>('');

    const toggleCrop = (crop: CropType) => {
        if (crops.includes(crop)) {
            setCrops(crops.filter(c => c !== crop));
        } else if (crops.length < 3) {
            setCrops([...crops, crop]);
        } else {
            setError(t('onboarding.cropType') + ' (max 3)');
            setTimeout(() => setError(''), 2000);
        }
    };

    const handleLanguageChange = (l: Language) => {
        setLanguage(l);
        setLang(l);
    };

    const handleStep1 = () => {
        if (!name.trim()) { setError(t('onboarding.fullName') + ' is required.'); return; }
        if (!district) { setError(t('onboarding.district') + ' is required.'); return; }
        if (!mandal) { setError(t('onboarding.mandal') + ' is required.'); return; }
        setError('');
        if (role === 'buyer') { handleSubmit(); return; }
        setStep(2);
    };

    const handleSubmit = async () => {
        if (role === 'farmer') {
            if (crops.length === 0) { setError('Please select at least one crop.'); return; }
            if (!variety.trim()) { setError('Please enter the crop variety.'); return; }
            if (!sownDate) { setError('Please select the sown date.'); return; }
            if (!fieldSize || isNaN(Number(fieldSize))) { setError('Please enter field size in acres.'); return; }
            if (!soilType) { setError('Please select soil type.'); return; }
        }
        setError('');
        setLoading(true);

        const user = auth.currentUser;
        if (!user) { router.push('/auth'); return; }

        try {
            await setDoc(doc(db, 'users', user.uid), {
                uid: user.uid,
                name: name.trim(),
                phone: user.phoneNumber || '',
                role,
                district,
                mandal,
                language,
                createdAt: serverTimestamp(),
            });

            if (role === 'farmer') {
                const primaryCrop = crops[0];
                await setDoc(doc(db, 'farmers', user.uid), {
                    uid: user.uid,
                    crop: primaryCrop,
                    variety: variety.trim(),
                    sownDate,
                    fieldSize_acres: Number(fieldSize),
                    soilType,
                    district,
                    mandal,
                    expectedQtl: null,
                    quantityConfirmed: false,
                    viability_days: DEFAULT_VIABILITY[primaryCrop],
                    harvestWeek: 1,
                    status: 'growing',
                    estimatedPrice: null,
                    actualPrice: null,
                });
                router.push('/dashboard');
            } else {
                await setDoc(doc(db, 'buyers', user.uid), {
                    uid: user.uid,
                    businessName: name.trim(),
                    district,
                    phone: user.phoneNumber || '',
                });
                router.push('/buyer/dashboard');
            }
        } catch {
            setError(t('common.error'));
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = {
        flex: 1, padding: '14px 16px', fontSize: '15px',
        border: 'none', outline: 'none', color: '#1B1B1B', background: 'transparent',
        fontFamily: 'inherit', minWidth: 0,
    };
    const inputWrapStyle = {
        display: 'flex', alignItems: 'center',
        border: '1px solid #E8E8E8', borderRadius: '12px',
        background: 'white', overflow: 'hidden',
    };
    const selectStyle = {
        width: '100%', padding: '14px 16px', fontSize: '15px',
        border: '1px solid #E8E8E8', borderRadius: '12px', outline: 'none',
        color: '#1B1B1B', background: 'white', appearance: 'none' as const,
        fontFamily: 'inherit',
    };
    const labelStyle = {
        fontWeight: 700, fontSize: '11px', textTransform: 'uppercase' as const,
        letterSpacing: '0.1em', color: '#2E7D32', display: 'block', marginBottom: '6px'
    };
    const pillActive = {
        background: '#2E7D32', color: 'white', border: 'none',
        borderRadius: '9999px', padding: '10px 18px', fontWeight: 700,
        fontSize: '14px', cursor: 'pointer', minHeight: '40px',
    };
    const pillInactive = {
        background: '#F7F7F7', color: '#616161', border: '1px solid #E8E8E8',
        borderRadius: '9999px', padding: '10px 18px', fontWeight: 600,
        fontSize: '14px', cursor: 'pointer', minHeight: '40px',
    };

    return (
        <div style={{ minHeight: '100vh', background: '#F7F7F7', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
            {/* Header */}
            <div style={{ background: 'white', borderBottom: '1px solid #E8E8E8', padding: '16px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <span style={{ fontSize: '20px' }}>🌾</span>
                    <span style={{ fontWeight: 800, fontSize: '17px', color: '#0A0A0A' }}>HarvestHub</span>
                </div>
                {role === 'farmer' && (
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        {[1, 2].map(s => (
                            <div key={s} style={{
                                width: s === step ? '24px' : '8px', height: '8px',
                                borderRadius: '9999px',
                                background: s <= step ? '#2E7D32' : '#E8E8E8',
                                transition: 'all 200ms ease'
                            }} />
                        ))}
                        <span style={{ fontSize: '12px', color: '#616161', marginLeft: '4px' }}>
                            {t('onboarding.stepOf', { step: String(step) })}
                        </span>
                    </div>
                )}
            </div>

            <div style={{ padding: '24px 16px', maxWidth: '480px', margin: '0 auto' }}>
                {step === 1 ? (
                    <div>
                        <p style={{ fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#2E7D32', marginBottom: '8px' }}>
                            {t('onboarding.yourDetails')}
                        </p>
                        <h2 style={{ fontWeight: 800, fontSize: '22px', color: '#0A0A0A', marginBottom: '28px', letterSpacing: '-0.02em' }}>
                            {t('onboarding.tellUs')}
                        </h2>

                        {/* Name + voice */}
                        <div style={{ marginBottom: '16px' }}>
                            <label style={labelStyle}>{t('onboarding.fullName')}</label>
                            <div style={inputWrapStyle}>
                                <input
                                    style={inputStyle}
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    placeholder={t('onboarding.namePlaceholder')}
                                />
                                <div style={{ paddingRight: '8px' }}>
                                    <VoiceInputButton lang={lang} onResult={setName} />
                                </div>
                            </div>
                        </div>

                        {/* Role badge */}
                        <div style={{ marginBottom: '16px' }}>
                            <label style={labelStyle}>{t('onboarding.role')}</label>
                            <span style={{
                                background: role === 'farmer' ? '#2E7D32' : '#F7F7F7',
                                color: role === 'farmer' ? 'white' : '#616161',
                                padding: '6px 14px', borderRadius: '9999px', fontSize: '13px', fontWeight: 700
                            }}>
                                {role === 'farmer' ? '🌱 ' + t('common.farmer') : '🏪 ' + t('common.buyer')}
                            </span>
                        </div>

                        {/* District */}
                        <div style={{ marginBottom: '16px' }}>
                            <label style={labelStyle}>{t('onboarding.district')}</label>
                            <select style={selectStyle} value={district} onChange={e => { setDistrict(e.target.value); setMandal(''); }}>
                                <option value="">{t('onboarding.selectDistrict')}</option>
                                {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>

                        {/* Mandal */}
                        <div style={{ marginBottom: '16px' }}>
                            <label style={labelStyle}>{t('onboarding.mandal')}</label>
                            <select style={selectStyle} value={mandal} onChange={e => setMandal(e.target.value)} disabled={!district}>
                                <option value="">{t('onboarding.selectMandal')}</option>
                                {district && MANDALS[district]?.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                        </div>

                        {/* Language */}
                        <div style={{ marginBottom: '24px' }}>
                            <label style={labelStyle}>{t('onboarding.language')}</label>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                {([{ value: 'te', label: 'తెలుగు' }, { value: 'hi', label: 'हिंदी' }, { value: 'en', label: 'English' }] as const).map(l => (
                                    <button key={l.value}
                                        onClick={() => handleLanguageChange(l.value)}
                                        style={language === l.value ? pillActive : pillInactive}>
                                        {l.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {error && <p style={{ color: '#C62828', fontSize: '13px', marginBottom: '12px' }}>{error}</p>}

                        <button onClick={handleStep1} style={{
                            background: '#2E7D32', color: 'white', fontWeight: 700, fontSize: '15px',
                            borderRadius: '9999px', padding: '14px 28px', width: '100%', minHeight: '52px',
                            border: 'none', cursor: 'pointer'
                        }}>
                            {role === 'buyer' ? (loading ? t('onboarding.saving') : t('onboarding.completeSetup')) : t('onboarding.continue')}
                        </button>
                    </div>
                ) : (
                    <div>
                        <p style={{ fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#2E7D32', marginBottom: '8px' }}>
                            {t('onboarding.yourCrop')}
                        </p>
                        <h2 style={{ fontWeight: 800, fontSize: '22px', color: '#0A0A0A', marginBottom: '28px', letterSpacing: '-0.02em' }}>
                            {t('onboarding.tellFarm')}
                        </h2>

                        {/* Crop multi-select */}
                        <div style={{ marginBottom: '16px' }}>
                            <label style={labelStyle}>{t('onboarding.cropType')}</label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                {CROPS.map(c => (
                                    <button key={c.value} onClick={() => toggleCrop(c.value)}
                                        style={crops.includes(c.value) ? pillActive : pillInactive}>
                                        {c.emoji} {c.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Variety + voice */}
                        <div style={{ marginBottom: '16px' }}>
                            <label style={labelStyle}>{t('onboarding.variety')}</label>
                            <div style={inputWrapStyle}>
                                <input
                                    style={inputStyle}
                                    value={variety}
                                    onChange={e => setVariety(e.target.value)}
                                    placeholder={t('onboarding.varietyPlaceholder')}
                                />
                                <div style={{ paddingRight: '8px' }}>
                                    <VoiceInputButton lang={lang} onResult={setVariety} />
                                </div>
                            </div>
                        </div>

                        {/* Sown Date */}
                        <div style={{ marginBottom: '16px' }}>
                            <label style={labelStyle}>{t('onboarding.sownDate')}</label>
                            <input type="date" style={{ ...selectStyle }} value={sownDate} onChange={e => setSownDate(e.target.value)} />
                        </div>

                        {/* Field size + voice */}
                        <div style={{ marginBottom: '16px' }}>
                            <label style={labelStyle}>{t('onboarding.fieldSize')}</label>
                            <div style={inputWrapStyle}>
                                <input
                                    type="number"
                                    style={inputStyle}
                                    value={fieldSize}
                                    onChange={e => setFieldSize(e.target.value)}
                                    placeholder={t('onboarding.fieldSizePlaceholder')}
                                    min="0.1" step="0.1"
                                />
                                <div style={{ paddingRight: '8px' }}>
                                    <VoiceInputButton lang={lang} onResult={setFieldSize} />
                                </div>
                            </div>
                        </div>

                        {/* Soil type */}
                        <div style={{ marginBottom: '24px' }}>
                            <label style={labelStyle}>{t('onboarding.soilType')}</label>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                {(['black_cotton', 'red_loam'] as SoilType[]).map(s => (
                                    <button key={s} onClick={() => setSoilType(s)}
                                        style={soilType === s ? pillActive : pillInactive}>
                                        {s === 'black_cotton' ? t('onboarding.blackCotton') : t('onboarding.redLoam')}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {error && <p style={{ color: '#C62828', fontSize: '13px', marginBottom: '12px' }}>{error}</p>}

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button onClick={() => setStep(1)} style={{
                                background: 'transparent', color: '#1B1B1B', fontWeight: 700, fontSize: '15px',
                                borderRadius: '9999px', padding: '14px 20px', minHeight: '52px',
                                border: '1.5px solid #1B1B1B', cursor: 'pointer', flex: '0 0 auto'
                            }}>
                                {t('onboarding.back')}
                            </button>
                            <button onClick={handleSubmit} disabled={loading} style={{
                                background: loading ? '#BDBDBD' : '#2E7D32', color: 'white', fontWeight: 700, fontSize: '15px',
                                borderRadius: '9999px', padding: '14px 28px', flex: 1, minHeight: '52px',
                                border: 'none', cursor: loading ? 'not-allowed' : 'pointer'
                            }}>
                                {loading ? t('onboarding.saving') : t('onboarding.startFarming')}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function OnboardingPage() {
    return (
        <Suspense fallback={
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F7F7F7' }}>
                <div style={{ width: '32px', height: '32px', border: '3px solid #E8E8E8', borderTopColor: '#2E7D32', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        }>
            <OnboardingContent />
        </Suspense>
    );
}

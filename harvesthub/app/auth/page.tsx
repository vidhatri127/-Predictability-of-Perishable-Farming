'use client';

import { Suspense, useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

const ERROR_MESSAGES: Record<string, string> = {
    'auth/invalid-phone-number': 'Please enter a valid 10-digit Indian mobile number.',
    'auth/too-many-requests': 'Too many attempts. Please wait a few minutes and try again.',
    'auth/code-expired': 'OTP has expired. Please request a new one.',
    'auth/invalid-verification-code': 'Incorrect OTP. Please check and try again.',
    'auth/quota-exceeded': 'SMS service temporarily unavailable. Please try again later.',
    'auth/missing-phone-number': 'Phone number is required.',
    'auth/captcha-check-failed': 'reCAPTCHA check failed. Please refresh and try again.',
    'auth/app-not-authorized': 'This app is not authorized. Please contact support.',
    'auth/network-request-failed': 'Network error. Please check your connection.',
};

function AuthPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const role = searchParams.get('role') || 'farmer';

    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState<'phone' | 'otp'>('phone');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
    const recaptchaRef = useRef<RecaptchaVerifier | null>(null);
    const recaptchaContainerRef = useRef<HTMLDivElement | null>(null);

    // Setup reCAPTCHA on a dedicated invisible div (NOT on the button)
    const setupRecaptcha = () => {
        // Cleanup any existing instance
        if (recaptchaRef.current) {
            try { recaptchaRef.current.clear(); } catch { }
            recaptchaRef.current = null;
        }
        // Remove old recaptcha container contents
        const container = document.getElementById('recaptcha-container');
        if (container) container.innerHTML = '';

        recaptchaRef.current = new RecaptchaVerifier(auth, 'recaptcha-container', {
            size: 'invisible',
            callback: () => { },
            'expired-callback': () => {
                setError('reCAPTCHA expired. Please try again.');
                setupRecaptcha();
            },
        });
    };

    useEffect(() => {
        // Small delay to ensure DOM is fully ready
        const timer = setTimeout(() => {
            setupRecaptcha();
        }, 300);
        return () => {
            clearTimeout(timer);
            if (recaptchaRef.current) {
                try { recaptchaRef.current.clear(); } catch { }
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSendOTP = async () => {
        setError('');
        const cleaned = phone.replace(/\D/g, '');
        if (cleaned.length !== 10) {
            setError('Please enter a valid 10-digit Indian mobile number.');
            return;
        }
        setLoading(true);
        try {
            const fullPhone = `+91${cleaned}`;

            // Ensure reCAPTCHA is initialized
            if (!recaptchaRef.current) {
                setupRecaptcha();
                await new Promise(resolve => setTimeout(resolve, 500));
            }

            const verifier = recaptchaRef.current!;
            const result = await signInWithPhoneNumber(auth, fullPhone, verifier);
            setConfirmationResult(result);
            setStep('otp');
        } catch (err: unknown) {
            const code = (err as { code?: string }).code || '';
            const message = (err as { message?: string }).message || '';
            console.error('[HarvestHub Auth] OTP send error:', code, message);
            setError(ERROR_MESSAGES[code] || `Failed to send OTP. (${code || 'unknown error'})`);
            // Always reset reCAPTCHA after error
            setupRecaptcha();
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async () => {
        setError('');
        if (otp.length !== 6) {
            setError('Please enter the 6-digit OTP.');
            return;
        }
        setLoading(true);

        // Step 1: Verify OTP with Firebase Auth
        let uid: string;
        try {
            const result = await confirmationResult!.confirm(otp);
            uid = result.user.uid;
        } catch (err: unknown) {
            const code = (err as { code?: string }).code || '';
            console.error('[HarvestHub Auth] OTP verify error:', code);
            setError(ERROR_MESSAGES[code] || `Incorrect OTP or session expired. Please try again. (${code})`);
            setLoading(false);
            return;
        }

        // Step 2: Check Firestore for existing user — if Firestore unavailable, go to onboarding
        try {
            const userDoc = await getDoc(doc(db, 'users', uid));
            if (userDoc.exists()) {
                const userData = userDoc.data();
                router.push(userData.role === 'buyer' ? '/buyer/dashboard' : '/dashboard');
            } else {
                router.push(`/onboarding?role=${role}`);
            }
        } catch (fsErr: unknown) {
            const code = (fsErr as { code?: string }).code || '';
            console.error('[HarvestHub Auth] Firestore check error:', code);
            // Firestore not set up yet, or offline — route to onboarding as safe default
            router.push(`/onboarding?role=${role}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh', background: '#FFFFFF', display: 'flex',
            flexDirection: 'column', alignItems: 'center', padding: '48px 24px',
            fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
            {/* Invisible reCAPTCHA container — MUST be in the DOM */}
            <div id="recaptcha-container" ref={recaptchaContainerRef} style={{ display: 'none' }} />

            {/* Logo */}
            <div style={{ marginBottom: '48px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '28px' }}>🌾</span>
                <span style={{ fontWeight: 800, fontSize: '20px', color: '#0A0A0A', letterSpacing: '-0.02em' }}>HarvestHub</span>
            </div>

            <div style={{ width: '100%', maxWidth: '380px' }}>
                {step === 'phone' ? (
                    <>
                        <p style={{ fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#2E7D32', marginBottom: '8px' }}>
                            SECURE LOGIN
                        </p>
                        <h1 style={{ fontWeight: 800, fontSize: '24px', color: '#0A0A0A', letterSpacing: '-0.02em', marginBottom: '32px' }}>
                            Enter your phone number
                        </h1>

                        <div style={{ marginBottom: '8px' }}>
                            <label style={{ fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#2E7D32', display: 'block', marginBottom: '6px' }}>
                                MOBILE NUMBER
                            </label>
                            <div style={{ display: 'flex', border: '1px solid #E8E8E8', borderRadius: '12px', overflow: 'hidden', background: 'white' }}>
                                <span style={{ padding: '14px 12px', background: '#F7F7F7', color: '#616161', fontSize: '15px', borderRight: '1px solid #E8E8E8', fontWeight: 600 }}>+91</span>
                                <input
                                    type="tel"
                                    inputMode="numeric"
                                    maxLength={10}
                                    value={phone}
                                    onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                    placeholder="9876543210"
                                    style={{ flex: 1, padding: '14px 16px', fontSize: '15px', border: 'none', outline: 'none', color: '#1B1B1B' }}
                                    onKeyDown={e => e.key === 'Enter' && handleSendOTP()}
                                />
                            </div>
                        </div>

                        {error && (
                            <div style={{ background: '#FFF3F3', border: '1px solid #FFCDD2', borderRadius: '10px', padding: '12px 14px', marginTop: '12px' }}>
                                <p style={{ color: '#C62828', fontSize: '13px', fontWeight: 500, margin: 0 }}>⚠️ {error}</p>
                            </div>
                        )}

                        <div style={{ marginTop: '24px' }}>
                            <button
                                id="send-otp-btn"
                                onClick={handleSendOTP}
                                disabled={loading}
                                style={{
                                    background: loading ? '#BDBDBD' : '#2E7D32', color: 'white',
                                    fontWeight: 700, fontSize: '15px', borderRadius: '9999px',
                                    padding: '14px 28px', width: '100%', minHeight: '52px',
                                    border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                                }}
                            >
                                {loading ? (
                                    <>
                                        <span style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                                        Sending OTP...
                                    </>
                                ) : 'Send OTP →'}
                            </button>
                        </div>

                        <p style={{ color: '#BDBDBD', fontSize: '12px', textAlign: 'center', marginTop: '16px' }}>
                            You&apos;ll receive a one-time code via SMS
                        </p>
                    </>
                ) : (
                    <>
                        <p style={{ fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#2E7D32', marginBottom: '8px' }}>
                            VERIFICATION
                        </p>
                        <h1 style={{ fontWeight: 800, fontSize: '24px', color: '#0A0A0A', letterSpacing: '-0.02em', marginBottom: '8px' }}>
                            Enter the 6-digit code
                        </h1>
                        <p style={{ color: '#616161', fontSize: '14px', marginBottom: '32px' }}>
                            Sent to +91 {phone}
                        </p>

                        <div style={{ marginBottom: '8px' }}>
                            <label style={{ fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#2E7D32', display: 'block', marginBottom: '6px' }}>
                                OTP CODE
                            </label>
                            <input
                                type="tel"
                                inputMode="numeric"
                                maxLength={6}
                                value={otp}
                                onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                placeholder="• • • • • •"
                                autoFocus
                                style={{
                                    width: '100%', padding: '16px', fontSize: '24px', letterSpacing: '0.3em',
                                    textAlign: 'center', border: '1px solid #E8E8E8', borderRadius: '12px',
                                    outline: 'none', color: '#1B1B1B', background: 'white', boxSizing: 'border-box'
                                }}
                                onKeyDown={e => e.key === 'Enter' && handleVerifyOTP()}
                            />
                        </div>

                        {error && (
                            <div style={{ background: '#FFF3F3', border: '1px solid #FFCDD2', borderRadius: '10px', padding: '12px 14px', marginTop: '12px' }}>
                                <p style={{ color: '#C62828', fontSize: '13px', fontWeight: 500, margin: 0 }}>⚠️ {error}</p>
                            </div>
                        )}

                        <div style={{ marginTop: '24px' }}>
                            <button
                                onClick={handleVerifyOTP}
                                disabled={loading}
                                style={{
                                    background: loading ? '#BDBDBD' : '#2E7D32', color: 'white',
                                    fontWeight: 700, fontSize: '15px', borderRadius: '9999px',
                                    padding: '14px 28px', width: '100%', minHeight: '52px',
                                    border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                                }}
                            >
                                {loading ? (
                                    <>
                                        <span style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                                        Verifying...
                                    </>
                                ) : 'Verify OTP →'}
                            </button>
                        </div>

                        <button
                            onClick={() => {
                                setStep('phone');
                                setError('');
                                setOtp('');
                                setupRecaptcha();
                            }}
                            style={{
                                background: 'none', border: 'none', color: '#616161', fontSize: '14px',
                                cursor: 'pointer', textDecoration: 'underline', marginTop: '16px', padding: '8px 0',
                                display: 'block', width: '100%', textAlign: 'center'
                            }}
                        >
                            ← Change phone number
                        </button>
                    </>
                )}

                {/* Role indicator */}
                <div style={{ marginTop: '32px', textAlign: 'center' }}>
                    <span style={{
                        background: role === 'farmer' ? '#2E7D32' : '#F7F7F7',
                        color: role === 'farmer' ? 'white' : '#616161',
                        padding: '4px 12px', borderRadius: '9999px', fontSize: '12px', fontWeight: 700
                    }}>
                        {role === 'farmer' ? '🌱 Logging in as Farmer' : '🏪 Logging in as Buyer'}
                    </span>
                </div>
            </div>

            <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
        </div>
    );
}

export default function AuthPage() {
    return (
        <Suspense fallback={
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '32px', height: '32px', border: '3px solid #E8E8E8', borderTopColor: '#2E7D32', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        }>
            <AuthPageContent />
        </Suspense>
    );
}

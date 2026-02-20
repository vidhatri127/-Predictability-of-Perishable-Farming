'use client';

import { useVoiceInput } from '@/hooks/useVoiceInput';
import type { Lang } from '@/contexts/LangContext';

interface VoiceInputButtonProps {
    onResult: (text: string) => void;
    lang?: Lang;
    /** Size in px — defaults to 40 */
    size?: number;
}

const LANG_MAP: Record<Lang, 'te-IN' | 'hi-IN' | 'en-IN'> = {
    te: 'te-IN',
    hi: 'hi-IN',
    en: 'en-IN',
};

export default function VoiceInputButton({ onResult, lang = 'te', size = 40 }: VoiceInputButtonProps) {
    const speechLang = LANG_MAP[lang];
    const { status, start, isSupported } = useVoiceInput({ lang: speechLang, onResult, maxSeconds: 5 });

    // Silent no-op if unsupported
    if (!isSupported) return null;

    const isListening = status === 'listening';

    return (
        <button
            type="button"
            onClick={start}
            aria-label={isListening ? 'Stop recording' : 'Start voice input'}
            style={{
                width: `${size}px`,
                height: `${size}px`,
                minWidth: `${size}px`,
                borderRadius: '50%',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: isListening
                    ? 'rgba(211, 47, 47, 0.12)'
                    : 'rgba(46, 125, 50, 0.08)',
                color: isListening ? '#D32F2F' : '#2E7D32',
                position: 'relative',
                flexShrink: 0,
                transition: 'background 200ms ease',
            }}
        >
            {/* Pulsing ring when listening */}
            {isListening && (
                <span style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: '50%',
                    border: '2px solid #D32F2F',
                    animation: 'pulse-ring 1s ease-out infinite',
                    opacity: 0.6,
                }} />
            )}

            {/* Mic icon */}
            <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
            </svg>

            <style>{`
        @keyframes pulse-ring {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(1.6); opacity: 0; }
        }
      `}</style>
        </button>
    );
}

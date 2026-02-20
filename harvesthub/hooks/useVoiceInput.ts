'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

type SpeechStatus = 'idle' | 'listening' | 'unsupported';

interface UseVoiceInputOptions {
    lang?: 'te-IN' | 'hi-IN' | 'en-IN';
    maxSeconds?: number;
    onResult?: (transcript: string) => void;
}

interface UseVoiceInputReturn {
    status: SpeechStatus;
    start: () => void;
    stop: () => void;
    isSupported: boolean;
}

// Use 'unknown' to avoid missing browser types in strict TS
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRecognition = any;

function getSpeechRecognitionCtor(): (new () => AnyRecognition) | null {
    if (typeof window === 'undefined') return null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function useVoiceInput({
    lang = 'te-IN',
    maxSeconds = 5,
    onResult,
}: UseVoiceInputOptions = {}): UseVoiceInputReturn {
    const [status, setStatus] = useState<SpeechStatus>('idle');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recognitionRef = useRef<any>(null);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const isSupported = getSpeechRecognitionCtor() !== null;

    const stop = useCallback(() => {
        if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
        if (recognitionRef.current) {
            try { recognitionRef.current.stop(); } catch { /* ignore */ }
            recognitionRef.current = null;
        }
        setStatus('idle');
    }, []);

    const start = useCallback(() => {
        const Ctor = getSpeechRecognitionCtor();
        if (!Ctor) { setStatus('unsupported'); return; }
        if (status === 'listening') { stop(); return; }

        const recognition = new Ctor();
        recognition.lang = lang;
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
        recognitionRef.current = recognition;

        recognition.onstart = () => setStatus('listening');

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recognition.onresult = (event: any) => {
            const transcript: string = event.results?.[0]?.[0]?.transcript ?? '';
            setStatus('idle');
            if (transcript) onResult?.(transcript);
        };

        recognition.onerror = () => { stop(); };
        recognition.onend = () => { stop(); };

        try {
            recognition.start();
            timerRef.current = setTimeout(() => stop(), maxSeconds * 1000);
        } catch { stop(); }
    }, [lang, maxSeconds, onResult, status, stop]);

    useEffect(() => () => { stop(); }, [stop]);

    return { status, start, stop, isSupported };
}

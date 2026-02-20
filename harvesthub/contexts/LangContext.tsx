'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

type Lang = 'te' | 'hi' | 'en';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Translations = Record<string, any>;

interface LangContextType {
    lang: Lang;
    setLang: (lang: Lang) => void;
    t: (key: string, vars?: Record<string, string | number>) => string;
}

const LangContext = createContext<LangContextType>({
    lang: 'te',
    setLang: () => { },
    t: (key) => key,
});

/** Resolve a dot-notated key like "dashboard.hello" against the translations object */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function resolve(obj: Translations, key: string): any {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return key.split('.').reduce((acc: any, part: string) => (acc != null ? acc[part] : undefined), obj as Translations);
}

/** Replace {{var}} placeholders */
function interpolate(str: string, vars?: Record<string, string | number>): string {
    if (!vars) return str;
    return str.replace(/\{\{(\w+)\}\}/g, (_, k) => String(vars[k] ?? `{{${k}}}`));
}

export function LangProvider({ children }: { children: ReactNode }) {
    const [lang, setLangState] = useState<Lang>('te');
    const [translations, setTranslations] = useState<Translations>({});

    // Load locale JSON from /public/locales/<lang>.json
    const loadLocale = useCallback(async (l: Lang) => {
        try {
            const res = await fetch(`/locales/${l}.json`);
            if (!res.ok) throw new Error('not found');
            setTranslations(await res.json());
        } catch {
            // Fallback — try English
            try {
                const res = await fetch(`/locales/en.json`);
                setTranslations(await res.json());
            } catch { /* silent */ }
        }
    }, []);

    useEffect(() => {
        // Read saved preference from localStorage
        const saved = (typeof localStorage !== 'undefined' && localStorage.getItem('hh_lang')) as Lang | null;
        const initial = saved || 'te';
        setLangState(initial);
        loadLocale(initial);
    }, [loadLocale]);

    const setLang = useCallback((l: Lang) => {
        setLangState(l);
        localStorage.setItem('hh_lang', l);
        loadLocale(l);
    }, [loadLocale]);

    const t = useCallback((key: string, vars?: Record<string, string | number>): string => {
        const raw = resolve(translations, key);
        if (typeof raw !== 'string') return key;
        return interpolate(raw, vars);
    }, [translations]);

    return (
        <LangContext.Provider value={{ lang, setLang, t }}>
            {children}
        </LangContext.Provider>
    );
}

export function useT() {
    return useContext(LangContext);
}

export type { Lang };

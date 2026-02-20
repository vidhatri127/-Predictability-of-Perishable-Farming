'use client';

import { usePathname, useRouter } from 'next/navigation';

const tabs = [
    { path: '/dashboard', label: 'Dashboard', icon: '🏠' },
    { path: '/market', label: 'Market', icon: '📈' },
    { path: '/marketplace', label: 'Marketplace', icon: '🤝' },
    { path: '/profile', label: 'Profile', icon: '👤' },
];

export default function BottomNavBar() {
    const pathname = usePathname();
    const router = useRouter();

    const hiddenOn = ['/auth', '/onboarding', '/buyer/dashboard', '/buyer/post-demand', '/'];
    if (hiddenOn.some(p => pathname.startsWith(p) && p !== '/dashboard')) return null;

    return (
        <nav style={{
            position: 'fixed', bottom: 0, left: 0, right: 0,
            height: '60px', background: 'white',
            borderTop: '1px solid #E8E8E8',
            display: 'flex', zIndex: 100,
        }}>
            {tabs.map(tab => {
                const active = pathname === tab.path;
                return (
                    <button
                        key={tab.path}
                        onClick={() => router.push(tab.path)}
                        style={{
                            flex: 1, display: 'flex', flexDirection: 'column',
                            alignItems: 'center', justifyContent: 'center', gap: '2px',
                            border: 'none', background: 'none', cursor: 'pointer',
                            borderTop: active ? '2px solid #2E7D32' : '2px solid transparent',
                            paddingTop: '2px',
                        }}
                    >
                        <span style={{ fontSize: '18px' }}>{tab.icon}</span>
                        <span style={{
                            fontSize: '11px', fontWeight: 600, textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                            color: active ? '#2E7D32' : '#BDBDBD',
                        }}>
                            {tab.label}
                        </span>
                    </button>
                );
            })}
        </nav>
    );
}

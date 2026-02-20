import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { LangProvider } from '@/contexts/LangContext';

export const metadata: Metadata = {
  title: 'HarvestHub — Harvest Smart. Harvest Together.',
  description: 'Empowering Telangana farmers with real-time coordination to maximize income every season.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="te">
      <body>
        <AuthProvider>
          <LangProvider>
            {children}
          </LangProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

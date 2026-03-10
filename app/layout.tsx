import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthSessionProvider } from '@/components/providers/session-provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'GameMatch AI',
  description:
    'AI-powered game recommendation engine that analyzes your gaming preferences, play history, and behavioral patterns to deliver highly personalized game suggestions.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <AuthSessionProvider>{children}</AuthSessionProvider>
      </body>
    </html>
  );
}

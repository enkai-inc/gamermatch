import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthSessionProvider } from '@/components/providers/session-provider';
import { Navbar } from '@/components/layout/navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'GameMatch AI - Find Your Next Favorite Game',
    template: '%s | GameMatch AI',
  },
  description:
    'AI-powered game recommendations based on your unique gaming taste. Discover games you\'ll love with personalized suggestions, price comparison, and mood-based discovery.',
  keywords: [
    'game recommendations',
    'gaming',
    'AI',
    'personalized',
    'game discovery',
    'price comparison',
  ],
  openGraph: {
    title: 'GameMatch AI - Find Your Next Favorite Game',
    description:
      'AI-powered game recommendations based on your unique gaming taste.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GameMatch AI',
    description:
      'AI-powered game recommendations based on your unique gaming taste.',
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <AuthSessionProvider>
          <Navbar isLoggedIn={false} />
          {children}
        </AuthSessionProvider>
      </body>
    </html>
  );
}

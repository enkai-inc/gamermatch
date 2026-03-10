'use client';

import * as React from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';

interface NavbarProps {
  isLoggedIn?: boolean;
}

export function Navbar({ isLoggedIn = false }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 text-lg font-bold text-slate-50">
          <span role="img" aria-label="controller">🎮</span>
          <span>GameMatch</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-6 md:flex">
          {isLoggedIn && (
            <>
              <Link href="/discover" className="text-sm text-slate-300 transition-colors hover:text-emerald-400">
                Discover
              </Link>
              <Link href="/journal" className="text-sm text-slate-300 transition-colors hover:text-emerald-400">
                Journal
              </Link>
              <Link href="/wishlist" className="text-sm text-slate-300 transition-colors hover:text-emerald-400">
                Wishlist
              </Link>
            </>
          )}
        </nav>

        {/* Desktop Right */}
        <div className="hidden items-center gap-3 md:flex">
          {isLoggedIn ? (
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600 text-sm font-semibold text-white">
              U
            </div>
          ) : (
            <>
              <Link href="/login" className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))}>
                Login
              </Link>
              <Link href="/register" className={cn(buttonVariants({ size: 'sm' }))}>
                Register
              </Link>
            </>
          )}
        </div>


        {/* Mobile Toggle */}
        <button
          className="inline-flex items-center justify-center rounded-md p-2 text-slate-300 hover:bg-slate-800 md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="border-t border-slate-800 bg-slate-950 px-4 pb-4 pt-2 md:hidden">
          <nav className="flex flex-col gap-2">
            {isLoggedIn && (
              <>
                <Link href="/discover" className="rounded-md px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-emerald-400">
                  Discover
                </Link>
                <Link href="/journal" className="rounded-md px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-emerald-400">
                  Journal
                </Link>
                <Link href="/wishlist" className="rounded-md px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-emerald-400">
                  Wishlist
                </Link>
              </>
            )}
            <div className="mt-2 flex flex-col gap-2">
              {isLoggedIn ? (
                <div className="flex items-center gap-2 px-3 py-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-sm font-semibold text-white">
                    U
                  </div>
                  <span className="text-sm text-slate-300">User</span>
                </div>
              ) : (
                <>
                  <Link href="/login" className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'justify-start')}>
                    Login
                  </Link>
                  <Link href="/register" className={cn(buttonVariants({ size: 'sm' }), 'justify-start')}>
                    Register
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
Navbar.displayName = 'Navbar';

'use client';

import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';

export function SignOutButton() {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => signOut({ callbackUrl: '/login' })}
      className="text-slate-400 hover:text-slate-200"
    >
      Sign Out
    </Button>
  );
}

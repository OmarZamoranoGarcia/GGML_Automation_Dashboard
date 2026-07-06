'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import InboxIcon from '@mui/icons-material/Inbox';
import { useAuth } from '@/hooks/auth';

const links = [
  { name: 'Inbox', active: true }
];

export default function SideNav() {
  const router = useRouter();
  const { logout } = useAuth();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await logout();
    } finally {
      router.replace('/login');
      router.refresh();
    }
  };

  return (
    <nav className="flex h-full w-56 flex-col justify-between border-r border-[var(--border-subtle)] bg-[var(--bg-primary)] p-6 shadow-sm">
      <div>
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--accent)] text-sm font-semibold text-[var(--bg-primary)]">
            G
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--text-primary)]">GGML</p>
            <p className="text-xs text-[var(--text-secondary)]">Automation Dashboard</p>
          </div>
        </div>

        <ul className="space-y-2">
          {links.map((link) => (
            <li key={link.name}>
              <button
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  link.active
                    ? 'bg-[var(--accent)] text-[var(--bg-primary)] shadow-sm'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-panel)] hover:text-[var(--text-primary)]'
                }`}
              >
                <InboxIcon /> {link.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <button
        type="button"
        onClick={handleSignOut}
        disabled={signingOut}
        className="rounded-lg border border-[var(--border-subtle)] px-4 py-2 text-sm font-medium text-[var(--text-secondary)] transition hover:border-[var(--accent)] hover:text-[var(--accent)] disabled:opacity-60"
      >
        {signingOut ? 'Cerrando sesión...' : 'Sign Out'}
      </button>
    </nav>
  );
}

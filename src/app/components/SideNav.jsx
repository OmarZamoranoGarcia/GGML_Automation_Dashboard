'use client';

import InboxIcon from '@mui/icons-material/Inbox';

const links = [
  { name: 'Inbox', active: true }
];

export default function SideNav() {
  return (
    <nav className="flex h-full w-56 flex-col justify-between border-r border-slate-200 bg-[var(--background)] p-6 shadow-sm">
      <div>
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--primary)] text-sm font-semibold text-white">
            G
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--foreground)]">GGML</p>
            <p className="text-xs text-[var(--secondary)]">Automation Dashboard</p>
          </div>
        </div>

        <ul className="space-y-2">
          {links.map((link) => (
            <li key={link.name}>
              <button
                className={`flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium gap-2 transition ${
                  link.active
                    ? 'bg-[var(--primary)] text-white shadow-sm'
                    : 'text-[var(--secondary)] hover:bg-slate-100 hover:text-[var(--foreground)]'
                }`}
              >
                <InboxIcon/> {link.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <button className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-[var(--secondary)] transition hover:border-[var(--primary)] hover:text-[var(--primary)]">
        Sign Out
      </button>
    </nav>
  );
}
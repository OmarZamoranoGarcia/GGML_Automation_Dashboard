'use client';

import { useState } from 'react';

import SideNav from '@/app/components/SideNav';
import EmailsViewer from '@/app/components/EmailsViewer';
import EmailFilesModal from '@/app/components/EmailFilesModal';

export default function DashboardLayout() {
  const [selectedEmail, setSelectedEmail] = useState(null);

  return (
    <main className="grid h-screen w-screen grid-cols-[14rem_minmax(0,1fr)_minmax(0,1fr)] overflow-hidden">
      <aside className="min-h-0">
        <SideNav />
      </aside>

      <section className="min-h-0 min-w-0">
        <EmailsViewer
          selectedEmailId={selectedEmail?.id}
          onEmailSelect={setSelectedEmail}
        />
      </section>

      <section className="min-h-0 overflow-hidden border-l border-[var(--border-subtle)] bg-[var(--bg-panel)] p-4">
        <EmailFilesModal
          key={selectedEmail?.id || 'empty'}
          email={selectedEmail}
          onClose={() => setSelectedEmail(null)}
        />
      </section>
    </main>
  );
}

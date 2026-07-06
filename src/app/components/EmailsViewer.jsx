'use client';

import { useEffect, useState } from 'react';
import EmailCard from '@/app/components/EmailCard';
import { apiFetch } from '@/app/(auth)/auth.api';

export default function EmailsViewer({ selectedEmailId, onEmailSelect }) {
  const [emails, setEmails] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadEmails() {
      try {
        const response = await apiFetch('/api/emails', { cache: 'no-store' });
        const result = await response.json();

        if (!response.ok || !result.ok) {
          throw new Error(result.error || 'No se pudieron cargar los emails.');
        }

        if (isMounted) {
          setEmails(result.data ?? []);
          setError('');
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'No se pudieron cargar los emails.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadEmails();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="flex h-full min-h-0 flex-col bg-[var(--bg-primary)] p-6">
      <div className="mb-6 flex shrink-0 items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Emails Received</h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            {isLoading ? 'Cargando emails...' : `${emails.length} emails encontrados`}
          </p>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-panel)] shadow-sm">
        {isLoading ? (
          <div className="p-6 text-sm text-[var(--text-secondary)]">Cargando datos desde Supabase...</div>
        ) : error ? (
          <div className="p-6 text-sm font-medium text-[var(--accent)]">{error}</div>
        ) : emails.length === 0 ? (
          <div className="p-6 text-sm text-[var(--text-secondary)]">No hay emails para mostrar.</div>
        ) : (
          <div className="flex flex-col gap-4 p-6">
            {emails.map((email) => (
              <EmailCard
                key={email.id}
                email={email}
                isSelected={email.id === selectedEmailId}
                onSelect={onEmailSelect}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

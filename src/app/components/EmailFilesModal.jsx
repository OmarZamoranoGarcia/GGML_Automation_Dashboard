'use client';

import { useState, useEffect } from 'react';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import CloseIcon from '@mui/icons-material/Close';
import DescriptionIcon from '@mui/icons-material/Description';

import FilePreview from '@/app/components/FilePreview';
import { apiFetch } from '@/app/(auth)/auth.api';

export default function EmailFilesModal({ email, onClose }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    if (!email?.id) {
      return;
    }

    let isMounted = true;

    async function loadFiles() {
      try {
        setLoading(true);
        setError(null);

        const response = await apiFetch(`/api/emails/${email.id}`, { cache: 'no-store' });

        if (!response.ok) {
          const data = await response.json().catch(() => null);
          throw new Error(data?.error || 'Error al cargar archivos');
        }

        const data = await response.json();

        if (isMounted) {
          setFiles(data.files ?? data.data ?? []);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadFiles();

    return () => {
      isMounted = false;
    };
  }, [email?.id]);

  const handleFileClick = (file) => {
    setSelectedFile(file);
  };

  const handleClosePreview = () => {
    setSelectedFile(null);
  };

  const getBadgeColor = (role) => {
    switch (role) {
      case "ORIGINAL":
        return "bg-green-600";
      case "SORT":
        return "bg-blue-600";
      case "OTHER":
        return "bg-[var(--bg-input)]";
      default:
        return "bg-[var(--primary)]";
    }
  };

  if (!email) {
    return (
      <div className="flex h-full items-center justify-center text-center">
        <div className="rounded-lg border border-dashed border-[var(--border-subtle)] bg-[var(--bg-primary)] p-6">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--bg-panel)] text-[var(--accent)]">
            <AttachFileIcon fontSize="small" />
          </div>
          <p className="text-sm font-medium text-[var(--text-primary)]">Sin email seleccionado</p>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Selecciona un email para ver sus archivos adjuntos.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-full min-h-0 flex-col gap-3">
        <div>
          <h2 className="text-lg font-semibold text-[var(--foreground)]">Archivos adjuntos</h2>
          <p className="mt-1 text-sm text-[var(--secondary)]">Cargando archivos...</p>
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map((item) => (
            <div key={item} className="h-14 animate-pulse rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-panel)]" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full min-h-0 flex-col gap-3">
        <div>
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Archivos adjuntos</h2>
          <p className="mt-1 rounded-lg border border-[var(--accent)] bg-[var(--bg-panel)] p-3 text-sm font-medium text-[var(--accent)]">
            Error: {error}
          </p>
        </div>
        <button
          className="inline-flex h-9 items-center gap-2 rounded-md border border-[var(--border-subtle)] px-3 text-sm font-medium text-[var(--text-secondary)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
          onClick={onClose}
          type="button"
        >
          <CloseIcon fontSize="small" />
          Cerrar
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <div className="flex shrink-0 items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-[var(--text-primary)]">Detalles del Email</h2>
        <button
          aria-label="Cerrar detalles"
          className="flex h-9 w-9 items-center justify-center rounded-md border border-[var(--border-subtle)] text-[var(--text-secondary)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
          onClick={onClose}
          type="button"
        >
          <CloseIcon fontSize="small" />
        </button>
      </div>

      {/* Email Details Section */}
      {email && (
        <div className="shrink-0 space-y-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-4">
          {/* Subject */}
          <div>
            <p className="text-xs font-semibold uppercase text-[var(--text-secondary)]">Asunto</p>
            <p className="mt-1 text-sm text-[var(--text-primary)]">{email.subject || '-'}</p>
          </div>

          {/* Date and Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs font-semibold uppercase text-[var(--text-secondary)]">Fecha</p>
              <p className="mt-1 text-sm text-[var(--text-primary)]">
                {email.arrival_at ? new Date(email.arrival_at.replace(' ', 'T')).toLocaleString('es-ES', {
                  timeZone: 'UTC',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                }) : '-'}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-[var(--text-secondary)]">Estado</p>
              <div className="mt-1">
                <span className={`inline-flex rounded-md px-2 py-1 text-xs font-medium ${email.status === 'read' ? 'bg-[var(--bg-input)] text-[var(--text-secondary)]' :
                  email.status === 'unread' ? 'bg-[var(--accent)] bg-opacity-10 text-[var(--accent)]' :
                    'bg-[var(--bg-input)] text-[var(--text-secondary)]'
                  }`}>
                  {email.status || '-'}
                </span>
              </div>
            </div>
          </div>

          {/* Body */}
          {email.body && (
            <div>
              <p className="text-xs font-semibold uppercase text-[var(--text-secondary)]">Cuerpo</p>
              <div className="mt-1 max-h-56 overflow-y-auto overflow-x-hidden rounded-md bg-[var(--bg-input)] p-2 scrollbar-thin-accent">
                <p className="whitespace-pre-wrap break-words text-sm text-[var(--text-primary)]">{email.body}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Files and Preview Grid Section */}
      <div className="min-h-0 flex-1 gap-6 overflow-y-auto scrollbar-thin-accent">
        {/* Files Column */}
        <div className="flex flex-col min-h-0">
          <div className="shrink-0 mb-2">
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">Archivos adjuntos</h3>
            <p className="mt-0.5 text-xs text-[var(--text-secondary)]">{files.length} archivos encontrados</p>
          </div>
          {files.length === 0 ? (
            <div className="rounded-lg border border-dashed border-[var(--border-subtle)] bg-[var(--bg-panel)] p-4 text-center">
              <DescriptionIcon className="mx-auto text-[var(--text-secondary)]" fontSize="small" />
              <p className="mt-2 text-sm font-medium text-[var(--text-primary)]">No hay archivos adjuntos</p>
            </div>
          ) : (
            <div className="space-y-2 overflow-y-auto pr-1 min-h-0">
              {files.map((file) => (
                <button
                  type="button"
                  className={`w-full rounded-lg border p-2.5 text-left transition hover:border-[var(--accent)] hover:shadow-sm shrink-0 ${selectedFile?.id === file.id
                    ? 'border-[var(--accent)] bg-[var(--bg-primary)]'
                    : 'border-[var(--border-subtle)] bg-[var(--bg-panel)]'
                    }`}
                  key={file.id}
                  onClick={() => handleFileClick(file)}
                >
                  <div className="flex gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[var(--bg-input)] text-[var(--accent)]">
                      <DescriptionIcon fontSize="small" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-[var(--text-primary)]">{file.file_name}</p>
                      <p className="mt-0.5 truncate text-xs text-[var(--text-secondary)]">
                        {file.file_type || 'Tipo desconocido'}
                      </p>
                      <span className={`mt-1 inline-flex rounded-md ${getBadgeColor(file.file_role)} px-2 py-0.5 text-xs font-medium text-[var(--text-primary)]`}>
                        {file.file_role || 'Sin rol'}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Preview Column */}
        {selectedFile && (
          <div className="min-h-0 mt-4">
            <FilePreview
              key={selectedFile.id}
              file={selectedFile}
              onClose={handleClosePreview}
            />
          </div>
        )}
      </div>
    </div>
  );
}

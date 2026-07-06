'use client';

import { useState, useEffect } from 'react';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import CloseIcon from '@mui/icons-material/Close';
import DescriptionIcon from '@mui/icons-material/Description';

import FilePreview from '@/app/components/FilePreview';
import { apiFetch } from '@/app/(auth)/auth.api';

export default function EmailFilesModal({ emailId, onClose }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    if (!emailId) {
      return;
    }

    let isMounted = true;

    async function loadFiles() {
      try {
        setLoading(true);
        setError(null);

        const response = await apiFetch(`/api/emails/${emailId}`, { cache: 'no-store' });
      
        if (!response.ok) {
          const data = await response.json().catch(() => null);
          throw new Error(data?.error || 'Error al cargar archivos');
        }

        const data = await response.json();

        if (isMounted) {
          setFiles(data.data ?? data ?? []);
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
  }, [emailId]);

  const handleFileClick = (file) => {
    setSelectedFile(file);
  };

  const handleClosePreview = () => {
    setSelectedFile(null);
  };

  if (!emailId) {
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
    <div className="flex h-full min-h-0 flex-col gap-3">
      <div className="flex shrink-0 items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-[var(--text-primary)]">Archivos adjuntos</h2>
          <p className="mt-0.5 text-xs text-[var(--text-secondary)]">{files.length} archivos encontrados</p>
        </div>
        <button
          aria-label="Cerrar archivos adjuntos"
          className="flex h-9 w-9 items-center justify-center rounded-md border border-[var(--border-subtle)] text-[var(--text-secondary)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
          onClick={onClose}
          type="button"
        >
          <CloseIcon fontSize="small" />
        </button>
      </div>

      {files.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[var(--border-subtle)] bg-[var(--bg-panel)] p-4 text-center">
          <DescriptionIcon className="mx-auto text-[var(--text-secondary)]" fontSize="small" />
          <p className="mt-2 text-sm font-medium text-[var(--text-primary)]">No hay archivos adjuntos</p>
        </div>
      ) : (
        <div className="max-h-[min(12rem,28vh)] shrink-0 space-y-2 overflow-y-auto pr-1">
          {files.map((file) => (
            <button
              type="button"
              className={`w-full rounded-lg border p-2.5 text-left transition hover:border-[var(--accent)] hover:shadow-sm ${
                selectedFile?.id === file.id
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
                  <span className="mt-1 inline-flex rounded-md bg-[var(--bg-input)] px-2 py-0.5 text-xs font-medium text-[var(--text-secondary)]">
                    {file.file_role || 'Sin rol'}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {selectedFile && (
        <div className="min-h-0 flex-1">
          <FilePreview
            key={selectedFile.id}
            file={selectedFile}
            onClose={handleClosePreview}
          />
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import CloseIcon from '@mui/icons-material/Close';
import DescriptionIcon from '@mui/icons-material/Description';

import FilePreview from '@/app/components/FilePreview';

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

        const response = await fetch(`/api/emails/${emailId}`, { cache: 'no-store' });
      
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
        <div className="rounded-lg border border-dashed border-slate-200 bg-[var(--background)] p-6">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-[var(--primary)]">
            <AttachFileIcon fontSize="small" />
          </div>
          <p className="text-sm font-medium text-[var(--foreground)]">Sin email seleccionado</p>
          <p className="mt-1 text-sm text-[var(--secondary)]">
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
            <div key={item} className="h-14 animate-pulse rounded-lg border border-slate-200 bg-slate-50" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full min-h-0 flex-col gap-3">
        <div>
          <h2 className="text-lg font-semibold text-[var(--foreground)]">Archivos adjuntos</h2>
          <p className="mt-1 rounded-lg border border-red-100 bg-red-50 p-3 text-sm font-medium text-red-600">
            Error: {error}
          </p>
        </div>
        <button
          className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 px-3 text-sm font-medium text-[var(--secondary)] transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
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
          <h2 className="text-base font-semibold text-[var(--foreground)]">Archivos adjuntos</h2>
          <p className="mt-0.5 text-xs text-[var(--secondary)]">{files.length} archivos encontrados</p>
        </div>
        <button
          aria-label="Cerrar archivos adjuntos"
          className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-[var(--secondary)] transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
          onClick={onClose}
          type="button"
        >
          <CloseIcon fontSize="small" />
        </button>
      </div>

      {files.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-center">
          <DescriptionIcon className="mx-auto text-[var(--secondary)]" fontSize="small" />
          <p className="mt-2 text-sm font-medium text-[var(--foreground)]">No hay archivos adjuntos</p>
        </div>
      ) : (
        <div className="max-h-[min(12rem,28vh)] shrink-0 space-y-2 overflow-y-auto pr-1">
          {files.map((file) => (
            <button
              type="button"
              className={`w-full rounded-lg border p-2.5 text-left transition hover:border-[var(--primary)] hover:shadow-sm ${
                selectedFile?.id === file.id
                  ? 'border-[var(--primary)] bg-blue-50'
                  : 'border-slate-200 bg-[var(--background)]'
              }`}
              key={file.id}
              onClick={() => handleFileClick(file)}
            >
              <div className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-slate-100 text-[var(--primary)]">
                  <DescriptionIcon fontSize="small" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-[var(--foreground)]">{file.file_name}</p>
                  <p className="mt-0.5 truncate text-xs text-[var(--secondary)]">
                    {file.file_type || 'Tipo desconocido'}
                  </p>
                  <span className="mt-1 inline-flex rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-[var(--secondary)]">
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

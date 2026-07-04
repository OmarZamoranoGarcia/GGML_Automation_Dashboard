'use client';

import { useEffect, useRef, useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import ImageIcon from '@mui/icons-material/Image';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import * as XLSX from 'xlsx';

export default function FilePreview({ file, onClose }) {
  const isImage = file.file_type?.startsWith('image/');
  const isPdf = file.file_type === 'application/pdf';
  const isExcel =
    file.file_type?.includes('spreadsheet') ||
    file.file_type?.includes('excel') ||
    /\.(xlsx|xls|csv)$/i.test(file.file_name || '');
  const canPreview = isImage || isPdf || isExcel;
  const FileIcon = isImage ? ImageIcon : isPdf ? PictureAsPdfIcon : InsertDriveFileIcon;

  const [loading, setLoading] = useState(canPreview);
  const [error, setError] = useState(null);
  const [rows, setRows] = useState([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const previewRef = useRef(null);

  useEffect(() => {
    if (!isExcel || !file?.public_url) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    const loadExcel = async () => {
      try {
        setLoading(true);
        setError(null);
        setRows([]);

        const response = await fetch(file.public_url);
        if (!response.ok) {
          throw new Error('No se pudo cargar el archivo Excel');
        }

        const arrayBuffer = await response.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const parsedRows = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          defval: '',
        });

        if (isMounted) {
          setRows(parsedRows.slice(0, 80));
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError('No se pudo leer el archivo Excel');
          setLoading(false);
        }
      }
    };

    loadExcel();

    return () => {
      isMounted = false;
    };
  }, [file?.public_url, isExcel]);

  const handleImageLoad = () => {
    setLoading(false);
  };

  const handleImageError = () => {
    setLoading(false);
    setError('No se puede mostrar la vista previa');
  };

  const handleDownload = () => {
    window.open(file.public_url, '_blank');
  };

  const toggleFullscreen = async () => {
    if (!previewRef.current) return;

    if (!document.fullscreenElement) {
      await previewRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <div
      ref={previewRef}
      className="flex h-full min-h-0 flex-col rounded-lg border border-slate-200 bg-[var(--background)] shadow-sm"
    >
      <div className="shrink-0 border-b border-slate-200 p-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[var(--primary)]">
              <FileIcon fontSize="small" />
            </div>
            <div className="min-w-0">
              <h3 className="truncate text-sm font-semibold text-[var(--foreground)]">{file.file_name}</h3>
              <p className="mt-1 text-xs text-[var(--secondary)]">{file.file_type || 'Tipo desconocido'}</p>
            </div>
          </div>

          <button
            aria-label="Cerrar vista previa"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-slate-200 text-[var(--secondary)] transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
            onClick={onClose}
            type="button"
          >
            <CloseIcon fontSize="small" />
          </button>
        </div>

        <div className="mt-3 flex gap-2">
          <button
            className="inline-flex h-8 flex-1 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-3 text-sm font-medium text-white transition hover:bg-blue-600"
            onClick={handleDownload}
            type="button"
          >
            <DownloadIcon fontSize="small" />
            Descargar
          </button>
          <button
            aria-label={isFullscreen ? 'Salir de pantalla completa' : 'Ver en pantalla completa'}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-slate-200 text-[var(--secondary)] transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
            onClick={toggleFullscreen}
            type="button"
          >
            {isFullscreen ? <FullscreenExitIcon fontSize="small" /> : <FullscreenIcon fontSize="small" />}
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden p-3">
        {loading && (
          <div className="flex h-full min-h-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-sm text-[var(--secondary)]">
            Cargando vista previa...
          </div>
        )}

        {error && (
          <p className="rounded-lg border border-red-100 bg-red-50 p-3 text-sm font-medium text-red-600">
            {error}
          </p>
        )}

        {isImage && (
          <img
            className={`h-full min-h-0 w-full rounded-lg border border-slate-200 object-contain ${
              loading ? 'hidden' : 'block'
            }`}
            src={file.public_url}
            alt={file.file_name}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        )}

        {isPdf && (
          <iframe
            className={`h-full min-h-0 w-full rounded-lg border border-slate-200 ${
              loading ? 'hidden' : 'block'
            }`}
            src={file.public_url}
            title={file.file_name}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        )}

        {isExcel && !loading && !error && (
          <div className="h-full min-h-0 overflow-auto rounded-lg border border-slate-200 bg-white">
            {rows.length > 0 ? (
              <table className="min-w-full border-collapse text-sm">
                <tbody>
                  {rows.map((row, rowIndex) => (
                    <tr key={`row-${rowIndex}`} className={rowIndex === 0 ? 'bg-slate-50 font-semibold' : 'odd:bg-white even:bg-slate-50'}>
                      {row.map((cell, cellIndex) => (
                        <td
                          key={`cell-${rowIndex}-${cellIndex}`}
                          className="whitespace-nowrap border-b border-slate-200 px-3 py-2 align-top"
                        >
                          {cell ?? ''}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="flex h-full min-h-0 items-center justify-center p-4 text-center text-sm text-[var(--secondary)]">
                El archivo Excel no tiene datos para mostrar.
              </div>
            )}
          </div>
        )}

        {!isImage && !isPdf && !isExcel && (
          <div className="flex h-full min-h-0 flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 p-5 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--background)] text-[var(--primary)] shadow-sm">
              <InsertDriveFileIcon />
            </div>
            <p className="mt-3 text-sm font-semibold text-[var(--foreground)]">
              Vista previa no disponible
            </p>
            <p className="mt-1 break-words text-xs text-[var(--secondary)]">{file.file_name}</p>
            <p className="mt-1 text-xs text-[var(--secondary)]">{file.file_type || 'Tipo desconocido'}</p>
            <button
              className="mt-4 inline-flex h-9 items-center justify-center gap-2 rounded-md border border-slate-200 px-3 text-sm font-medium text-[var(--secondary)] transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
              onClick={handleDownload}
              type="button"
            >
              <DownloadIcon fontSize="small" />
              Descargar archivo
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

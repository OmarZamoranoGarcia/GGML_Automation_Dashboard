'use client';

import { useState } from 'react';

const LEVEL_STYLES = {
    Error: 'bg-red-500/10 text-red-400 border-red-500/30',
    Warning: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    Info: 'bg-[var(--bg-subtle)] text-[var(--text-secondary)] border-[var(--border-subtle)]',
};

const STATUS_STYLES = {
    COMPLETED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    SKIPPED: 'bg-[var(--bg-subtle)] text-[var(--text-secondary)] border-[var(--border-subtle)]',
    NOT_PROCESSED: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
    ERROR: 'bg-red-500/10 text-red-400 border-red-500/30',
};

function Badge({ text, styles }) {
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${styles || STATUS_STYLES.SKIPPED}`}>
            {text}
        </span>
    );
}

function Stat({ label, value, accent }) {
    return (
        <div className="flex flex-col items-center px-3 py-2 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-subtle)] min-w-[70px]">
            <span className={`text-lg font-semibold ${accent || 'text-[var(--text-primary)]'}`}>{value}</span>
            <span className="text-[11px] text-[var(--text-secondary)]">{label}</span>
        </div>
    );
}

// Detecta si data trae la forma de EmailCheckResult; si no, cae a JSON crudo
function isStructuredResult(data) {
    return (
        data &&
        typeof data === 'object' &&
        Array.isArray(data.logs) &&
        Array.isArray(data.emails)
    );
}

export default function ApiModal({ isOpen, onClose, data, error }) {
    const [showLogs, setShowLogs] = useState(true);

    if (!isOpen) return null;

    const handleClose = () => onClose();
    const structured = !error && isStructuredResult(data);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <button
                onClick={handleClose}
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />

            <div className="relative max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-[var(--text-primary)] shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">
                        {error ? 'Error en la solicitud' : 'Revisión de correos'}
                    </h2>

                    <button
                        onClick={handleClose}
                        className="p-1 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Caso: error de red / HTTP / respuesta no estructurada */}
                {error && (
                    <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                        <p className="text-sm text-red-400 whitespace-pre-wrap break-words">{error}</p>
                    </div>
                )}

                {/* Caso: respuesta estructurada de EmailCheckResult */}
                {structured && (
                    <>
                        <div className="flex items-center gap-2 mb-4">
                            <Badge
                                text={data.success ? 'Éxito' : 'Con errores'}
                                styles={data.success ? STATUS_STYLES.COMPLETED : STATUS_STYLES.ERROR}
                            />
                            <span className="text-xs text-[var(--text-secondary)]">
                                {data.totalEmailsFound} correo(s) encontrados
                            </span>
                        </div>

                        <div className="flex gap-3 mb-5">
                            <Stat label="Procesados" value={data.processed} accent="text-emerald-400" />
                            <Stat label="Omitidos" value={data.skipped} />
                            <Stat label="No procesados" value={data.notProcessed} accent="text-sky-400" />
                            <Stat label="Errores" value={data.errors} accent={data.errors > 0 ? 'text-red-400' : undefined} />
                        </div>

                        {data.emails?.length > 0 && (
                            <div className="mb-5">
                                <h3 className="text-sm font-medium mb-2 text-[var(--text-secondary)]">Correos</h3>
                                <div className="rounded-lg border border-[var(--border-subtle)] overflow-hidden">
                                    {data.emails.map((e, i) => (
                                        <div
                                            key={e.emailId || i}
                                            className={`flex items-start justify-between gap-3 p-3 text-sm ${i !== 0 ? 'border-t border-[var(--border-subtle)]' : ''
                                                }`}
                                        >
                                            <div className="min-w-0">
                                                <p className="truncate font-medium">{e.subject || '(sin asunto)'}</p>
                                                <p className="truncate text-xs text-[var(--text-secondary)]">{e.from}</p>
                                                {e.errorMessage && (
                                                    <p className="mt-1 text-xs text-red-400 break-words">{e.errorMessage}</p>
                                                )}
                                                {e.note && !e.errorMessage && (
                                                    <p className="mt-1 text-xs text-[var(--text-secondary)] italic break-words">{e.note}</p>
                                                )}
                                            </div>
                                            <Badge text={e.status} styles={STATUS_STYLES[e.status]} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {data.logs?.length > 0 && (
                            <div>
                                <button
                                    onClick={() => setShowLogs((v) => !v)}
                                    className="flex items-center gap-1 text-sm font-medium mb-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                                >
                                    Logs ({data.logs.length})
                                    <svg
                                        className={`w-4 h-4 transition-transform ${showLogs ? 'rotate-180' : ''}`}
                                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {showLogs && (
                                    <div className="rounded-lg border border-[var(--border-subtle)] divide-y divide-[var(--border-subtle)] max-h-56 overflow-y-auto">
                                        {data.logs.map((log, i) => (
                                            <div key={i} className="flex items-start gap-2 p-2.5 text-xs">
                                                <span className={`shrink-0 px-1.5 py-0.5 rounded border ${LEVEL_STYLES[log.level] || LEVEL_STYLES.Info}`}>
                                                    {log.level}
                                                </span>
                                                <span className="break-words text-[var(--text-secondary)]">{log.message}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}

                {/* Fallback: datos sin la forma esperada, mostrar JSON crudo */}
                {!error && !structured && (
                    <div className="p-4 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-subtle)]">
                        <pre className="text-sm whitespace-pre-wrap break-words">
                            {JSON.stringify(data, null, 2)}
                        </pre>
                    </div>
                )}

                <div className="flex justify-end mt-6 pt-4 border-t border-[var(--border-subtle)]">
                    <button
                        onClick={handleClose}
                        className="px-4 py-2 rounded-lg bg-[var(--bg-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-colors"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
}
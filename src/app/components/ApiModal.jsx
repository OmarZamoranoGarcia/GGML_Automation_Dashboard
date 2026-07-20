export default function ApiModal({ isOpen, onClose, data, error }) {
    if (!isOpen) return null;

    const handleClose = () => {
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
           
            <button 
                onClick={handleClose}
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            >             
            </button>

            <div className="relative max-w-lg w-full p-6 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-[var(--text-primary)] shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">Respuesta de la API</h2>
                    
                    <button 
                        onClick={handleClose}  
                        className="p-1 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-4 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-subtle)]">
                    <pre className="text-sm whitespace-pre-wrap break-words">
                        {error ? error : JSON.stringify(data, null, 2)}
                    </pre>
                </div>

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
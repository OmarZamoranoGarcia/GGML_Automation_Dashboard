export default function EmailCard({ email, isSelected, onSelect }) {
    const formatDateTime = (isoDate) => {
        if (!isoDate) return '';

        const date = new Date(isoDate);

        // Formato con AM/PM en español
        return date.toLocaleString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        });
    };

    const handleClick = () => {
        onSelect?.(email.id);
    };

    return (
        <button
            type="button"
            className={`w-full h-auto min-h-fit overflow-visible rounded-lg border p-4 text-left transition ${
                isSelected
                    ? 'border-[var(--accent)] bg-[var(--bg-primary)] shadow-sm'
                    : 'border-[var(--border-strong)] bg-[var(--bg-panel)] hover:border-[var(--accent)] hover:shadow-sm'
            }`}
            onClick={handleClick}
        >
            <div className="text-xs font-medium text-[var(--text-secondary)]">{formatDateTime(email.arrival_at)}</div>
            <div className="mt-2 flex flex-col gap-2">
                <h2 className="break-words text-sm font-semibold text-[var(--text-primary)]">{email.arrival_email}</h2>
                <h3 className="break-words text-sm font-medium text-[var(--text-secondary)]">{email.subject}</h3>
                <p className="break-words whitespace-pre-wrap text-sm text-[var(--text-secondary)]">{email.body}</p>
                <span className="inline-flex w-fit rounded-md bg-[var(--bg-input)] px-2 py-1 text-xs font-medium text-[var(--text-secondary)]">
                    {email.status}
                </span>
            </div>
        </button>
    );
}

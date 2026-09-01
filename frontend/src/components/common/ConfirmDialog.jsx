export default function ConfirmDialog({
  open,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Confirm',
  danger = false,
  loading = false,
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-sm bg-surface border border-border-subtle rounded-2xl p-6">
        <h2 className="text-lg font-semibold tracking-tight mb-2">{title}</h2>
        {message && (
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">{message}</p>
        )}
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 rounded-lg text-xs font-medium border border-border-subtle hover:bg-neutral-200/40 dark:hover:bg-neutral-800/40 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 rounded-lg text-xs font-semibold text-white transition-opacity disabled:opacity-50 ${
              danger ? 'bg-red-600 hover:opacity-90' : 'bg-brand hover:opacity-90'
            }`}
          >
            {loading ? 'Working…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
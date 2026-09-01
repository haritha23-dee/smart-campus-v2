import { useEffect } from 'react';

export default function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [toast, onClose]);

  if (!toast) return null;

  const isError = toast.type === 'error';

  return (
    <div className="fixed bottom-6 right-6 z-[120]">
      <div
        className={`px-4 py-3 rounded-lg text-sm font-medium shadow-lg border ${
          isError
            ? 'bg-red-500/10 border-red-400/40 text-red-600 dark:text-red-400'
            : 'bg-surface border-border-subtle text-neutral-900 dark:text-white'
        }`}
      >
        {toast.message}
      </div>
    </div>
  );
}
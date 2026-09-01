import { useState, useEffect } from 'react';
import { getLibraryHistory } from '../../services/libraryStaffService';

const TABS = [
  { key: 'issued', label: 'Currently Issued' },
  { key: 'returned', label: 'Returned' },
  { key: 'overdue', label: 'Overdue' },
];

export default function LibraryStaffHistory() {
  const [history, setHistory] = useState({ issuedHistory: [], returnedHistory: [], overdueBooks: [], pendingCount: 0 });
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('issued');

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { history: h } = await getLibraryHistory();
        setHistory(h);
      } catch {} finally {
        setLoading(false);
      }
    })();
  }, []);

  const rows = tab === 'issued' ? history.issuedHistory : tab === 'returned' ? history.returnedHistory : history.overdueBooks;

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-border-subtle">
        <span className="text-[11px] uppercase tracking-[0.25em] font-semibold text-neutral-500 dark:text-neutral-400 block mb-1">
          Library Staff
        </span>
        <h1 className="text-2xl font-bold tracking-tight">History</h1>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
          {history.pendingCount} pending request{history.pendingCount === 1 ? '' : 's'} awaiting review.
        </p>
      </div>

      <div className="flex gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-colors ${
              tab === t.key ? 'bg-brand text-white' : 'border border-border-subtle hover:bg-neutral-200/40 dark:hover:bg-neutral-800/40'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <p className="text-sm text-neutral-500 dark:text-neutral-400 border border-dashed border-border-subtle rounded-xl p-6 text-center">
          Nothing here yet.
        </p>
      ) : (
        <div className="space-y-3">
          {rows.map((r) => (
            <div key={r._id} className="border border-border-subtle rounded-xl p-4 bg-surface flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold">{r.book?.title}</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">by {r.book?.author}</p>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1.5">
                  {r.student?.name} ({r.student?.studentId || r.student?.email})
                </p>
              </div>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 shrink-0">
                {tab === 'returned' && r.returnedAt && `Returned ${new Date(r.returnedAt).toLocaleDateString()}`}
                {tab !== 'returned' && r.dueDate && `Due ${new Date(r.dueDate).toLocaleDateString()}`}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
import { useState, useEffect, useCallback } from 'react';
import { listReturns, markBookReturned } from '../../services/libraryStaffService';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Toast from '../../components/common/Toast';

export default function LibraryStaffReturns() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [returnTarget, setReturnTarget] = useState(null);
  const [marking, setMarking] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { list: l } = await listReturns();
      setList(l || []);
    } catch (err) {
      setToast({ type: 'error', message: err?.response?.data?.message || 'Failed to load return tracking.' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const confirmReturn = async () => {
    if (!returnTarget) return;
    setMarking(true);
    try {
      await markBookReturned(returnTarget._id);
      setToast({ type: 'success', message: 'Marked as returned — availability updated.' });
      setReturnTarget(null);
      load();
    } catch (err) {
      setToast({ type: 'error', message: err?.response?.data?.message || 'Failed to mark as returned.' });
      setReturnTarget(null);
    } finally {
      setMarking(false);
    }
  };

  const isOverdue = (r) => r.status === 'overdue' || (r.dueDate && new Date(r.dueDate) < new Date());

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-border-subtle">
        <h1 className="text-2xl font-bold tracking-tight">Return Tracking</h1>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <p className="text-sm text-neutral-500 dark:text-neutral-400 border border-dashed border-border-subtle rounded-xl p-6 text-center">
          No active loans.
        </p>
      ) : (
        <div className="space-y-3">
          {list.map((r) => (
            <div key={r._id} className="border border-border-subtle rounded-xl p-4 bg-surface flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-semibold">{r.book?.title}</p>
                  {isOverdue(r) && (
                    <span className="text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-red-500/10 text-red-600 dark:text-red-400">
                      Overdue
                    </span>
                  )}
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">by {r.book?.author}</p>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1.5">
                  {r.student?.name} ({r.student?.studentId || r.student?.email})
                  {' · '}
                  Due {r.dueDate ? new Date(r.dueDate).toLocaleDateString() : '—'}
                </p>
              </div>
              <button
                onClick={() => setReturnTarget(r)}
                className="shrink-0 px-4 py-2 rounded-lg text-xs font-semibold bg-brand text-white hover:opacity-90 transition-opacity"
              >
                Mark Returned
              </button>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!returnTarget}
        title="Mark as returned?"
        message={returnTarget ? `"${returnTarget.book?.title}" will be marked returned and availability restored.` : ''}
        confirmLabel="Mark Returned"
        loading={marking}
        onConfirm={confirmReturn}
        onCancel={() => setReturnTarget(null)}
      />

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
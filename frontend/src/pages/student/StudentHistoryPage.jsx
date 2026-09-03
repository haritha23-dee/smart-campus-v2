import { useState, useEffect } from 'react';
import { getStudentHistory } from '../../services/studentService';

const STATUS_STYLES = {
  Pending: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  Approved: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  Rejected: 'bg-red-500/10 text-red-600 dark:text-red-400',
  Returned: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  Overdue: 'bg-red-500/10 text-red-600 dark:text-red-400',
};

const TABS = ['Library Loans', 'Lab Equipment', 'My Shared Notes'];

function isOverdue(item) {
  return (
    item.status === 'Approved' &&
    item.dueDate &&
    !item.returnAt &&
    new Date(item.dueDate) < new Date()
  );
}

export default function StudentHistoryPage() {
  const [tab, setTab] = useState(TABS[0]);
  const [data, setData] = useState({ libraryHistory: [], labHistory: [], postedNotes: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await getStudentHistory();
        setData({
          libraryHistory: res.bookHistory || [],
          labHistory: res.equipmentHistory || [],
          postedNotes: res.postedResources || [],
        });
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load history.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const StatusBadge = ({ item }) => {
    const overdue = isOverdue(item);
    const label = overdue ? 'Overdue' : item.status;
    return (
      <span className={`text-[10px] font-semibold px-2 py-1 rounded ${STATUS_STYLES[label] || STATUS_STYLES.Pending}`}>
        {label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <span className="text-[11px] uppercase tracking-[0.25em] font-semibold text-neutral-500 dark:text-neutral-400 block mb-2">
          My Records
        </span>
        <h1 className="text-2xl font-bold tracking-tight">Resource History</h1>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-border-subtle pb-3">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-colors ${
              tab === t
                ? 'bg-brand text-white'
                : 'border border-border-subtle hover:bg-neutral-200/40 dark:hover:bg-neutral-800/40'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-12 rounded-xl bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <p className="text-sm text-red-600 dark:text-red-400 text-center py-10">{error}</p>
      ) : (
        <>
          {tab === 'Library Loans' && (
            data.libraryHistory.length === 0 ? (
              <p className="text-sm text-neutral-500 dark:text-neutral-400 border border-dashed border-border-subtle rounded-xl p-6 text-center">
                No library loan history.
              </p>
            ) : (
              <div className="overflow-x-auto border border-border-subtle rounded-2xl">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border-subtle bg-surface text-[11px] uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                      <th className="text-left px-4 py-3 font-semibold">Book</th>
                      <th className="text-left px-4 py-3 font-semibold">Issue Date</th>
                      <th className="text-left px-4 py-3 font-semibold">Due Date</th>
                      <th className="text-left px-4 py-3 font-semibold">Return Date</th>
                      <th className="text-left px-4 py-3 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.libraryHistory.map((h) => (
                      <tr key={h._id} className={`border-b border-border-subtle last:border-0 ${isOverdue(h) ? 'bg-red-500/5' : ''}`}>
                        <td className="px-4 py-3">
                          <p className="font-medium">{h.book?.title}</p>
                          <p className="text-xs text-neutral-500 dark:text-neutral-400">{h.book?.author}</p>
                        </td>
                        <td className="px-4 py-3 text-xs">{h.issueDate ? new Date(h.issueDate).toLocaleDateString() : '—'}</td>
                        <td className="px-4 py-3 text-xs">{h.dueDate ? new Date(h.dueDate).toLocaleDateString() : '—'}</td>
                        <td className="px-4 py-3 text-xs">{h.returnDate ? new Date(h.returnDate).toLocaleDateString() : '—'}</td>
                        <td className="px-4 py-3"><StatusBadge item={h} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}

          {tab === 'Lab Equipment' && (
            data.labHistory.length === 0 ? (
              <p className="text-sm text-neutral-500 dark:text-neutral-400 border border-dashed border-border-subtle rounded-xl p-6 text-center">
                No lab booking history.
              </p>
            ) : (
              <div className="overflow-x-auto border border-border-subtle rounded-2xl">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border-subtle bg-surface text-[11px] uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                      <th className="text-left px-4 py-3 font-semibold">Equipment</th>
                      <th className="text-left px-4 py-3 font-semibold">Department</th>
                      <th className="text-left px-4 py-3 font-semibold">Issue Date</th>
                      <th className="text-left px-4 py-3 font-semibold">Due Date</th>
                      <th className="text-left px-4 py-3 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.labHistory.map((h) => (
                      <tr key={h._id} className={`border-b border-border-subtle last:border-0 ${isOverdue(h) ? 'bg-red-500/5' : ''}`}>
                        <td className="px-4 py-3 font-medium">{h.equipment?.name}</td>
                        <td className="px-4 py-3 text-xs">{h.equipment?.department?.name || '-'}</td>
                        <td className="px-4 py-3 text-xs">{h.requestDate ? new Date(h.requestDate).toLocaleDateString() : '—'}</td>
                        <td className="px-4 py-3 text-xs">{h.dueDate ? new Date(h.dueDate).toLocaleDateString() : '—'}</td>
                        <td className="px-4 py-3"><StatusBadge item={h} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}

          {tab === 'My Shared Notes' && (
            data.postedNotes.length === 0 ? (
              <p className="text-sm text-neutral-500 dark:text-neutral-400 border border-dashed border-border-subtle rounded-xl p-6 text-center">
                You haven't posted any notes yet.
              </p>
            ) : (
              <div className="space-y-3">
                {data.postedNotes.map((n) => (
                  <div key={n._id} className="border border-border-subtle rounded-xl p-4 bg-surface flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold">{n.title}</p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                        {n.subject} · {n.classroom?.code}
                      </p>
                    </div>
                    <span className="text-[10px] text-neutral-400 dark:text-neutral-500">
                      {new Date(n.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )
          )}
        </>
      )}
    </div>
  );
}
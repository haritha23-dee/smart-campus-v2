import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getLibraryHistory } from '../../services/libraryStaffService';

export default function LibraryStaffHome() {
  const [metrics, setMetrics] = useState({ pendingCount: 0, issuedCount: 0, overdueCount: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { history } = await getLibraryHistory();
        setMetrics({
          pendingCount: history.pendingCount || 0,
          issuedCount: history.issuedHistory?.length || 0,
          overdueCount: history.overdueBooks?.length || 0,
        });
      } catch {} finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-10 py-16">
      <span className="text-[11px] uppercase tracking-[0.25em] font-semibold text-neutral-500 dark:text-neutral-400 block mb-2">
        Library Staff Dashboard
      </span>
      <h1 className="text-3xl font-bold tracking-tight mb-10">Welcome back</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        {[
          { label: 'Pending Requests', value: metrics.pendingCount },
          { label: 'Currently Issued', value: metrics.issuedCount },
          { label: 'Overdue Books', value: metrics.overdueCount },
        ].map((m) => (
          <div key={m.label} className="border border-border-subtle rounded-2xl bg-surface p-5">
            <p className="text-[11px] uppercase tracking-wider font-semibold text-neutral-500 dark:text-neutral-400 mb-1">
              {m.label}
            </p>
            {loading ? (
              <div className="h-7 w-12 rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
            ) : (
              <p className="text-2xl font-bold tracking-tight">{m.value}</p>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/library-staff/inventory"
          className="border border-border-subtle rounded-2xl bg-surface p-6 hover:shadow-lg transition-all"
        >
          <h2 className="text-lg font-semibold mb-2">Book Inventory</h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Add, edit, and manage book stock across all sections.
          </p>
        </Link>

        <Link
          to="/library-staff/requests"
          className="border border-border-subtle rounded-2xl bg-surface p-6 hover:shadow-lg transition-all"
        >
          <h2 className="text-lg font-semibold mb-2">Issue Requests</h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Review pending borrow requests and assign due dates.
          </p>
        </Link>

        <Link
          to="/library-staff/returns"
          className="border border-border-subtle rounded-2xl bg-surface p-6 hover:shadow-lg transition-all"
        >
          <h2 className="text-lg font-semibold mb-2">Return Tracking</h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Track active loans and mark books as returned.
          </p>
        </Link>
      </div>
    </div>
  );
}
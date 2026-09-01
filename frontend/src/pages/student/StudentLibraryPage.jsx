import { useState, useEffect, useCallback } from 'react';
import { listLibrarySections, listBooksInLibrarySection, requestBookBorrow, getStudentHistory } from '../../services/studentService';
import Toast from '../../components/common/Toast';

export default function StudentLibraryPage() {
  const [sections, setSections] = useState([]);
  const [activeSection, setActiveSection] = useState('');
  const [books, setBooks] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [loadingSections, setLoadingSections] = useState(true);
  const [loadingBooks, setLoadingBooks] = useState(false);
  const [requestingId, setRequestingId] = useState(null);
  const [toast, setToast] = useState(null);

  const loadRequests = useCallback(async () => {
    try {
      const { bookHistory } = await getStudentHistory();
      setMyRequests((bookHistory || []).filter((r) => ['pending', 'approved', 'overdue'].includes(r.status)));
    } catch {}
  }, []);

  useEffect(() => {
    (async () => {
      setLoadingSections(true);
      try {
        const { sections: s } = await listLibrarySections();
        setSections(s || []);
        setActiveSection(s?.[0] || '');
      } catch (err) {
        setToast({ type: 'error', message: err?.response?.data?.message || 'Failed to load library sections.' });
      } finally {
        setLoadingSections(false);
      }
    })();
    loadRequests();
  }, [loadRequests]);

  useEffect(() => {
    if (!activeSection) return;
    (async () => {
      setLoadingBooks(true);
      try {
        const { books: b } = await listBooksInLibrarySection(activeSection);
        setBooks(b || []);
      } catch (err) {
        setToast({ type: 'error', message: err?.response?.data?.message || 'Failed to load books.' });
      } finally {
        setLoadingBooks(false);
      }
    })();
  }, [activeSection]);

  const handleRequest = async (book) => {
    setRequestingId(book._id);
    try {
      await requestBookBorrow(book._id);
      setToast({ type: 'success', message: `Requested "${book.title}". Awaiting library staff approval.` });
      loadRequests();
    } catch (err) {
      setToast({ type: 'error', message: err?.response?.data?.message || 'Failed to submit request.' });
    } finally {
      setRequestingId(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="pb-4 border-b border-border-subtle">
        <span className="text-[11px] uppercase tracking-[0.25em] font-semibold text-neutral-500 dark:text-neutral-400 block mb-2">
          Library Resources
        </span>
        <h1 className="text-2xl font-bold tracking-tight">Browse & Borrow</h1>
      </div>

      {myRequests.length > 0 && (
        <div className="border border-amber-500/30 bg-amber-500/10 rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-amber-700 dark:text-amber-400 mb-3">My Active Requests</h3>
          <ul className="space-y-2">
            {myRequests.map((r) => (
              <li key={r._id} className="text-xs text-neutral-700 dark:text-neutral-300 flex items-center justify-between">
                <span>{r.book?.title}</span>
                <span className="font-medium capitalize">
                  {r.status}
                  {r.dueDate ? ` · due ${new Date(r.dueDate).toLocaleDateString()}` : ''}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {loadingSections ? (
        <div className="flex gap-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-9 w-24 rounded-full bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
          ))}
        </div>
      ) : sections.length === 0 ? (
        <p className="text-sm text-neutral-500 dark:text-neutral-400 border border-dashed border-border-subtle rounded-xl p-6 text-center">
          No library sections have been set up yet.
        </p>
      ) : (
        <>
          <div className="flex flex-wrap gap-2">
            {sections.map((s) => (
              <button
                key={s}
                onClick={() => setActiveSection(s)}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-colors ${
                  activeSection === s
                    ? 'bg-brand text-white'
                    : 'border border-border-subtle hover:bg-neutral-200/40 dark:hover:bg-neutral-800/40'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {loadingBooks ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 rounded-xl bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
              ))}
            </div>
          ) : books.length === 0 ? (
            <p className="text-sm text-neutral-500 dark:text-neutral-400 border border-dashed border-border-subtle rounded-xl p-6 text-center">
              No books in {activeSection} yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {books.map((b) => (
                <div key={b._id} className="border border-border-subtle rounded-xl p-4 bg-surface flex flex-col justify-between">
                  <div>
                    <p className="text-sm font-semibold">{b.title}</p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">by {b.author}</p>
                    {b.description && (
                      <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-2">{b.description}</p>
                    )}
                    <p className="text-[11px] font-semibold mt-2">
                      {b.availableCopies > 0 ? (
                        <span className="text-emerald-600 dark:text-emerald-400">{b.availableCopies} available</span>
                      ) : (
                        <span className="text-red-500">Out of copies</span>
                      )}
                      {' '}/ {b.totalCopies}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRequest(b)}
                    disabled={b.availableCopies < 1 || requestingId === b._id}
                    className="mt-4 px-4 py-2 rounded-lg text-xs font-semibold bg-brand text-white hover:opacity-90 transition-opacity disabled:opacity-50 self-start"
                  >
                    {requestingId === b._id ? 'Requesting…' : 'Request Book'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
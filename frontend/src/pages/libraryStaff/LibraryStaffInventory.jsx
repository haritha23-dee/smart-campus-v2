import { useState, useEffect, useCallback } from 'react';
import {
  listBooksBySection,
  addBook,
  updateBook,
  deleteBook,
} from '../../services/libraryStaffService';
import { BOOK_SECTIONS } from '../../constants/libraryConstants';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Toast from '../../components/common/Toast';

const emptyForm = { title: '', author: '', section: BOOK_SECTIONS[0], totalCopies: 1, description: '' };

export default function LibraryStaffInventory() {
  const [activeSection, setActiveSection] = useState(BOOK_SECTIONS[0]);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(null); // null = add mode
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchBooks = useCallback(async (section) => {
    setLoading(true);
    try {
      const { books: b } = await listBooksBySection(section);
      setBooks(b || []);
    } catch (err) {
      setToast({ type: 'error', message: err?.response?.data?.message || 'Failed to load books.' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBooks(activeSection); }, [activeSection, fetchBooks]);

  const openAdd = () => {
    setEditingBook(null);
    setForm({ ...emptyForm, section: activeSection });
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = (book) => {
    setEditingBook(book);
    setForm({
      title: book.title,
      author: book.author,
      section: book.section,
      totalCopies: book.totalCopies,
      availableCopies: book.availableCopies,
      description: book.description || '',
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.author.trim() || !form.section || !form.totalCopies) {
      setFormError('Title, author, section and total copies are required.');
      return;
    }
    setSubmitting(true);
    setFormError('');
    try {
      if (editingBook) {
        await updateBook(editingBook._id, {
          title: form.title.trim(),
          author: form.author.trim(),
          section: form.section,
          totalCopies: Number(form.totalCopies),
          availableCopies: Number(form.availableCopies),
          description: form.description.trim(),
        });
        setToast({ type: 'success', message: 'Book updated.' });
      } else {
        await addBook({
          title: form.title.trim(),
          author: form.author.trim(),
          section: form.section,
          totalCopies: Number(form.totalCopies),
          description: form.description.trim(),
        });
        setToast({ type: 'success', message: 'Book added.' });
      }
      setModalOpen(false);
      if (form.section === activeSection) fetchBooks(activeSection);
      else setActiveSection(form.section);
    } catch (err) {
      setFormError(err?.response?.data?.message || 'Failed to save book.');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteBook(deleteTarget._id);
      setToast({ type: 'success', message: 'Book removed.' });
      setDeleteTarget(null);
      fetchBooks(activeSection);
    } catch (err) {
      setToast({ type: 'error', message: err?.response?.data?.message || 'Failed to remove book.' });
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-border-subtle">
        <h1 className="text-2xl font-bold tracking-tight">Book Inventory</h1>
        <button
          onClick={openAdd}
          className="px-4 py-2.5 text-xs font-semibold rounded-xl bg-brand text-white hover:opacity-90 transition-opacity"
        >
          + Add Book
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {BOOK_SECTIONS.map((s) => (
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

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
          ))}
        </div>
      ) : books.length === 0 ? (
        <p className="text-sm text-neutral-500 dark:text-neutral-400 border border-dashed border-border-subtle rounded-xl p-6 text-center">
          No books in {activeSection} yet.
        </p>
      ) : (
        <div className="space-y-3">
          {books.map((b) => (
            <div key={b._id} className="border border-border-subtle rounded-xl p-4 bg-surface flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="text-sm font-semibold">{b.title}</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">by {b.author}</p>
                {b.description && (
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1.5">{b.description}</p>
                )}
                <p className="text-[11px] font-semibold mt-2">
                  {b.availableCopies} / {b.totalCopies} available
                </p>
              </div>
              <div className="flex flex-col gap-2 shrink-0">
                <button
                  onClick={() => openEdit(b)}
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold border border-border-subtle hover:bg-neutral-200/40 dark:hover:bg-neutral-800/40 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => setDeleteTarget(b)}
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold border border-red-500/40 text-red-500 hover:bg-red-500/10 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingBook ? 'Edit Book' : 'Add Book'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-lg text-xs font-semibold bg-red-500/10 text-red-600 border border-red-500/20">
              {formError}
            </div>
          )}
          <div>
            <label className="block text-[11px] uppercase tracking-wider font-semibold text-neutral-600 dark:text-neutral-300 mb-1.5">
              Title
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="w-full px-4 py-2.5 text-sm rounded-xl bg-canvas border border-border-subtle focus:outline-none focus:ring-2 focus:ring-brand"
              required
            />
          </div>
          <div>
            <label className="block text-[11px] uppercase tracking-wider font-semibold text-neutral-600 dark:text-neutral-300 mb-1.5">
              Author
            </label>
            <input
              type="text"
              value={form.author}
              onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))}
              className="w-full px-4 py-2.5 text-sm rounded-xl bg-canvas border border-border-subtle focus:outline-none focus:ring-2 focus:ring-brand"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] uppercase tracking-wider font-semibold text-neutral-600 dark:text-neutral-300 mb-1.5">
                Section
              </label>
              <select
                value={form.section}
                onChange={(e) => setForm((f) => ({ ...f, section: e.target.value }))}
                className="w-full px-4 py-2.5 text-sm rounded-xl bg-canvas border border-border-subtle focus:outline-none focus:ring-2 focus:ring-brand"
              >
                {BOOK_SECTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-wider font-semibold text-neutral-600 dark:text-neutral-300 mb-1.5">
                Total Copies
              </label>
              <input
                type="number"
                min={editingBook ? Number(form.availableCopies) || 0 : 1}
                value={form.totalCopies}
                onChange={(e) => setForm((f) => ({ ...f, totalCopies: e.target.value }))}
                className="w-full px-4 py-2.5 text-sm rounded-xl bg-canvas border border-border-subtle focus:outline-none focus:ring-2 focus:ring-brand"
                required
              />
            </div>
          </div>
          {editingBook && (
            <div>
              <label className="block text-[11px] uppercase tracking-wider font-semibold text-neutral-600 dark:text-neutral-300 mb-1.5">
                Available Copies
              </label>
              <input
                type="number"
                min={0}
                max={form.totalCopies}
                value={form.availableCopies}
                onChange={(e) => setForm((f) => ({ ...f, availableCopies: e.target.value }))}
                className="w-full px-4 py-2.5 text-sm rounded-xl bg-canvas border border-border-subtle focus:outline-none focus:ring-2 focus:ring-brand"
              />
            </div>
          )}
          <div>
            <label className="block text-[11px] uppercase tracking-wider font-semibold text-neutral-600 dark:text-neutral-300 mb-1.5">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={3}
              className="w-full px-4 py-2.5 text-sm rounded-xl bg-canvas border border-border-subtle focus:outline-none focus:ring-2 focus:ring-brand resize-none"
            />
          </div>
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 text-xs font-semibold rounded-xl bg-brand text-white hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {submitting ? 'Saving…' : editingBook ? 'Save Changes' : 'Add Book'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Remove this book?"
        message={deleteTarget ? `"${deleteTarget.title}" will be permanently removed from inventory.` : ''}
        confirmLabel="Delete"
        danger
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
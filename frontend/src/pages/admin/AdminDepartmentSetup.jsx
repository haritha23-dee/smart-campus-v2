import { useEffect, useState, useCallback } from 'react';
import { listDepartments,
    createDepartment,
    getDepartmentClassrooms,
    deleteDepartment,
} from '../../services/adminService';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Toast from '../../components/common/Toast';

export default function AdminDepartmentSetup() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const [addOpen, setAddOpen] = useState(false);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [drawerDept, setDrawerDept] = useState(null);
  const [classrooms, setClassrooms] = useState([]);
  const [classroomsLoading, setClassroomsLoading] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteError, setDeleteError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  const inputClass =
    'w-full px-4 py-2.5 rounded-lg border border-border-subtle bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-brand';
  const labelClass = 'text-xs font-medium text-neutral-600 dark:text-neutral-400 block mb-1.5';

  const fetchDepartments = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listDepartments();
      setDepartments(data.departments || []);
    } catch (err) {
      setToast({ type: 'error', message: err?.response?.data?.message || 'Failed to load departments.' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  const openAdd = () => {
    setName('');
    setCode('');
    setFormError('');
    setAddOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    try {
      await createDepartment({ name, code: code.toUpperCase() });
      setAddOpen(false);
      setToast({ type: 'success', message: 'Department created.' });
      fetchDepartments();
    } catch (err) {
      setFormError(err?.response?.data?.message || 'Failed to create department.');
    } finally {
      setSubmitting(false);
    }
  };

  const openDrawer = async (dept) => {
    setDrawerDept(dept);
    setClassroomsLoading(true);
    try {
      const data = await getDepartmentClassrooms(dept._id);
      setClassrooms(data.classrooms || []);
    } catch (err) {
      setToast({ type: 'error', message: err?.response?.data?.message || 'Failed to load classrooms.' });
    } finally {
      setClassroomsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteError('');
    setDeleteLoading(true);
    try {
      await deleteDepartment(deleteTarget._id);
      setDeleteTarget(null);
      setToast({ type: 'success', message: 'Department deleted.' });
      fetchDepartments();
    } catch (err) {
      setDeleteError(
        err?.response?.data?.message ||
          'Cannot delete a department with active users or classrooms assigned.'
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-10 py-16">
      <div className="flex items-center justify-between mb-10">
        <div>
          <span className="text-[11px] uppercase tracking-[0.25em] font-semibold text-neutral-500 dark:text-neutral-400 block mb-2">
            Admin
          </span>
          <h1 className="text-3xl font-bold tracking-tight">Department Setup</h1>
        </div>
        <button
          onClick={openAdd}
          className="bg-brand hover:opacity-90 text-white font-medium px-5 py-2.5 rounded-lg text-sm transition-opacity"
        >
          Add Department
        </button>
      </div>

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="border border-border-subtle rounded-2xl p-6 bg-surface h-32 animate-pulse" />
          ))}
        </div>
      )}

      {!loading && departments.length === 0 && (
        <div className="border border-border-subtle rounded-2xl p-10 text-center text-neutral-500 dark:text-neutral-400 bg-surface">
          No departments yet. Add one to get started.
        </div>
      )}

      {!loading && departments.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {departments.map((d) => (
            <div
              key={d._id}
              className="border border-border-subtle rounded-2xl p-6 bg-surface hover:bg-neutral-200/40 dark:hover:bg-neutral-800/40 transition-colors"
            >
              <button onClick={() => openDrawer(d)} className="text-left w-full">
                <h2 className="text-lg font-semibold mb-1">{d.name}</h2>
                <span className="text-xs font-mono text-brand block mb-4">{d.code}</span>
                <div className="grid grid-cols-3 gap-2 text-xs text-neutral-600 dark:text-neutral-400">
                  <div>
                    <span className="block text-base font-semibold text-neutral-900 dark:text-white">{d.classroomCount ?? 0}</span>
                    Classrooms
                  </div>
                  <div>
                    <span className="block text-base font-semibold text-neutral-900 dark:text-white">{d.facultyCount ?? 0}</span>
                    Faculty
                  </div>
                  <div>
                    <span className="block text-base font-semibold text-neutral-900 dark:text-white">{d.studentCount ?? 0}</span>
                    Students
                  </div>
                </div>
              </button>
              <button
                onClick={() => {
                  setDeleteError('');
                  setDeleteTarget(d);
                }}
                className="mt-5 text-xs font-medium text-red-600 dark:text-red-400 hover:opacity-70 transition-opacity"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Department">
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="px-4 py-2.5 rounded-lg border border-red-400/40 bg-red-500/10 text-sm text-red-600 dark:text-red-400">
              {formError}
            </div>
          )}
          <div>
            <label className={labelClass}>Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Code</label>
            <input
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className={inputClass}
              placeholder="e.g. CSE"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-brand hover:opacity-90 text-white font-medium px-6 py-2.5 rounded-lg text-sm transition-opacity disabled:opacity-50"
          >
            {submitting ? 'Creating…' : 'Create Department'}
          </button>
        </form>
      </Modal>

      <Modal
        open={!!drawerDept}
        onClose={() => setDrawerDept(null)}
        title={`Classrooms — ${drawerDept?.name || ''}`}
        maxWidth="max-w-lg"
      >
        {classroomsLoading && (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-10 bg-neutral-200 dark:bg-neutral-800 rounded-lg animate-pulse" />
            ))}
          </div>
        )}
        {!classroomsLoading && classrooms.length === 0 && (
          <p className="text-sm text-neutral-500 dark:text-neutral-400 text-center py-8">
            No classrooms in this department yet.
          </p>
        )}
        {!classroomsLoading && classrooms.length > 0 && (
          <div className="space-y-2">
            {classrooms.map((c) => (
              <div
                key={c._id}
                className="flex items-center justify-between px-4 py-3 rounded-lg border border-border-subtle text-sm"
              >
                <span className="font-medium">{c.code || `${c.year} ${c.section}`}</span>
                <span className="text-neutral-500 dark:text-neutral-400 text-xs">
                  Year {c.year} · Sec {c.section}
                </span>
              </div>
            ))}
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete department?"
        message={deleteError || `This will permanently remove ${deleteTarget?.name}.`}
        confirmLabel="Delete"
        danger
        loading={deleteLoading}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
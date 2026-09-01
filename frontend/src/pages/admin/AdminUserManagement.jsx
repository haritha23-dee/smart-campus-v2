import { useEffect, useState, useCallback } from 'react';
import { listUsers, createUser, disableUser, enableUser, resetPassword, listDepartments, } from '../../services/adminService';
import { ROLES, ROLE_LABELS, YEARS, DESIGNATIONS } from '../../constants/adminConstants';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Toast from '../../components/common/Toast';

const TABS = ['all', ...ROLES];

const emptyForm = {
  role: 'student',
  name: '',
  email: '',
  password: '',
  department: '',
  year: YEARS[0],
  batch: '',
  designation: DESIGNATIONS[0],
};

export default function AdminUserManagement() {
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState([]);
  const [toast, setToast] = useState(null);

  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [confirmTarget, setConfirmTarget] = useState(null); 
  const [confirmLoading, setConfirmLoading] = useState(false);

  const [resetTarget, setResetTarget] = useState(null); 
  const [newPassword, setNewPassword] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (tab !== 'all') params.role = tab;
      if (search.trim()) params.search = search.trim();
      const data = await listUsers(params);
      setUsers(data.users || []);
    } catch (err) {
      setToast({ type: 'error', message: err?.response?.data?.message || 'Failed to load users.' });
    } finally {
      setLoading(false);
    }
  }, [tab, search]);

  useEffect(() => {
    const t = setTimeout(fetchUsers, 300);
    return () => clearTimeout(t);
  }, [fetchUsers]);

  useEffect(() => {
    listDepartments()
      .then((data) => setDepartments(data.departments || []))
      .catch(() => {});
  }, []);

  const openAdd = () => {
    setForm(emptyForm);
    setFormError('');
    setAddOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    try {
      const payload = {
        role: form.role,
        name: form.name,
        email: form.email,
        password: form.password,
      };
      if (form.role === 'student') {
        payload.department = form.department;
        payload.year = form.year;
        payload.batch = form.batch;
      } else if (form.role === 'faculty') {
        payload.department = form.department;
        payload.designation = form.designation;
      } else if (form.role === 'lab_staff') {
        payload.department = form.department;
      }
      await createUser(payload);
      setAddOpen(false);
      setToast({ type: 'success', message: 'User created.' });
      fetchUsers();
    } catch (err) {
      const status = err?.response?.status;
      const msg = err?.response?.data?.message;
      setFormError(status === 409 ? 'Email already exists.' : msg || 'Failed to create user.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!confirmTarget) return;
    setConfirmLoading(true);
    try {
      const { user, action } = confirmTarget;
      if (action === 'disable') await disableUser(user._id);
      else await enableUser(user._id);
      setToast({ type: 'success', message: `User ${action}d.` });
      setConfirmTarget(null);
      fetchUsers();
    } catch (err) {
      setToast({ type: 'error', message: err?.response?.data?.message || 'Action failed.' });
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setResetError('');
    if (newPassword.length < 6) {
      setResetError('Password must be at least 6 characters.');
      return;
    }
    setResetLoading(true);
    try {
      await resetPassword(resetTarget._id, newPassword);
      setToast({ type: 'success', message: 'Password reset.' });
      setResetTarget(null);
      setNewPassword('');
    } catch (err) {
      setResetError(err?.response?.data?.message || 'Failed to reset password.');
    } finally {
      setResetLoading(false);
    }
  };

  const inputClass =
    'w-full px-4 py-2.5 rounded-lg border border-border-subtle bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-brand';
  const labelClass = 'text-xs font-medium text-neutral-600 dark:text-neutral-400 block mb-1.5';

  return (
    <div className="max-w-6xl mx-auto px-10 py-16">
      <div className="flex items-center justify-between mb-10">
        <div>
          <span className="text-[11px] uppercase tracking-[0.25em] font-semibold text-neutral-500 dark:text-neutral-400 block mb-2">
            Admin
          </span>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        </div>
        <button
          onClick={openAdd}
          className="bg-brand hover:opacity-90 text-white font-medium px-5 py-2.5 rounded-lg text-sm transition-opacity"
        >
          Add New
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3.5 py-1.5 rounded-full border transition-colors ${
                tab === t
                  ? 'bg-brand text-white border-brand'
                  : 'border-border-subtle hover:bg-neutral-200/40 dark:hover:bg-neutral-800/40'
              }`}
            >
              {t === 'all' ? 'All' : ROLE_LABELS[t]}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Search name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={`${inputClass} max-w-xs`}
        />
      </div>

      <div className="border border-border-subtle rounded-2xl overflow-hidden bg-surface">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-subtle text-left text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              <th className="px-5 py-3 font-medium">Name</th>
              <th className="px-5 py-3 font-medium">Email</th>
              <th className="px-5 py-3 font-medium">Role</th>
              <th className="px-5 py-3 font-medium">Department</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading &&
              [...Array(4)].map((_, i) => (
                <tr key={i} className="border-b border-border-subtle last:border-0">
                  <td colSpan={6} className="px-5 py-4">
                    <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse" />
                  </td>
                </tr>
              ))}

            {!loading && users.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-neutral-500 dark:text-neutral-400">
                  No users match this filter.
                </td>
              </tr>
            )}

            {!loading &&
              users.map((u) => (
                <tr key={u._id} className="border-b border-border-subtle last:border-0">
                  <td className="px-5 py-3.5 font-medium">{u.name}</td>
                  <td className="px-5 py-3.5 text-neutral-600 dark:text-neutral-400">{u.email}</td>
                  <td className="px-5 py-3.5">{ROLE_LABELS[u.role] || u.role}</td>
                  <td className="px-5 py-3.5 text-neutral-600 dark:text-neutral-400">
                    {u.department?.name || u.department || '—'}
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        u.isActive
                          ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                          : 'bg-red-500/10 text-red-600 dark:text-red-400'
                      }`}
                    >
                      {u.isActive ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-3 text-xs font-medium">
                      <button
                        onClick={() =>
                          setConfirmTarget({ user: u, action: u.isActive ? 'disable' : 'enable' })
                        }
                        className="hover:opacity-70 transition-opacity"
                      >
                        {u.isActive ? 'Disable' : 'Enable'}
                      </button>
                      <button
                        onClick={() => {
                          setResetTarget(u);
                          setNewPassword('');
                          setResetError('');
                        }}
                        className="hover:opacity-70 transition-opacity"
                      >
                        Reset Password
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add New User">
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="px-4 py-2.5 rounded-lg border border-red-400/40 bg-red-500/10 text-sm text-red-600 dark:text-red-400">
              {formError}
            </div>
          )}

          <div>
            <label className={labelClass}>Role</label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...emptyForm, role: e.target.value })}
              className={inputClass}
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>{ROLE_LABELS[r]}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Name</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className={inputClass}
            />
          </div>

          {(form.role === 'student' || form.role === 'faculty' || form.role === 'lab_staff') && (
            <div>
              <label className={labelClass}>Department</label>
              <select
                required
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
                className={inputClass}
              >
                <option value="" disabled>Select department</option>
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>{d.name}</option>
                ))}
              </select>
            </div>
          )}

          {form.role === 'student' && (
            <>
              <div>
                <label className={labelClass}>Year</label>
                <select
                  value={form.year}
                  onChange={(e) => setForm({ ...form, year: e.target.value })}
                  className={inputClass}
                >
                  {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Batch</label>
                <input
                  type="text"
                  required
                  value={form.batch}
                  onChange={(e) => setForm({ ...form, batch: e.target.value })}
                  className={inputClass}
                />
              </div>
            </>
          )}

          {form.role === 'faculty' && (
            <div>
              <label className={labelClass}>Designation</label>
              <select
                value={form.designation}
                onChange={(e) => setForm({ ...form, designation: e.target.value })}
                className={inputClass}
              >
                {DESIGNATIONS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-brand hover:opacity-90 text-white font-medium px-6 py-2.5 rounded-lg text-sm transition-opacity disabled:opacity-50"
          >
            {submitting ? 'Creating…' : 'Create User'}
          </button>
        </form>
      </Modal>

      <Modal open={!!resetTarget} onClose={() => setResetTarget(null)} title={`Reset Password — ${resetTarget?.name || ''}`}>
        <form onSubmit={handleResetPassword} className="space-y-4">
          {resetError && (
            <div className="px-4 py-2.5 rounded-lg border border-red-400/40 bg-red-500/10 text-sm text-red-600 dark:text-red-400">
              {resetError}
            </div>
          )}
          <div>
            <label className={labelClass}>New Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={inputClass}
            />
          </div>
          <button
            type="submit"
            disabled={resetLoading}
            className="w-full bg-brand hover:opacity-90 text-white font-medium px-6 py-2.5 rounded-lg text-sm transition-opacity disabled:opacity-50"
          >
            {resetLoading ? 'Resetting…' : 'Reset Password'}
          </button>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!confirmTarget}
        title={confirmTarget?.action === 'disable' ? 'Disable user?' : 'Enable user?'}
        message={`${confirmTarget?.user?.name} will be ${confirmTarget?.action === 'disable' ? 'unable to sign in' : 'able to sign in again'}.`}
        confirmLabel={confirmTarget?.action === 'disable' ? 'Disable' : 'Enable'}
        danger={confirmTarget?.action === 'disable'}
        loading={confirmLoading}
        onConfirm={handleToggleStatus}
        onCancel={() => setConfirmTarget(null)}
      />

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  listAvailableClassrooms,
  listMyClassrooms,
  createClassroom,
  joinClassroom,
} from '../../services/facultyService';
import Modal from '../../components/common/Modal';
import Toast from '../../components/common/Toast';
import { YEARS, SECTIONS } from '../../constants/adminConstants';

export default function FacultyClassroomHub() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get('tab') === 'mine' ? 'mine' : 'available';

  const [available, setAvailable] = useState([]);
  const [mine, setMine] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const [joinTarget, setJoinTarget] = useState(null); // classroom being joined
  const [joinSubject, setJoinSubject] = useState('');
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState('');

  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({ year: YEARS[0], section: SECTIONS[0], subject: '' });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [a, m] = await Promise.all([listAvailableClassrooms(), listMyClassrooms()]);
      setAvailable(a.classrooms || []);
      setMine(m.classrooms || []);
    } catch (err) {
      setToast({ type: 'error', message: err?.response?.data?.message || 'Failed to load classrooms.' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const setTab = (t) => setSearchParams({ tab: t });

  const openJoin = (classroom) => {
    setJoinTarget(classroom);
    setJoinSubject('');
    setJoinError('');
  };

  const submitJoin = async (e) => {
    e.preventDefault();
    if (!joinSubject.trim()) {
      setJoinError('Subject is required.');
      return;
    }
    setJoining(true);
    setJoinError('');
    try {
      await joinClassroom(joinTarget._id, joinSubject.trim());
      setToast({ type: 'success', message: `Joined ${joinTarget.code}.` });
      setJoinTarget(null);
      load();
    } catch (err) {
      setJoinError(err?.response?.data?.message || 'Failed to join classroom.');
    } finally {
      setJoining(false);
    }
  };

  const submitCreate = async (e) => {
    e.preventDefault();
    if (!createForm.subject.trim()) {
      setCreateError('Subject is required.');
      return;
    }
    setCreating(true);
    setCreateError('');
    try {
      const { classroom } = await createClassroom({
        year: createForm.year,
        section: createForm.section,
        subject: createForm.subject.trim(),
      });
      setToast({ type: 'success', message: `Created ${classroom.code}.` });
      setCreateOpen(false);
      setCreateForm({ year: YEARS[0], section: SECTIONS[0], subject: '' });
      load();
    } catch (err) {
      setCreateError(err?.response?.data?.message || 'Failed to create classroom.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-border-subtle">
        <h1 className="text-2xl font-bold tracking-tight">Classrooms</h1>
        <button
          onClick={() => setCreateOpen(true)}
          className="px-4 py-2.5 text-xs font-semibold rounded-xl bg-brand text-white hover:opacity-90 transition-opacity"
        >
          + Create New Classroom
        </button>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setTab('available')}
          className={`px-4 py-2 rounded-full text-xs font-semibold transition-colors ${
            tab === 'available' ? 'bg-brand text-white' : 'border border-border-subtle hover:bg-neutral-200/40 dark:hover:bg-neutral-800/40'
          }`}
        >
          Available in Department
        </button>
        <button
          onClick={() => setTab('mine')}
          className={`px-4 py-2 rounded-full text-xs font-semibold transition-colors ${
            tab === 'mine' ? 'bg-brand text-white' : 'border border-border-subtle hover:bg-neutral-200/40 dark:hover:bg-neutral-800/40'
          }`}
        >
          My Classrooms
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
          ))}
        </div>
      ) : tab === 'available' ? (
        available.length === 0 ? (
          <p className="text-sm text-neutral-500 dark:text-neutral-400 border border-dashed border-border-subtle rounded-xl p-6 text-center">
            No classrooms exist in your department yet. Create one to get started.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {available.map((c) => (
              <div key={c._id} className="border border-border-subtle rounded-xl p-4 bg-surface flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-sm">{c.code}</p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                    {c.subjectsTaught?.length ? c.subjectsTaught.join(', ') : 'No subjects yet'} · {c.facultyCount} faculty
                  </p>
                </div>
                <button
                  onClick={() => openJoin(c)}
                  className="shrink-0 px-4 py-2 rounded-lg text-xs font-semibold border border-brand text-brand hover:bg-brand hover:text-white transition-colors"
                >
                  Join
                </button>
              </div>
            ))}
          </div>
        )
      ) : mine.length === 0 ? (
        <p className="text-sm text-neutral-500 dark:text-neutral-400 border border-dashed border-border-subtle rounded-xl p-6 text-center">
          You haven't joined or created any classrooms yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {mine.map((c) => (
            <Link
              key={c._id}
              to={`/faculty/classrooms/${c._id}`}
              className="border border-border-subtle rounded-xl p-4 bg-surface hover:bg-neutral-200/40 dark:hover:bg-neutral-800/40 transition-colors"
            >
              <p className="font-semibold text-sm">{c.code}</p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                Year {c.year} · Section {c.section}
              </p>
            </Link>
          ))}
        </div>
      )}

      <Modal open={!!joinTarget} onClose={() => setJoinTarget(null)} title={`Join ${joinTarget?.code || ''}`}>
        <form onSubmit={submitJoin} className="space-y-4">
          {joinError && (
            <div className="p-3 rounded-lg text-xs font-semibold bg-red-500/10 text-red-600 border border-red-500/20">
              {joinError}
            </div>
          )}
          <div>
            <label className="block text-[11px] uppercase tracking-wider font-semibold text-neutral-600 dark:text-neutral-300 mb-1.5">
              Subject you will teach
            </label>
            <input
              type="text"
              value={joinSubject}
              onChange={(e) => setJoinSubject(e.target.value)}
              placeholder="e.g. Database Management Systems"
              className="w-full px-4 py-2.5 text-sm rounded-xl bg-canvas border border-border-subtle focus:outline-none focus:ring-2 focus:ring-brand"
              autoFocus
            />
          </div>
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={joining}
              className="px-6 py-2.5 text-xs font-semibold rounded-xl bg-brand text-white hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {joining ? 'Joining…' : 'Join Classroom'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create New Classroom">
        <form onSubmit={submitCreate} className="space-y-4">
          {createError && (
            <div className="p-3 rounded-lg text-xs font-semibold bg-red-500/10 text-red-600 border border-red-500/20">
              {createError}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] uppercase tracking-wider font-semibold text-neutral-600 dark:text-neutral-300 mb-1.5">
                Year
              </label>
              <select
                value={createForm.year}
                onChange={(e) => setCreateForm((f) => ({ ...f, year: e.target.value }))}
                className="w-full px-4 py-2.5 text-sm rounded-xl bg-canvas border border-border-subtle focus:outline-none focus:ring-2 focus:ring-brand"
              >
                {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-wider font-semibold text-neutral-600 dark:text-neutral-300 mb-1.5">
                Section
              </label>
              <select
                value={createForm.section}
                onChange={(e) => setCreateForm((f) => ({ ...f, section: e.target.value }))}
                className="w-full px-4 py-2.5 text-sm rounded-xl bg-canvas border border-border-subtle focus:outline-none focus:ring-2 focus:ring-brand"
              >
                {SECTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-[11px] uppercase tracking-wider font-semibold text-neutral-600 dark:text-neutral-300 mb-1.5">
              Subject you will teach
            </label>
            <input
              type="text"
              value={createForm.subject}
              onChange={(e) => setCreateForm((f) => ({ ...f, subject: e.target.value }))}
              className="w-full px-4 py-2.5 text-sm rounded-xl bg-canvas border border-border-subtle focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={creating}
              className="px-6 py-2.5 text-xs font-semibold rounded-xl bg-brand text-white hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {creating ? 'Creating…' : 'Create Classroom'}
            </button>
          </div>
        </form>
      </Modal>

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
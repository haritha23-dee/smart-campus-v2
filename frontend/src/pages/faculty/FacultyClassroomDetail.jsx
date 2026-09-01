import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  getClassroom,
  postClassroomResource,
  getClassroomSubjectResources,
  resolveFileUrl,
} from '../../services/facultyService';
import { useNotifications } from '../../context/NotificationContext';
import { RESOURCE_TYPE_OPTIONS, RESOURCE_TYPE_LABELS } from '../../constants/facultyConstants';
import Modal from '../../components/common/Modal';
import Toast from '../../components/common/Toast';

export default function FacultyClassroomDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { notifications } = useNotifications();

  const [classroom, setClassroom] = useState(null);
  const [mySubjects, setMySubjects] = useState([]);
  const [activeSubject, setActiveSubject] = useState('');
  const [resources, setResources] = useState([]);
  const [loadingClassroom, setLoadingClassroom] = useState(true);
  const [loadingResources, setLoadingResources] = useState(false);
  const [toast, setToast] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ subject: '', type: RESOURCE_TYPE_OPTIONS[0].value, title: '', description: '', file: null });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const lastSeenNotifId = useRef(null);

  useEffect(() => {
    (async () => {
      setLoadingClassroom(true);
      try {
        const { classroom: room } = await getClassroom(id);
        setClassroom(room);
        const own = [...new Set(
          room.facultySubjects
            .filter((fs) => String(fs.faculty?._id) === String(user?._id))
            .map((fs) => fs.subject)
        )];
        setMySubjects(own);
        setActiveSubject(own[0] || '');
        setForm((f) => ({ ...f, subject: own[0] || '' }));
      } catch (err) {
        setToast({ type: 'error', message: err?.response?.data?.message || 'Failed to load classroom.' });
      } finally {
        setLoadingClassroom(false);
      }
    })();
  }, [id, user?._id]);

  const fetchResources = useCallback(
    async (subject) => {
      if (!subject) return;
      setLoadingResources(true);
      try {
        const { resources: res } = await getClassroomSubjectResources(id, subject);
        setResources(res || []);
      } catch (err) {
        setToast({ type: 'error', message: err?.response?.data?.message || 'Failed to load resources.' });
      } finally {
        setLoadingResources(false);
      }
    },
    [id]
  );

  useEffect(() => {
    if (activeSubject) fetchResources(activeSubject);
  }, [activeSubject, fetchResources]);

  // Real-time socket sync effect
  useEffect(() => {
    const latest = notifications?.[0];
    if (!latest || latest._id === lastSeenNotifId.current) return;
    lastSeenNotifId.current = latest._id;

    const meta = latest.meta || {};
    const isResourceEvent =
      latest.type?.toLowerCase().includes('resource') ||
      latest.title?.toLowerCase().includes('notes') ||
      latest.title?.toLowerCase().includes('resource');

    if (
      isResourceEvent &&
      String(meta.classroomId) === String(id) &&
      (meta.subject === activeSubject || !meta.subject)
    ) {
      fetchResources(activeSubject);
    }
  }, [notifications, id, activeSubject, fetchResources]);

  const openModal = () => {
    setForm({ subject: activeSubject || mySubjects[0] || '', type: RESOURCE_TYPE_OPTIONS[0].value, title: '', description: '', file: null });
    setFormError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.subject || !form.file) {
      setFormError('Subject, title and a file are required.');
      return;
    }
    setSubmitting(true);
    setFormError('');
    try {
      await postClassroomResource(id, {
        subject: form.subject,
        type: form.type,
        title: form.title.trim(),
        description: form.description.trim(),
        file: form.file,
      });
      setToast({ type: 'success', message: 'Resource posted successfully.' });
      setModalOpen(false);
      if (form.subject === activeSubject) fetchResources(form.subject);
      else setActiveSubject(form.subject);
    } catch (err) {
      setFormError(err?.response?.data?.message || 'Failed to post resource.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingClassroom) {
    return <div className="h-64 rounded-2xl bg-neutral-200 dark:bg-neutral-800 animate-pulse" />;
  }

  if (!classroom) {
    return (
      <p className="text-sm text-neutral-500 dark:text-neutral-400 text-center py-16">
        Classroom not found.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8">
      <div className="space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-border-subtle">
          <div>
            <button
              onClick={() => navigate('/faculty/classrooms?tab=mine')}
              className="text-xs font-semibold text-brand hover:underline mb-2"
            >
              &larr; Back to Classrooms
            </button>
            <h1 className="text-2xl font-bold tracking-tight">{classroom.code}</h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              Created by {classroom.createdBy?.name || '—'}
            </p>
          </div>
          <button
            onClick={openModal}
            disabled={mySubjects.length === 0}
            className="px-4 py-2.5 text-xs font-semibold rounded-xl bg-brand text-white hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            Post Resource
          </button>
        </div>

        {mySubjects.length === 0 ? (
          <p className="text-sm text-neutral-500 dark:text-neutral-400 border border-dashed border-border-subtle rounded-xl p-6 text-center">
            You aren't teaching any subject in this classroom yet.
          </p>
        ) : (
          <>
            <div className="flex flex-wrap gap-2 border-b border-border-subtle pb-3">
              {mySubjects.map((s) => (
                <button
                  key={s}
                  onClick={() => setActiveSubject(s)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold transition-colors ${
                    activeSubject === s
                      ? 'bg-brand text-white'
                      : 'border border-border-subtle hover:bg-neutral-200/40 dark:hover:bg-neutral-800/40'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            {loadingResources ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-20 rounded-xl bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
                ))}
              </div>
            ) : resources.length === 0 ? (
              <p className="text-sm text-neutral-500 dark:text-neutral-400 border border-dashed border-border-subtle rounded-xl p-6 text-center">
                No resources posted under {activeSubject} yet.
              </p>
            ) : (
              <div className="space-y-3">
                {resources.map((r) => (
                  <div key={r._id} className="border border-border-subtle rounded-xl p-4 bg-surface flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className="text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-neutral-500/10 text-neutral-600 dark:text-neutral-400">
                          {RESOURCE_TYPE_LABELS[r.type] || r.type}
                        </span>
                        {r.postedByRole === 'student' && (
                          <span className="text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-600 dark:text-orange-400 font-semibold">
                            Student Notes · {r.postedBy?.name}
                          </span>
                        )}
                        <span className="text-[10px] text-neutral-400 dark:text-neutral-500">
                          {new Date(r.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm font-semibold">{r.title}</p>
                      {r.description && (
                        <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">{r.description}</p>
                      )}
                    </div>
                    {(r.fileUrl || r.filePath) && (
                      <a
                        href={resolveFileUrl(r.fileUrl || r.filePath)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 px-4 py-2 rounded-lg text-xs font-semibold border border-brand text-brand hover:bg-brand hover:text-white transition-colors"
                      >
                        Download
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <aside className="space-y-3">
        <h2 className="text-sm font-semibold">Enrolled Students ({classroom.students?.length || 0})</h2>
        {(!classroom.students || classroom.students.length === 0) ? (
          <p className="text-xs text-neutral-500 dark:text-neutral-400 border border-dashed border-border-subtle rounded-xl p-4 text-center">
            No students have joined yet.
          </p>
        ) : (
          <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-1">
            {classroom.students.map((s) => (
              <div key={s._id} className="border border-border-subtle rounded-lg p-3 bg-surface">
                <p className="text-xs font-semibold">{s.name}</p>
                <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                  {s.studentId || s.email} · Year {s.year} · Sec {s.section}
                </p>
              </div>
            ))}
          </div>
        )}
      </aside>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Post Resource">
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-lg text-xs font-semibold bg-red-500/10 text-red-600 border border-red-500/20">
              {formError}
            </div>
          )}
          <div>
            <label className="block text-[11px] uppercase tracking-wider font-semibold text-neutral-600 dark:text-neutral-300 mb-1.5">
              Subject
            </label>
            <select
              value={form.subject}
              onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
              className="w-full px-4 py-2.5 text-sm rounded-xl bg-canvas border border-border-subtle focus:outline-none focus:ring-2 focus:ring-brand"
            >
              {mySubjects.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[11px] uppercase tracking-wider font-semibold text-neutral-600 dark:text-neutral-300 mb-1.5">
              Type
            </label>
            <select
              value={form.type}
              onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
              className="w-full px-4 py-2.5 text-sm rounded-xl bg-canvas border border-border-subtle focus:outline-none focus:ring-2 focus:ring-brand"
            >
              {RESOURCE_TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
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
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={3}
              className="w-full px-4 py-2.5 text-sm rounded-xl bg-canvas border border-border-subtle focus:outline-none focus:ring-2 focus:ring-brand resize-none"
            />
          </div>
          <div>
            <label className="block text-[11px] uppercase tracking-wider font-semibold text-neutral-600 dark:text-neutral-300 mb-1.5">
              File
            </label>
            <input
              key={modalOpen ? 'open': 'closed'}
              type="file"
              onChange={(e) => setForm((f) => ({ ...f, file: e.target.files?.[0] || null }))}
              className="w-full text-xs file:mr-3 file:px-4 file:py-2 file:rounded-lg file:border-0 file:bg-brand file:text-white file:text-xs file:font-semibold"
              required
            />
          </div>
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 text-xs font-semibold rounded-xl bg-brand text-white hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {submitting ? 'Posting…' : 'Post Resource'}
            </button>
          </div>
        </form>
      </Modal>

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
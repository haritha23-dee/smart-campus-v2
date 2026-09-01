import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getClassroomDetails,
  getClassroomResources,
  postHandwrittenNotes,
} from '../../services/studentService';
import { useNotifications } from '../../context/NotificationContext';
import Modal from '../../components/common/Modal';
import Toast from '../../components/common/Toast';

const TYPE_STYLES = {
  Syllabus: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  Notes: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  'Study Materials': 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  'Previous Year QP': 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  Blueprints: 'bg-neutral-500/10 text-neutral-600 dark:text-neutral-400',
};

const resolveFileUrl = (path) =>
  path ? `${(import.meta.env.VITE_API_URL || '').replace(/\/api\/?$/, '')}${path}` : '';

export default function StudentClassroomView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { notifications } = useNotifications();
  const [classroom, setClassroom] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [activeSubject, setActiveSubject] = useState('');
  const [resources, setResources] = useState([]);
  const [loadingClassroom, setLoadingClassroom] = useState(true);
  const [loadingResources, setLoadingResources] = useState(false);
  const [toast, setToast] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', subject: '', file: null });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const lastSeenNotifId = useRef(null);

  useEffect(() => {
    (async () => {
      setLoadingClassroom(true);
      try {
        const { classroom: room } = await getClassroomDetails(id);
        setClassroom(room);
        const uniqueSubjects = [...new Set((room.facultySubjects || []).map((fs) => fs.subject).filter(Boolean))];
        setSubjects(uniqueSubjects);
        setActiveSubject(uniqueSubjects[0] || '');
        setForm((f) => ({ ...f, subject: uniqueSubjects[0] || '' }));
      } catch (err) {
        setToast({ type: 'error', message: err?.response?.data?.message || 'Failed to load classroom.' });
      } finally {
        setLoadingClassroom(false);
      }
    })();
  }, [id]);

  const fetchResources = useCallback(
    async (targetSubject) => {
      if (!targetSubject) return;
      setLoadingResources(true);
      try {
        const { resources: res } = await getClassroomResources(id, targetSubject);
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
      meta.subject === activeSubject
    ) {
      fetchResources(activeSubject);
    }
  }, [notifications, id, activeSubject, fetchResources]);

  const openModal = () => {
    setForm({ title: '', description: '', subject: activeSubject || subjects[0] || '', file: null });
    setFormError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.subject) {
      setFormError('Title and subject are required.');
      return;
    }
    setSubmitting(true);
    setFormError('');
    try {
      await postHandwrittenNotes(id, {
        title: form.title.trim(),
        description: form.description.trim(),
        subject: form.subject,
        file: form.file,
      });
      setToast({ type: 'success', message: 'Notes posted successfully.' });
      setModalOpen(false);

      if (form.subject === activeSubject) {
        fetchResources(form.subject);
      } else {
        setActiveSubject(form.subject);
      }
    } catch (err) {
      setFormError(err?.response?.data?.message || 'Failed to post notes.');
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
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-border-subtle">
        <div>
          <button
            onClick={() => navigate('/student/departments')}
            className="text-xs font-semibold text-brand hover:underline mb-2"
          >
            &larr; Back to Departments
          </button>
          <h1 className="text-2xl font-bold tracking-tight">{classroom.code}</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            {classroom.department?.name} · Year {classroom.year} · Section {classroom.section}
          </p>
        </div>
        <button
          onClick={openModal}
          disabled={subjects.length === 0}
          className="px-4 py-2.5 text-xs font-semibold rounded-xl bg-brand text-white hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          Post Handwritten Notes
        </button>
      </div>

      {classroom.facultySubjects?.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {classroom.facultySubjects.map((fs) => (
            <div key={fs._id || fs.faculty?._id} className="border border-border-subtle rounded-xl px-4 py-2 bg-surface">
              <p className="text-xs font-semibold">{fs.faculty?.name || 'Faculty'}</p>
              <p className="text-[10px] text-neutral-500 dark:text-neutral-400">{fs.subject} · {fs.faculty?.email}</p>
            </div>
          ))}
        </div>
      )}

      {subjects.length === 0 ? (
        <p className="text-sm text-neutral-500 dark:text-neutral-400 border border-dashed border-border-subtle rounded-xl p-6 text-center">
          No subjects are being taught in this classroom yet.
        </p>
      ) : (
        <>
          <div className="flex flex-wrap gap-2 border-b border-border-subtle pb-3">
            {subjects.map((s) => (
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
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={`text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded ${TYPE_STYLES[r.type] || TYPE_STYLES.Blueprints}`}>
                        {r.type}
                      </span>
                      <span className="text-[10px] text-neutral-400 dark:text-neutral-500">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm font-semibold">{r.title}</p>
                    {r.description && (
                      <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">{r.description}</p>
                    )}
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1.5">
                      Posted by {r.postedBy?.name} ({r.postedBy?.role})
                    </p>
                  </div>
                  {(r.fileUrl || r.filePath) && (
                    <button
                      onClick={() => window.open(resolveFileUrl(r.fileUrl || r.filePath), '_blank')}
                      className="shrink-0 px-4 py-2 rounded-lg text-xs font-semibold border border-brand text-brand hover:bg-brand hover:text-white transition-colors"
                    >
                      Download
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Post Handwritten Notes">
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
              {subjects.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[11px] uppercase tracking-wider font-semibold text-neutral-600 dark:text-neutral-300 mb-1.5">
              Note Title
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
              Attach File
            </label>
            <input
              key={modalOpen ? 'open' : 'closed'}
              type="file"
              onChange={(e) => setForm((f) => ({ ...f, file: e.target.files?.[0] || null }))}
              className="w-full text-xs file:mr-3 file:px-4 file:py-2 file:rounded-lg file:border-0 file:bg-brand file:text-white file:text-xs file:font-semibold"
            />
          </div>
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 text-xs font-semibold rounded-xl bg-brand text-white hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {submitting ? 'Posting…' : 'Post Notes'}
            </button>
          </div>
        </form>
      </Modal>

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getMyClassrooms, getStudentHistory } from '../../services/studentService';

export default function StudentHome() {
  const { user } = useAuth();
  const [classrooms, setClassrooms] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [cData, hData] = await Promise.all([getMyClassrooms(), getStudentHistory()]);
        setClassrooms(cData.classrooms || []);
        const pending = [
          ...(hData.libraryHistory || []).filter((h) => ['Pending', 'Approved'].includes(h.status)),
          ...(hData.labHistory || []).filter((h) => ['Pending', 'Approved'].includes(h.status)),
        ];
        setReminders(pending);
      } catch {
        // silent-home 
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="space-y-10">
      <div>
        <span className="text-[11px] uppercase tracking-[0.25em] font-semibold text-neutral-500 dark:text-neutral-400 block mb-2">
          Student Dashboard
        </span>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {user?.name?.split(' ')[0] || 'Student'}
        </h1>
        <div className="flex items-center gap-2 mt-2">
          {user?.department?.name && (
            <span className="text-[10px] uppercase tracking-wide px-2 py-1 rounded bg-neutral-200/60 dark:bg-neutral-800/60 text-neutral-600 dark:text-neutral-300">
              {user.department.name}
            </span>
          )}
          {user?.year && (
            <span className="text-[10px] uppercase tracking-wide px-2 py-1 rounded bg-neutral-200/60 dark:bg-neutral-800/60 text-neutral-600 dark:text-neutral-300">
              Year {user.year}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/student/departments"
          className="border border-border-subtle rounded-2xl p-6 bg-surface hover:bg-neutral-200/40 dark:hover:bg-neutral-800/40 transition-colors"
        >
          <h2 className="text-lg font-semibold mb-2">Department & Classrooms</h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Access your department classrooms, course syllabus, and lecture notes.
          </p>
        </Link>

        <Link
          to="/student/library"
          className="border border-border-subtle rounded-2xl p-6 bg-surface hover:bg-neutral-200/40 dark:hover:bg-neutral-800/40 transition-colors"
        >
          <h2 className="text-lg font-semibold mb-2">Library Resources</h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Browse stack categories, search the catalogue, and request book loans.
          </p>
        </Link>

        <Link
          to="/student/lab"
          className="border border-border-subtle rounded-2xl p-6 bg-surface hover:bg-neutral-200/40 dark:hover:bg-neutral-800/40 transition-colors"
        >
          <h2 className="text-lg font-semibold mb-2">Lab Equipment</h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Reserve laboratory apparatus and precision instruments.
          </p>
        </Link>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Joined Classrooms</h2>
          <Link to="/student/departments" className="text-xs font-semibold text-brand hover:underline">
            Browse departments →
          </Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 rounded-xl bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
            ))}
          </div>
        ) : classrooms.length === 0 ? (
          <p className="text-sm text-neutral-500 dark:text-neutral-400 border border-dashed border-border-subtle rounded-xl p-6 text-center">
            You haven't joined any classrooms yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {classrooms.map((c) => (
              <Link
                key={c._id}
                to={`/student/classrooms/${c._id}`}
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
      </div>

      {reminders.length > 0 && (
        <div className="border border-amber-500/30 bg-amber-500/10 rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-amber-700 dark:text-amber-400 mb-3">
            Active Requests & Reminders
          </h3>
          <ul className="space-y-2">
            {reminders.slice(0, 5).map((r) => (
              <li key={r._id} className="text-xs text-neutral-700 dark:text-neutral-300 flex items-center justify-between">
                <span>{r.book?.title || r.equipment?.name}</span>
                <span className="font-medium">
                  {r.status}
                  {r.dueDate ? ` · due ${new Date(r.dueDate).toLocaleDateString()}` : ''}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
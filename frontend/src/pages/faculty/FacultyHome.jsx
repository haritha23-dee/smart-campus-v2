import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function FacultyHome() {
  const { user } = useAuth();

  return (
    <div className="space-y-10">
      <div>
        <span className="text-[11px] uppercase tracking-[0.25em] font-semibold text-neutral-500 dark:text-neutral-400 block mb-2">
          Faculty Dashboard
        </span>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {user?.name?.split(' ')[0] || 'Faculty'}
        </h1>
        <div className="flex items-center gap-2 mt-2">
          {user?.department?.name && (
            <span className="text-[10px] uppercase tracking-wide px-2 py-1 rounded bg-neutral-200/60 dark:bg-neutral-800/60 text-neutral-600 dark:text-neutral-300">
              {user.department.name}
            </span>
          )}
          {user?.designation && (
            <span className="text-[10px] uppercase tracking-wide px-2 py-1 rounded bg-neutral-200/60 dark:bg-neutral-800/60 text-neutral-600 dark:text-neutral-300">
              {user.designation}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          to="/faculty/classrooms?tab=mine"
          className="border border-border-subtle rounded-2xl p-6 bg-surface hover:bg-neutral-200/40 dark:hover:bg-neutral-800/40 transition-colors"
        >
          <h2 className="text-lg font-semibold mb-2">My Classrooms</h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Access classrooms you are currently teaching in.
          </p>
        </Link>

        <Link
          to="/faculty/classrooms?tab=available"
          className="border border-border-subtle rounded-2xl p-6 bg-surface hover:bg-neutral-200/40 dark:hover:bg-neutral-800/40 transition-colors"
        >
          <h2 className="text-lg font-semibold mb-2">Join / Create Classroom</h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Browse existing department classrooms or initialize a new section.
          </p>
        </Link>
      </div>
    </div>
  );
}
import { Link } from 'react-router-dom';

export default function AdminHome() {
  return (
    <div className="max-w-5xl mx-auto px-10 py-16">
      <span className="text-[11px] uppercase tracking-[0.25em] font-semibold text-neutral-500 dark:text-neutral-400 block mb-2">
        Admin Dashboard
      </span>
      <h1 className="text-3xl font-bold tracking-tight mb-10">Welcome back</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link
                to="/admin/users"
                className="border border-border-subtle rounded-2xl bg-surface p-6 hover:shadow-lg transition-all">
                <h2 className="text-lg font-semibold mb-2">User Management</h2>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Create, disable, and manage accounts across every role.
                </p>
            </Link>

            <Link
                to="/admin/departments"
                className="border border-border-subtle rounded-2xl bg-surface p-6 hover:shadow-lg transition-all">
                <h2 className="text-lg font-semibold mb-2">Department Setup</h2>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Add departments and review their classrooms and headcounts.
                </p>
            </Link>

            <Link
                to="/admin/analytics"
                className="border border-border-subtle rounded-2xl bg-surface p-6 hover:shadow-lg transition-all">
                <h2 className="text-lg font-semibold mb-2">Usage Analytics</h2>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Track bookings, resources, and activity across campus.
                </p>
            </Link>
        </div>
    </div>
  );
}
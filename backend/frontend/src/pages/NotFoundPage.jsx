import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-10 text-center">
      <span className="text-[11px] uppercase tracking-[0.25em] font-semibold text-neutral-500 dark:text-neutral-400 block mb-4">
        404
      </span>
      <h1 className="text-3xl font-bold tracking-tight mb-4">Page not found</h1>
      <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-8">
        The page you're looking for doesn't exist or has moved.
      </p>
      <Link
        to="/"
        className="bg-brand hover:opacity-90 text-white font-medium px-6 py-2.5 rounded-lg text-sm transition-opacity"
      >
        Back home
      </Link>
    </div>
  );
}
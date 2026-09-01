import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-border-subtle px-10 py-16 mt-24">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">

        <div>
          <span className="text-[11px] uppercase tracking-[0.25em] font-semibold text-neutral-500 dark:text-neutral-400 block mb-4">
            Smart Campus Resource Portal
          </span>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-xs">
            A unified platform for students, faculty, and staff to share and access campus resources.
          </p>
        </div>

        <div>
          <span className="text-xs uppercase tracking-widest font-semibold mb-4 block">
            Join As
          </span>
          <ul className="space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
            <li>
              <Link to="/login/student" className="hover:text-brand transition-colors">
                Student Login
              </Link>
            </li>
            <li>
              <Link to="/login/faculty" className="hover:text-brand transition-colors">
                Faculty Login
              </Link>
            </li>
            <li>
              <Link to="/login/library-staff" className="hover:text-brand transition-colors">
                Library Staff Login
              </Link>
            </li>
            <li>
              <Link to="/login/lab-staff" className="hover:text-brand transition-colors">
                Lab Staff Login
              </Link>
            </li>
            <li>
              <Link to="/login/admin" className="hover:text-brand transition-colors">
                Admin Login
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <span className="text-xs uppercase tracking-widest font-semibold mb-4 block">
            Legal
          </span>
          <ul className="space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
            <li>
              <Link to="/legal/privacy" className="hover:text-brand transition-colors">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link to="/legal/terms" className="hover:text-brand transition-colors">
                Terms of Service
              </Link>
            </li>
          </ul>
        </div>

      </div>
    </footer>
  );
}
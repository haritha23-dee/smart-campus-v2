// frontend/src/components/common/Navbar.jsx
import { Link, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '../../context/AuthContext';

const roleHome = {
  admin: '/admin',
  student: '/student',
  faculty: '/faculty',
  library_staff: '/library-staff',
  lab_staff: '/lab-staff',
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate('/');
  };

  const initials = user?.name
    ? user.name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()
    : '';

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-10 py-5 border-b border-border-subtle bg-canvas/80 backdrop-blur-md">
      <Link
        to="/"
        className="text-[11px] uppercase tracking-[0.25em] font-semibold text-neutral-500 dark:text-neutral-400 hover:opacity-80 transition-opacity"
      >
        Smart Campus Resource Portal
      </Link>

      <nav className="hidden md:flex items-center gap-8 text-xs uppercase tracking-widest font-medium">
        <Link to="/" className="hover:opacity-70 transition-opacity">Home</Link>
        <Link to="/#how-it-works" className="hover:opacity-70 transition-opacity">How It Works</Link>
        <Link to="/#features" className="hover:opacity-70 transition-opacity">Features</Link>
        <Link to="/about" className="hover:opacity-70 transition-opacity">About Us</Link>
      </nav>

      <div className="flex items-center gap-6">
        <ThemeToggle />

        {user ? (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setOpen((o) => !o)}
              className="flex items-center gap-2.5 rounded-lg pl-1.5 pr-3 py-1.5 border border-border-subtle hover:bg-neutral-200/40 dark:hover:bg-neutral-800/40 transition-colors"
            >
              {user.photo ? (
                <img src={user.photo} alt={user.name} className="w-7 h-7 rounded-full object-cover border border-brand" />
              ) : (
                <span className="w-7 h-7 rounded-full bg-brand text-white text-xs font-semibold flex items-center justify-center">
                  {initials}
                </span>
              )}
              <span className="text-xs font-medium normal-case tracking-normal">{user.name}</span>
            </button>

            {open && (
              <div className="absolute right-0 mt-2 w-44 rounded-xl border border-border-subtle bg-surface shadow-lg overflow-hidden text-xs z-50">
                <Link
                  to={roleHome[user.role] || '/'}
                  onClick={() => setOpen(false)}
                  className="block px-4 py-2.5 normal-case tracking-normal font-medium hover:bg-neutral-200/40 dark:hover:bg-neutral-800/40 transition-colors"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2.5 normal-case tracking-normal font-medium text-red-600 dark:text-red-400 hover:bg-neutral-200/40 dark:hover:bg-neutral-800/40 transition-colors"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link
            to="/login"
            className="bg-brand text-white text-xs font-semibold tracking-widest uppercase px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity"
          >
            Sign In
          </Link>
        )}
      </div>
    </header>
  );
}
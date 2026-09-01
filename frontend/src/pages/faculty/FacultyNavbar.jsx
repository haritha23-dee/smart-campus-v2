import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, User, LogOut, LayoutDashboard, History } from 'lucide-react';
import ThemeToggle from '../../components/common/ThemeToggle';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import NotificationDropdown from '../../pages/admin/NotificationDropdown';
import { resolveFileUrl } from '../../services/facultyService';

export default function FacultyNavbar() {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const [bellOpen, setBellOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const bellRef = useRef(null);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setProfileMenuOpen(false);
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  const initials = user?.name
    ? user.name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()
    : 'F';

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-10 py-5 border-b border-border-subtle bg-canvas/80 backdrop-blur-md">
      <Link
        to="/faculty"
        className="text-[11px] uppercase tracking-[0.25em] font-semibold text-neutral-500 dark:text-neutral-400 hover:opacity-70 transition-opacity"
      >
        Smart Campus Resource Portal — Faculty
      </Link>

      <div className="flex items-center gap-5">
        <ThemeToggle />

        <div className="relative">
          <button
            ref={bellRef}
            type="button"
            aria-label="Notifications"
            onClick={() => setBellOpen((o) => !o)}
            className="relative p-2 rounded-full text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-semibold flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          <NotificationDropdown open={bellOpen} onClose={() => setBellOpen(false)} anchorRef={bellRef} />
        </div>

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setProfileMenuOpen((o) => !o)}
            className="flex items-center gap-2.5 rounded-xl pl-1.5 pr-3 py-1.5 border border-border-subtle hover:bg-neutral-200/50 dark:hover:bg-neutral-800/60 transition-colors cursor-pointer"
          >
            {user?.photo ? (
              <img src={resolveFileUrl(user.photo)} alt={user.name} className="w-7 h-7 rounded-full object-cover border border-brand" />
            ) : (
              <span className="w-7 h-7 rounded-full bg-brand text-white text-xs font-semibold flex items-center justify-center">
                {initials}
              </span>
            )}
            <span className="text-xs font-medium normal-case tracking-normal">{user?.name || 'Faculty'}</span>
            <span className="text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-neutral-200/60 dark:bg-neutral-800/60 text-neutral-500 dark:text-neutral-400">
              faculty
            </span>
          </button>

          {profileMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-xl border border-border-subtle bg-surface shadow-xl py-1.5 z-50">
              <button
                onClick={() => { setProfileMenuOpen(false); navigate('/faculty'); }}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50 transition-colors text-left"
              >
                <LayoutDashboard className="w-4 h-4 text-neutral-500" />
                <span>Dashboard</span>
              </button>
              <button
                onClick={() => { setProfileMenuOpen(false); navigate('/faculty/history'); }}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50 transition-colors text-left"
              >
                <History className="w-4 h-4 text-neutral-500" />
                <span>My Resources</span>
              </button>
              <button
                onClick={() => { setProfileMenuOpen(false); navigate('/faculty/profile'); }}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50 transition-colors text-left"
              >
                <User className="w-4 h-4 text-neutral-500" />
                <span>Profile Settings</span>
              </button>
              <div className="my-1 border-t border-border-subtle" />
              <button
                onClick={() => { setProfileMenuOpen(false); handleLogout(); }}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-500/10 transition-colors text-left"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
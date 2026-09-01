// frontend/src/pages/LoginPage.jsx
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldCheck, 
  GraduationCap, 
  BookOpen, 
  Library, 
  FlaskConical, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

const ROLES_CONFIG = {
  admin: {
    key: 'admin',
    label: 'Admin',
    tagline: 'Campus Administration & Governance',
    badge: 'System Governance',
    icon: ShieldCheck,
    description: 'Manage campus departments, user provisioning, cross-module access controls, and real-time audit analytics.',
    bulletPoints: [
      'Role-based access & credential control',
      'Departmental & classroom setup',
      'Live audit logs & inventory tracking'
    ],
    stats: 'Full System Control'
  },
  student: {
    key: 'student',
    label: 'Student',
    tagline: 'Academic Resources & Equipment',
    badge: 'Student Portal',
    icon: GraduationCap,
    description: 'Access lecture archives, request syllabus materials, borrow library volumes, and reserve laboratory apparatus.',
    bulletPoints: [
      'One-click classroom material downloads',
      'Library loan & renewal tracking',
      'Lab workstation bookings'
    ],
    stats: 'Unified Student Hub'
  },
  faculty: {
    key: 'faculty',
    label: 'Faculty',
    tagline: 'Curriculum & Classroom Management',
    badge: 'Faculty Portal',
    icon: BookOpen,
    description: 'Publish classroom study guides, approve student resource inquiries, and oversee department allocations.',
    bulletPoints: [
      'Upload course materials & syllabus',
      'Review student resource requests',
      'Department timetable insights'
    ],
    stats: 'Academic Management'
  },
  library_staff: {
    key: 'library_staff',
    label: 'Library Staff',
    tagline: 'Library Inventory & Issue Desk',
    badge: 'Library Services',
    icon: Library,
    description: 'Manage book inventory, process borrow requests, monitor overdue alerts, and log asset returns in real time.',
    bulletPoints: [
      'Circulation desk operations',
      'Catalogue indexing & status updates',
      'Automated due date escalation'
    ],
    stats: 'Campus Library Hub'
  },
  lab_staff: {
    key: 'lab_staff',
    label: 'Lab Staff',
    tagline: 'Laboratory Assets & Maintenance',
    badge: 'Laboratory Services',
    icon: FlaskConical,
    description: 'Supervise precision apparatus, approve equipment checkout requests, and monitor experiment schedules.',
    bulletPoints: [
      'Lab equipment availability checks',
      'Experiment schedule coordination',
      'Maintenance & usage auditing'
    ],
    stats: 'Lab Asset Control'
  }
};

const roleHome = {
  admin: '/admin',
  student: '/student',
  faculty: '/faculty',
  library_staff: '/library-staff',
  lab_staff: '/lab-staff',
};

export default function LoginPage() {
  const { role: routeRole } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  const activeRoleKey = useMemo(() => {
    const raw = routeRole || searchParams.get('role') || 'admin';
    const normalized = raw.replace('-', '_').toLowerCase();
    return ROLES_CONFIG[normalized] ? normalized : 'admin';
  }, [routeRole, searchParams]);

  const activeRole = ROLES_CONFIG[activeRoleKey];
  const RoleIcon = activeRole.icon;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const response = await login(email, password);
      const userRole = response?.user?.role || response?.role || activeRoleKey;
      const destination = roleHome[userRole] || '/admin';
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Invalid credentials. Please verify and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 rounded-3xl border border-border-subtle bg-surface shadow-2xl overflow-hidden backdrop-blur-xl transition-all">
        
        <div className="lg:col-span-5 relative p-8 sm:p-10 flex flex-col justify-between bg-gradient-to-br from-neutral-900 via-neutral-950 to-neutral-900 text-white overflow-hidden border-b lg:border-b-0 lg:border-r border-neutral-800">
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-brand/25 dark:bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-amber-500/15 dark:bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[11px] uppercase tracking-wider font-semibold text-neutral-200">
              <RoleIcon className="w-3.5 h-3.5 text-brand dark:text-blue-400" />
              <span>{activeRole.badge}</span>
            </div>

            <div>
              <span className="text-[10px] uppercase tracking-[0.25em] text-neutral-400 font-semibold block mb-1">
                Smart Campus Portal
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
                {activeRole.tagline}
              </h2>
            </div>

            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed pt-1">
              {activeRole.description}
            </p>
          </div>

          <div className="relative z-10 my-8 space-y-3">
            {activeRole.bulletPoints.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2.5 text-xs text-neutral-200">
                <span className="flex-shrink-0 w-4 h-4 rounded-full bg-white/10 flex items-center justify-center text-[10px] text-brand dark:text-blue-400 font-bold">*
                </span>
                <span>{item}</span>
              </div>
            ))}
          </div>

          <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-neutral-400">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand dark:text-blue-400" />
              <span>{activeRole.stats}</span>
            </div>
            <span className="text-[11px] font-mono text-neutral-400">SSO Ready</span>
          </div>
        </div>

        <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-between bg-canvas/50">
          <div>
            <div className="flex items-center gap-1 p-1 mb-8 rounded-xl bg-neutral-200/60 dark:bg-neutral-800/60 border border-border-subtle overflow-x-auto no-scrollbar">
              {Object.values(ROLES_CONFIG).map((r) => {
                const isActive = r.key === activeRoleKey;
                const path = `/login/${r.key.replace('_', '-')}`;
                return (
                  <Link
                    key={r.key}
                    to={path}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                      isActive
                        ? 'bg-surface text-neutral-900 dark:text-white shadow-sm border border-border-subtle'
                        : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
                    }`}
                  >
                    <span>{r.label}</span>
                  </Link>
                );
              })}
            </div>

            <div className="mb-6">
              <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
                Sign in to your account
              </h1>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                Enter your university credentials to access the {activeRole.label} dashboard.
              </p>
            </div>

            {error && (
              <div role="alert" className="mb-6 p-3.5 rounded-xl border border-red-500/20 bg-red-500/10 text-xs font-semibold text-red-600 dark:text-red-400 flex items-center justify-between">
                <span>{error}</span>
                <button type="button" onClick={() => setError('')} className="text-sm font-bold ml-2">
                  &times;
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-neutral-600 dark:text-neutral-300 mb-1.5">
                  Institutional Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={`${activeRoleKey}@campus.edu`}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border-subtle bg-surface text-xs focus:outline-none focus:ring-2 focus:ring-brand font-medium transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-neutral-600 dark:text-neutral-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-border-subtle bg-surface text-xs focus:outline-none focus:ring-2 focus:ring-brand font-medium transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 p-1"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 text-xs">
                <label className="flex items-center gap-2 cursor-pointer select-none text-neutral-600 dark:text-neutral-400">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-border-subtle accent-brand cursor-pointer"
                  />
                  <span>Remember this session</span>
                </label>
                <span className="text-[11px] text-neutral-400 cursor-default">
                  Contact admin for password recovery
                </span>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-2 flex items-center justify-center gap-2 bg-brand hover:opacity-90 active:scale-[0.99] text-white font-semibold py-3 rounded-xl text-xs transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>{submitting ? 'Authenticating…' : `Sign In as ${activeRole.label}`}</span>
                {!submitting && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
          </div>

          <div className="mt-8 pt-4 border-t border-border-subtle flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400">
            <span>Secured via SHA-256 JWT Authentication</span>
            <Link to="/" className="hover:text-brand transition-colors font-medium">
              &larr; Return Home
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
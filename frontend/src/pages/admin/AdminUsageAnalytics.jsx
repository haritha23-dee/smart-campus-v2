import { useEffect, useState, useCallback } from 'react';
import {
  PieChart, Pie, Cell, Legend, Tooltip as PieTooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as BarTooltip,
} from 'recharts';
import { getAnalytics, getAuditLog, listUsers } from '../../services/adminService';
import { ROLE_LABELS } from '../../constants/adminConstants';
import { useTheme } from '../../context/ThemeContext';
import Toast from '../../components/common/Toast';

const SUMMARY_TILES = [
  { key: 'totalUsers', label: 'Total Users' },
  { key: 'totalStudents', label: 'Students' },
  { key: 'totalFaculty', label: 'Faculty' },
  { key: 'totalClassrooms', label: 'Classrooms' },
  { key: 'totalResourcesPosted', label: 'Resources Posted' },
  { key: 'activeLibraryBookings', label: 'Active Library Bookings' },
  { key: 'activeLabBookings', label: 'Active Lab Bookings' },
  { key: 'overdueItemsCount', label: 'Overdue Items' },
];

const ROLE_ORDER = ['student', 'faculty', 'library_staff', 'lab_staff', 'admin'];

const LIGHT_PALETTE = ['#7C0A02', '#B91C1C', '#DC143C', '#EA580C', '#B45309'];
const DARK_PALETTE = ['#3B82F6', '#60A5FA', '#818CF8', '#38BDF8', '#22D3EE'];

export default function AdminUsageAnalytics() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const palette = isDark ? DARK_PALETTE : LIGHT_PALETTE;
  const gridColor = isDark ? '#262626' : '#E5E2DC';
  const textColor = isDark ? '#94A3B8' : '#57534E';

  const [data, setData] = useState(null);
  const [roleBreakdown, setRoleBreakdown] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState(null);

  const load = useCallback(async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
    try {
      const [analytics, audit, roleCounts] = await Promise.all([
        getAnalytics(),
        getAuditLog().catch(() => ({ logs: [] })),
        Promise.all(ROLE_ORDER.map((role) => listUsers({ role }))),
      ]);
      setData(analytics);
      setLogs(audit.logs || []);
      setRoleBreakdown(
        ROLE_ORDER.map((role, i) => ({
          name: ROLE_LABELS[role],
          value: roleCounts[i]?.count ?? 0,
        })).filter((r) => r.value > 0)
      );
    } catch (err) {
      setToast({ type: 'error', message: err?.response?.data?.message || 'Failed to load analytics.' });
    } finally {
      isRefresh ? setRefreshing(false) : setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const summary = data?.summary || {};
  const bookingBreakdown = data?.bookingStatusBreakdown || [];
  const classroomBreakdown = data?.classroomBreakdown || [];
  const resourceActivity = data?.resourceActivityByFaculty || [];
  const enrollment = (data?.enrollmentByDepartment || []).map((e) => ({
    department: e.department || 'Unassigned',
    count: e.count,
  }));

  const cardClass = 'border border-border-subtle rounded-2xl bg-surface p-6';
  const headingClass = 'text-lg font-semibold mb-4';
  const thClass = 'px-4 py-3 font-medium';
  const tdClass = 'px-4 py-3';

  const tooltipStyle = {
    backgroundColor: isDark ? '#111111' : '#f4f1ea',
    border: `1px solid ${gridColor}`,
    borderRadius: '8px',
    fontSize: '12px',
    color: isDark ? '#F8FAFC' : '#1C1917',
  };

  return (
    <div className="max-w-6xl mx-auto px-10 py-16">
      <div className="flex items-center justify-between mb-10">
        <div>
          <span className="text-[11px] uppercase tracking-[0.25em] font-semibold text-neutral-500 dark:text-neutral-400 block mb-2">
            Admin
          </span>
          <h1 className="text-3xl font-bold tracking-tight">Usage Analytics</h1>
        </div>
        <button
          onClick={() => load(true)}
          disabled={refreshing || loading}
          className="border border-border-subtle hover:bg-neutral-200/40 dark:hover:bg-neutral-800/40 font-medium px-5 py-2.5 rounded-lg text-sm transition-colors disabled:opacity-50"
        >
          {refreshing ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-24 rounded-2xl bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {SUMMARY_TILES.map((t) => (
              <div key={t.key} className={cardClass}>
                <span className="block text-3xl font-bold tracking-tight mb-1">
                  {summary[t.key] ?? 0}
                </span>
                <span className="text-xs text-neutral-500 dark:text-neutral-400">{t.label}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
            <div className={cardClass}>
              <h2 className={headingClass}>User Role Breakdown</h2>
              {roleBreakdown.length === 0 ? (
                <p className="text-sm text-neutral-500 dark:text-neutral-400">No users yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={roleBreakdown}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={60}
                      outerRadius={95}
                      paddingAngle={2}
                    >
                      {roleBreakdown.map((_, i) => (
                        <Cell key={i} fill={palette[i % palette.length]} />
                      ))}
                    </Pie>
                    <PieTooltip contentStyle={tooltipStyle} />
                    <Legend wrapperStyle={{ fontSize: '12px', color: textColor }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Enrollment by Department — Bar */}
            <div className={cardClass}>
              <h2 className={headingClass}>Enrollment by Department</h2>
              {enrollment.length === 0 ? (
                <p className="text-sm text-neutral-500 dark:text-neutral-400">No enrollment data yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={enrollment}>
                    <CartesianGrid stroke={gridColor} strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="department" tick={{ fontSize: 11, fill: textColor }} />
                    <YAxis tick={{ fontSize: 11, fill: textColor }} allowDecimals={false} />
                    <BarTooltip contentStyle={tooltipStyle} cursor={{ fill: isDark ? '#1f1f1f' : '#f0ede3' }} />
                    <Bar dataKey="count" fill={palette[0]} radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className={`${cardClass} mb-10`}>
            <h2 className={headingClass}>Booking Status Comparison</h2>
            {bookingBreakdown.length === 0 ? (
              <p className="text-sm text-neutral-500 dark:text-neutral-400">No booking data yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={bookingBreakdown}>
                  <CartesianGrid stroke={gridColor} strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="status" tick={{ fontSize: 11, fill: textColor }} className="capitalize" />
                  <YAxis tick={{ fontSize: 11, fill: textColor }} allowDecimals={false} />
                  <BarTooltip contentStyle={tooltipStyle} cursor={{ fill: isDark ? '#1f1f1f' : '#f0ede3' }} />
                  <Legend wrapperStyle={{ fontSize: '12px', color: textColor }} />
                  <Bar dataKey="library" name="Library" fill={palette[0]} radius={[6, 6, 0, 0]} />
                  <Bar dataKey="lab" name="Lab" fill={palette[1]} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className={`${cardClass} mb-10`}>
            <h2 className={headingClass}>Classroom Breakdown</h2>
            {classroomBreakdown.length === 0 ? (
              <p className="text-sm text-neutral-500 dark:text-neutral-400">No classrooms yet.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400 border-b border-border-subtle">
                    <th className={thClass}>Code</th>
                    <th className={thClass}>Year</th>
                    <th className={thClass}>Section</th>
                    <th className={thClass}>Faculty</th>
                    <th className={thClass}>Students</th>
                  </tr>
                </thead>
                <tbody>
                  {classroomBreakdown.map((c, i) => (
                    <tr key={`${c.code}-${i}`} className="border-b border-border-subtle last:border-0">
                      <td className={`${tdClass} font-medium`}>{c.code}</td>
                      <td className={tdClass}>{c.year}</td>
                      <td className={tdClass}>{c.section}</td>
                      <td className={tdClass}>{c.facultyCount}</td>
                      <td className={tdClass}>{c.studentCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className={`${cardClass} mb-10`}>
            <h2 className={headingClass}>Resource Activity by Faculty</h2>
            {resourceActivity.length === 0 ? (
              <p className="text-sm text-neutral-500 dark:text-neutral-400">No resource activity yet.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400 border-b border-border-subtle">
                    <th className={thClass}>Name</th>
                    <th className={thClass}>Email</th>
                    <th className={thClass}>Resources Posted</th>
                  </tr>
                </thead>
                <tbody>
                  {resourceActivity.map((r, i) => (
                    <tr key={`${r.email}-${i}`} className="border-b border-border-subtle last:border-0">
                      <td className={`${tdClass} font-medium`}>{r.name}</td>
                      <td className={`${tdClass} text-neutral-600 dark:text-neutral-400`}>{r.email}</td>
                      <td className={tdClass}>{r.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className={cardClass}>
            <h2 className={headingClass}>Recent Activity</h2>
            {logs.length === 0 ? (
              <p className="text-sm text-neutral-500 dark:text-neutral-400">No recent activity.</p>
            ) : (
              <div className="space-y-3">
                {logs.slice(0, 20).map((log, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-sm border-b border-border-subtle last:border-0 pb-3 last:pb-0"
                  >
                    <span>
                      <span className="font-medium">{log.performedBy?.name}</span>
                      <span className="text-neutral-500 dark:text-neutral-400"> ({log.performedBy?.role}) </span>
                      {log.action} <span className="text-neutral-500 dark:text-neutral-400">{log.targetType}</span>
                    </span>
                    <span className="text-xs text-neutral-500 dark:text-neutral-400 whitespace-nowrap ml-4">
                      {new Date(log.createdAt).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
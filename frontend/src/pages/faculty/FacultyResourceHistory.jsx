import { useState, useEffect, useMemo } from 'react';
import { getResourceHistory, resolveFileUrl } from '../../services/facultyService';
import { RESOURCE_TYPE_OPTIONS, RESOURCE_TYPE_LABELS } from '../../constants/facultyConstants';

export default function FacultyResourceHistory() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [classroomFilter, setClassroomFilter] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { resources: res } = await getResourceHistory();
        setResources(res || []);
      } catch {} 
      finally {
        setLoading(false);
      }
    })();
  }, []);

  const classroomOptions = useMemo(
    () => [...new Set(resources.map((r) => r.classroom?.code).filter(Boolean))],
    [resources]
  );

  const subjectOptions = useMemo(
    () => [...new Set(resources.map((r) => r.subject).filter(Boolean))],
    [resources]
  );

  const filtered = resources.filter(
    (r) =>
      (!classroomFilter || r.classroom?.code === classroomFilter) &&
      (!subjectFilter || r.subject === subjectFilter) &&
      (!typeFilter || r.type === typeFilter) &&
      (!dateFilter || new Date(r.createdAt).toISOString().split('T')[0] === dateFilter)
  );

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-border-subtle">
        <span className="text-[11px] uppercase tracking-[0.25em] font-semibold text-neutral-500 dark:text-neutral-400 block mb-1">
          Faculty
        </span>
        <h1 className="text-2xl font-bold tracking-tight">My Resources</h1>
      </div>

      <div className="flex flex-wrap gap-3">
        <select
          value={classroomFilter}
          onChange={(e) => setClassroomFilter(e.target.value)}
          className="px-4 py-2 text-xs rounded-xl bg-canvas border border-border-subtle focus:outline-none focus:ring-2 focus:ring-brand"
        >
          <option value="">All Classrooms</option>
          {classroomOptions.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select
          value={subjectFilter}
          onChange={(e) => setSubjectFilter(e.target.value)}
          className="px-4 py-2 text-xs rounded-xl bg-canvas border border-border-subtle focus:outline-none focus:ring-2 focus:ring-brand"
        >
          <option value="">All Subjects</option>
          {subjectOptions.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-4 py-2 text-xs rounded-xl bg-canvas border border-border-subtle focus:outline-none focus:ring-2 focus:ring-brand"
        >
          <option value="">All Types</option>
          {RESOURCE_TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="px-4 py-2 text-xs rounded-xl bg-canvas border border-border-subtle focus:outline-none focus:ring-2 focus:ring-brand"
        />
        {(classroomFilter || subjectFilter || typeFilter || dateFilter) && (
          <button
            type="button"
            onClick={() => {
              setClassroomFilter('');
              setSubjectFilter('');
              setTypeFilter('');
              setDateFilter('');
            }}
            className="px-4 py-2 text-xs font-semibold rounded-xl border border-border-subtle hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            Clear Filters
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-14 rounded-xl bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-neutral-500 dark:text-neutral-400 border border-dashed border-border-subtle rounded-xl p-6 text-center">
          No resources match these filters.
        </p>
      ) : (
        <div className="border border-border-subtle rounded-2xl overflow-hidden bg-surface">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border-subtle text-left text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                <th className="px-4 py-3 font-semibold">Title</th>
                <th className="px-4 py-3 font-semibold">Type</th>
                <th className="px-4 py-3 font-semibold">Subject</th>
                <th className="px-4 py-3 font-semibold">Classroom</th>
                <th className="px-4 py-3 font-semibold">Date Posted</th>
                <th className="px-4 py-3 font-semibold"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r._id} className="border-b border-border-subtle last:border-0">
                  <td className="px-4 py-3 font-medium">{r.title}</td>
                  <td className="px-4 py-3">{RESOURCE_TYPE_LABELS[r.type] || r.type}</td>
                  <td className="px-4 py-3">{r.subject}</td>
                  <td className="px-4 py-3">{r.classroom?.code || '—'}</td>
                  <td className="px-4 py-3">{new Date(r.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => window.open(resolveFileUrl(r.fileUrl || r.filePath), '_blank')}
                      className="font-semibold text-brand hover:underline cursor-pointer"
                    >
                      Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { listDepartments, getDepartmentClassrooms, joinClassroom, getMyClassrooms } from '../../services/studentService';
import Toast from '../../components/common/Toast';

export default function StudentDepartmentsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [activeDept, setActiveDept] = useState('');
  const [classrooms, setClassrooms] = useState([]);
  const [loadingDepts, setLoadingDepts] = useState(true);
  const [loadingClassrooms, setLoadingClassrooms] = useState(false);
  const [joiningId, setJoiningId] = useState(null);
  const [toast, setToast] = useState(null);
  const [tab, setTab] = useState('mine'); // 'mine' | 'departments'
  const [myClassrooms, setMyClassrooms] = useState([]);
  const [loadingMine, setLoadingMine] = useState(true);

  const assignedDeptId = user?.department?._id || user?.department;

  useEffect(() => {
    (async () => {
      setLoadingDepts(true);
      try {
        const { departments: depts } = await listDepartments();
        setDepartments(depts || []);
        setActiveDept(assignedDeptId || depts?.[0]?._id || '');
      } catch (err) {
        setToast({ type: 'error', message: err?.response?.data?.message || 'Failed to load departments.' });
      } finally {
        setLoadingDepts(false);
      }
    })();
  }, [assignedDeptId]);

  const fetchClassrooms = useCallback(async () => {
    if (!activeDept) return;
    setLoadingClassrooms(true);
    try {
      const { classrooms: rooms } = await getDepartmentClassrooms(activeDept);
      setClassrooms(rooms || []);
    } catch (err) {
      setToast({ type: 'error', message: err?.response?.data?.message || 'Failed to load classrooms.' });
    } finally {
      setLoadingClassrooms(false);
    }
  }, [activeDept]);

  useEffect(() => {
    fetchClassrooms();
  }, [fetchClassrooms]);

  const fetchMine = useCallback(async () => {
    setLoadingMine(true);
    try {
      const { classrooms } = await getMyClassrooms();
      setMyClassrooms(classrooms || []);
    } catch (err) {
      setToast({ type: 'error', message: err?.response?.data?.message || 'Failed to load your classrooms.' });
    } finally {
      setLoadingMine(false);
    }
  }, []);

  useEffect(() => {
    fetchMine();
  }, [fetchMine]);

  const joinedIds = new Set(myClassrooms.map((c) => c._id));

  const handleJoin = async (classroomId) => {
    setJoiningId(classroomId);
    try {
      await joinClassroom(classroomId);
      setToast({ type: 'success', message: 'Joined classroom successfully.' });
      fetchClassrooms();
      fetchMine();
    } catch (err) {
      setToast({ type: 'error', message: err?.response?.data?.message || 'Failed to join classroom.' });
    } finally {
      setJoiningId(null);
    }
  };

  const isAssigned = (deptId) => deptId === assignedDeptId;

  return (
    <div className="space-y-8">
      <div>
        <span className="text-[11px] uppercase tracking-[0.25em] font-semibold text-neutral-500 dark:text-neutral-400 block mb-2">
          Department Access
        </span>
        <h1 className="text-2xl font-bold tracking-tight">Departments & Classrooms</h1>
      </div>

      <div className="flex gap-2 border-b border-border-subtle">
        {['mine', 'departments'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-xs font-semibold border-b-2 -mb-px transition-colors ${
              tab === t ? 'border-brand text-brand' : 'border-transparent text-neutral-500'
            }`}
          >
            {t === 'mine' ? 'My Joined Classrooms' : 'Available Departments'}
          </button>
        ))}
      </div>

      {tab === 'mine' && (
        loadingMine ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 rounded-2xl bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
            ))}
          </div>
        ) : myClassrooms.length === 0 ? (
          <p className="text-sm text-neutral-500 dark:text-neutral-400 border border-dashed border-border-subtle rounded-xl p-6 text-center">
            You haven't joined any classrooms yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {myClassrooms.map((c) => (
              <div key={c._id} className="border border-border-subtle rounded-2xl p-5 bg-surface space-y-3">
                <div>
                  <p className="font-semibold text-sm">{c.code}</p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                    Year {c.year} · Section {c.section}
                  </p>
                </div>
                <button
                  onClick={() => navigate(`/student/classrooms/${c._id}`)}
                  className="w-full px-4 py-2 rounded-lg text-xs font-semibold bg-brand text-white hover:opacity-90 transition-opacity"
                >
                  Enter Classroom
                </button>
              </div>
            ))}
          </div>
        )
      )}

      {tab === 'departments' && (
        <>
          {loadingDepts ? (
            <div className="flex gap-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-9 w-28 rounded-full bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              {departments.map((d) => (
                <button
                  key={d._id}
                  onClick={() => setActiveDept(d._id)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold border transition-colors ${
                    activeDept === d._id
                      ? 'bg-brand text-white border-brand'
                      : 'border-border-subtle hover:bg-neutral-200/40 dark:hover:bg-neutral-800/40'
                  }`}
                >
                  {d.name}
                  {isAssigned(d._id) && (
                    <span className="ml-1.5 text-[9px] uppercase opacity-80">(Mine)</span>
                  )}
                </button>
              ))}
            </div>
          )}

          {activeDept && !isAssigned(activeDept) && (
            <p className="text-xs text-neutral-500 dark:text-neutral-400 border border-dashed border-border-subtle rounded-xl px-4 py-3">
              Viewing outside your assigned department. Joining classrooms is restricted to your assigned department.
            </p>
          )}

          {loadingClassrooms ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-32 rounded-2xl bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
              ))}
            </div>
          ) : classrooms.length === 0 ? (
            <p className="text-sm text-neutral-500 dark:text-neutral-400 border border-dashed border-border-subtle rounded-xl p-6 text-center">
              No classrooms found in this department yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {classrooms.map((c) => (
                <div key={c._id} className="border border-border-subtle rounded-2xl p-5 bg-surface space-y-3">
                  <div>
                    <p className="font-semibold text-sm">{c.code}</p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                      Year {c.year} · Section {c.section}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      {c.facultyCount} faculty · {c.studentCount} students
                    </p>
                  </div>
                  {joinedIds.has(c._id) ? (
                    <span className="w-full block text-center px-4 py-2 rounded-lg text-xs font-semibold text-neutral-400">
                      Already Joined
                    </span>
                  ) : isAssigned(activeDept) ? (
                    <button
                      onClick={() => handleJoin(c._id)}
                      disabled={joiningId === c._id}
                      className="w-full px-4 py-2 rounded-lg text-xs font-semibold border border-brand text-brand hover:bg-brand hover:text-white transition-colors disabled:opacity-50"
                    >
                      {joiningId === c._id ? 'Joining…' : 'Join Classroom'}
                    </button>
                  ) : (
                    <button
                      disabled
                      title="Joining restricted to your assigned department"
                      className="w-full px-4 py-2 rounded-lg text-xs font-semibold border border-border-subtle text-neutral-400 cursor-not-allowed"
                    >
                      Join Restricted
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
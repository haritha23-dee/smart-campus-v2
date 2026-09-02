import { useState, useEffect, useCallback } from 'react';
import { Wrench } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  listLabSections,
  listEquipmentInLabSection,
  requestEquipmentBooking,
  getStudentHistory,
} from '../../services/studentService';
import { resolveFileUrl } from '../../services/labStaffService';
import Toast from '../../components/common/Toast';

export default function StudentLabPage() {
  const { user } = useAuth();
  const deptId = user?.department?._id || user?.department || null;

  const [sections, setSections] = useState([]);
  const [activeSection, setActiveSection] = useState('');
  const [equipmentList, setEquipmentList] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [loadingSections, setLoadingSections] = useState(true);
  const [loadingEquipment, setLoadingEquipment] = useState(false);
  const [requestingId, setRequestingId] = useState(null);
  const [toast, setToast] = useState(null);

  const loadActiveBookings = useCallback(async () => {
    try {
      const { equipmentHistory } = await getStudentHistory();
      setMyBookings((equipmentHistory || []).filter((r) => ['pending', 'approved', 'overdue'].includes(r.status)));
    } catch {
      //empty if history fetch fails
    }
  }, []);

  useEffect(() => {
    if (!deptId) {
      setLoadingSections(false);
      return;
    }
    (async () => {
      setLoadingSections(true);
      try {
        const { sections: s } = await listLabSections(deptId);
        setSections(s || []);
        setActiveSection(s?.[0] || '');
      } catch (err) {
        setToast({ type: 'error', message: err?.response?.data?.message || 'Failed to load lab sections.' });
      } finally {
        setLoadingSections(false);
      }
    })();
    loadActiveBookings();
  }, [deptId, loadActiveBookings]);

  useEffect(() => {
    if (!deptId || !activeSection) return;
    (async () => {
      setLoadingEquipment(true);
      try {
        const { equipment: e } = await listEquipmentInLabSection(deptId, activeSection);
        setEquipmentList(e || []);
      } catch (err) {
        setToast({ type: 'error', message: err?.response?.data?.message || 'Failed to load equipment.' });
      } finally {
        setLoadingEquipment(false);
      }
    })();
  }, [deptId, activeSection]);

  const handleRequest = async (item) => {
    setRequestingId(item._id);
    try {
      await requestEquipmentBooking(item._id);
      setToast({ type: 'success', message: `Requested "${item.name}". Awaiting lab staff approval.` });
      loadActiveBookings();
    } catch (err) {
      setToast({ type: 'error', message: err?.response?.data?.message || 'Failed to submit request.' });
    } finally {
      setRequestingId(null);
    }
  };

  if (!deptId) {
    return (
      <div className="space-y-6">
        <div className="pb-4 border-b border-border-subtle">
          <span className="text-[11px] uppercase tracking-[0.25em] font-semibold text-neutral-500 dark:text-neutral-400 block mb-2">
            Lab Resources
          </span>
          <h1 className="text-2xl font-bold tracking-tight">Browse & Book Equipment</h1>
        </div>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 border border-dashed border-border-subtle rounded-xl p-6 text-center">
          Your account is not linked to a department yet. Contact an admin to assign your department.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="pb-4 border-b border-border-subtle">
        <span className="text-[11px] uppercase tracking-[0.25em] font-semibold text-neutral-500 dark:text-neutral-400 block mb-2">
          Lab Resources
        </span>
        <h1 className="text-2xl font-bold tracking-tight">Browse & Book Equipment</h1>
      </div>

      {myBookings.length > 0 && (
        <div className="border border-amber-500/30 bg-amber-500/10 rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-amber-700 dark:text-amber-400 mb-3">My Active Bookings</h3>
          <ul className="space-y-2">
            {myBookings.map((r) => (
              <li key={r._id} className="text-xs text-neutral-700 dark:text-neutral-300 flex items-center justify-between">
                <span>{r.equipment?.name}</span>
                <span className="font-medium capitalize">
                  {r.status}
                  {r.dueDate ? ` · due ${new Date(r.dueDate).toLocaleDateString()}` : ''}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {loadingSections ? (
        <div className="flex gap-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-9 w-24 rounded-full bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
          ))}
        </div>
      ) : sections.length === 0 ? (
        <p className="text-sm text-neutral-500 dark:text-neutral-400 border border-dashed border-border-subtle rounded-xl p-6 text-center">
          No lab sections have been set up for your department yet.
        </p>
      ) : (
        <>
          <div className="flex flex-wrap gap-2">
            {sections.map((s) => (
              <button
                key={s}
                onClick={() => setActiveSection(s)}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-colors ${
                  activeSection === s
                    ? 'bg-brand text-white'
                    : 'border border-border-subtle hover:bg-neutral-200/40 dark:hover:bg-neutral-800/40'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {loadingEquipment ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 rounded-xl bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
              ))}
            </div>
          ) : equipmentList.length === 0 ? (
            <p className="text-sm text-neutral-500 dark:text-neutral-400 border border-dashed border-border-subtle rounded-xl p-6 text-center">
              No equipment in {activeSection} yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {equipmentList.map((item) => (
                <div key={item._id} className="border border-border-subtle rounded-xl p-4 bg-surface flex gap-4">
                  <div className="shrink-0 w-24 h-24 rounded-lg bg-neutral-200 dark:bg-neutral-800 overflow-hidden flex items-center justify-center border border-border-subtle">
                    {item.imageUrl ? (
                      <img src={resolveFileUrl(item.imageUrl)} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <Wrench className="w-8 h-8 text-neutral-500 dark:text-neutral-400" />
                    )}
                  </div>
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <p className="text-sm font-semibold truncate">{item.name}</p>
                      {item.description && (
                        <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 line-clamp-2">{item.description}</p>
                      )}
                      <p className="text-[11px] font-semibold mt-2">
                        {item.availableUnits > 0 ? (
                          <span className="text-emerald-600 dark:text-emerald-400">{item.availableUnits} available</span>
                        ) : (
                          <span className="text-red-500">Out of stock</span>
                        )}
                        {' '}/ {item.totalUnits}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRequest(item)}
                      disabled={item.availableUnits < 1 || requestingId === item._id}
                      className="mt-3 px-4 py-2 rounded-lg text-xs font-semibold bg-brand text-white hover:opacity-90 transition-opacity disabled:opacity-50 self-start"
                    >
                      {requestingId === item._id ? 'Requesting…' : 'Request Booking'}
                    </button>
                  </div>
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
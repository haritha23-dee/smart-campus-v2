import { useState, useEffect, useCallback } from 'react';
import { listBookRequests, approveBookRequest, rejectBookRequest } from '../../services/libraryStaffService';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Toast from '../../components/common/Toast';

const DEFAULT_LOAN_DAYS = 14;

const defaultDueDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + DEFAULT_LOAN_DAYS);
  return d.toISOString().split('T')[0];
};

export default function LibraryStaffRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const [approveTarget, setApproveTarget] = useState(null);
  const [dueDate, setDueDate] = useState(defaultDueDate());
  const [approving, setApproving] = useState(false);
  const [approveError, setApproveError] = useState('');

  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejecting, setRejecting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { requests: r } = await listBookRequests('pending');
      setRequests(r || []);
    } catch (err) {
      setToast({ type: 'error', message: err?.response?.data?.message || 'Failed to load requests.' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openApprove = (req) => {
    setApproveTarget(req);
    setDueDate(defaultDueDate());
    setApproveError('');
  };

  const submitApprove = async (e) => {
    e.preventDefault();
    if (!dueDate) {
      setApproveError('Pick a due date.');
      return;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const picked = new Date(dueDate);
    picked.setHours(0, 0, 0, 0);
    const diffMs = picked.getTime() - today.getTime();
    const loanDays = Math.max(1, Math.ceil(diffMs / 86400000)); 

    if (Number.isNaN(loanDays)) {
      setApproveError('Invalid due date.');
      return;
    }

    setApproving(true);
    setApproveError('');
    try {
      await approveBookRequest(approveTarget._id, loanDays);
      setToast({ type: 'success', message: `Approved — due in ${loanDays} day${loanDays === 1 ? '' : 's'}.` });
      setApproveTarget(null);
      load();
    } catch (err) {
      setApproveError(err?.response?.data?.message || 'Failed to approve request.');
    } finally {
      setApproving(false);
    }
  };

  const confirmReject = async () => {
    if (!rejectTarget) return;
    setRejecting(true);
    try {
      await rejectBookRequest(rejectTarget._id);
      setToast({ type: 'success', message: 'Request rejected.' });
      setRejectTarget(null);
      load();
    } catch (err) {
      setToast({ type: 'error', message: err?.response?.data?.message || 'Failed to reject request.' });
      setRejectTarget(null);
    } finally {
      setRejecting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-border-subtle">
        <h1 className="text-2xl font-bold tracking-tight">Issue Requests</h1>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
          ))}
        </div>
      ) : requests.length === 0 ? (
        <p className="text-sm text-neutral-500 dark:text-neutral-400 border border-dashed border-border-subtle rounded-xl p-6 text-center">
          No pending requests.
        </p>
      ) : (
        <div className="space-y-3">
          {requests.map((r) => (
            <div key={r._id} className="border border-border-subtle rounded-xl p-4 bg-surface flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold">{r.book?.title}</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">by {r.book?.author}</p>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1.5">
                  Requested by {r.student?.name} ({r.student?.studentId || r.student?.email})
                  {' · '}
                  {new Date(r.requestDate).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => openApprove(r)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-brand text-white hover:opacity-90 transition-opacity"
                >
                  Approve
                </button>
                <button
                  onClick={() => setRejectTarget(r)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold border border-red-500/40 text-red-500 hover:bg-red-500/10 transition-colors"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={!!approveTarget} onClose={() => setApproveTarget(null)} title="Approve Request">
        <form onSubmit={submitApprove} className="space-y-4">
          {approveError && (
            <div className="p-3 rounded-lg text-xs font-semibold bg-red-500/10 text-red-600 border border-red-500/20">
              {approveError}
            </div>
          )}
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Approving <span className="font-semibold text-neutral-700 dark:text-neutral-200">{approveTarget?.book?.title}</span> for {approveTarget?.student?.name}.
          </p>
          <div>
            <label className="block text-[11px] uppercase tracking-wider font-semibold text-neutral-600 dark:text-neutral-300 mb-1.5">
              Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-4 py-2.5 text-sm rounded-xl bg-canvas border border-border-subtle focus:outline-none focus:ring-2 focus:ring-brand"
              required
            />
          </div>
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={approving}
              className="px-6 py-2.5 text-xs font-semibold rounded-xl bg-brand text-white hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {approving ? 'Approving…' : 'Approve'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!rejectTarget}
        title="Reject this request?"
        message={rejectTarget ? `"${rejectTarget.book?.title}" for ${rejectTarget.student?.name} will be rejected.` : ''}
        confirmLabel="Reject"
        danger
        loading={rejecting}
        onConfirm={confirmReject}
        onCancel={() => setRejectTarget(null)}
      />

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
import { useState, useRef, useEffect } from 'react';
import { useNotifications } from '../../context/NotificationContext';

const SEVERITY_STYLES = {
  error: 'bg-red-500/10 text-red-600 dark:text-red-400',
  warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  info: 'bg-brand/10 text-brand',
};

function severityFor(type = '') {
  const t = type.toLowerCase();
  if (t.includes('overdue') || t.includes('reject')) return 'error';
  if (t.includes('pending') || t.includes('request')) return 'warning';
  return 'info';
}

export default function NotificationDropdown({ open, onClose, anchorRef }) {
  const { notifications, unreadCount, loading, markAsRead, markAllRead } = useNotifications();
  const panelRef = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (
        panelRef.current && !panelRef.current.contains(e.target) &&
        anchorRef.current && !anchorRef.current.contains(e.target)
      ) {
        onClose();
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [onClose, anchorRef]);

  if (!open) return null;

  return (
    <div
      ref={panelRef}
      className="absolute right-0 mt-2 w-80 rounded-xl border border-border-subtle bg-surface shadow-lg overflow-hidden"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle">
        <span className="text-sm font-semibold">Notifications</span>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="text-[11px] font-medium text-brand hover:opacity-70 transition-opacity"
          >
            Mark all as read
          </button>
        )}
      </div>

      <div className="max-h-96 overflow-y-auto">
        {loading && (
          <div className="p-4 space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-10 bg-neutral-200 dark:bg-neutral-800 rounded-lg animate-pulse" />
            ))}
          </div>
        )}

        {!loading && notifications.length === 0 && (
          <p className="text-sm text-neutral-500 dark:text-neutral-400 text-center py-10">
            You're all caught up.
          </p>
        )}

        {!loading &&
          notifications.slice(0, 30).map((n) => (
            <button
              key={n._id}
              onClick={() => !n.isRead && markAsRead(n._id)}
              className={`w-full text-left px-4 py-3 border-b border-border-subtle last:border-0 hover:bg-neutral-200/40 dark:hover:bg-neutral-800/40 transition-colors ${
                n.isRead ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded ${SEVERITY_STYLES[severityFor(n.type)]}`}
                    >
                      {n.type?.replace(/_/g, ' ') || 'info'}
                    </span>
                    {!n.isRead && <span className="w-1.5 h-1.5 rounded-full bg-brand" />}
                  </div>
                  <p className="text-sm font-medium leading-snug">{n.title}</p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 leading-snug">{n.message}</p>
                </div>
              </div>
              <span className="text-[10px] text-neutral-400 dark:text-neutral-500 block mt-1.5">
                {new Date(n.createdAt).toLocaleString()}
              </span>
            </button>
          ))}
      </div>
    </div>
  );
}
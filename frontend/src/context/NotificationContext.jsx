import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import {
  listNotifications,
  markNotificationRead,
  clearAllNotifications,
} from '../services/notificationService';
import { requestOsNotificationPermission, fireOsNotification } from '../utils/osNotify';

import Toast from '../components/common/Toast';

const NotificationContext = createContext();

const SOCKET_URL = (import.meta.env.VITE_API_URL || '').replace(/\/api\/?$/, '');

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const socketRef = useRef(null);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await listNotifications();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch {} 
    finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    requestOsNotificationPermission();
    fetchNotifications();

    const token = localStorage.getItem('token');
    if (!token || !SOCKET_URL) return;

    const socket = io(SOCKET_URL, { auth: { token } });
    socketRef.current = socket;

    socket.on('notification:new', (notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
      //in app toast in case of os notification permission deined
      setToast({type:'info', message: `${notification.title}: ${notification.message}`});
      fireOsNotification(notification.title, {
        body: notification.message,
        tag: notification._id,
      });
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user, fetchNotifications]);

  const markAsRead = async (id) => {
    setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
    setUnreadCount((prev) => Math.max(0, prev - 1));
    try {
      await markNotificationRead(id);
    } catch {
      fetchNotifications();
    }
  };

  const markAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
    try {
      await clearAllNotifications();
    } catch {
      fetchNotifications();
    }
  };

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, loading, markAsRead, markAllRead, refresh: fetchNotifications }}
    >
      {children}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
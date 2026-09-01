import api from './api';

export const listNotifications = async () => {
  const { data } = await api.get('/notifications');
  return data;
};

export const markNotificationRead = async (id) => {
  const { data } = await api.put(`/notifications/${id}/read`);
  return data;
};

export const clearAllNotifications = async () => {
  const { data } = await api.put('/notifications/clear-all');
  return data;
};
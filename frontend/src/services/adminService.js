import api from './api';

export const listUsers = async (params = {}) => {
  const { data } = await api.get('/admin/users', { params });
  return data;
};

export const createUser = async (payload) => {
  const { data } = await api.post('/admin/users', payload);
  return data;
};

export const getUser = async (id) => {
  const { data } = await api.get(`/admin/users/${id}`);
  return data;
};

export const disableUser = async (id) => {
  const { data } = await api.put(`/admin/users/${id}/disable`);
  return data;
};

export const enableUser = async (id) => {
  const { data } = await api.put(`/admin/users/${id}/enable`);
  return data;
};

export const resetPassword = async (id, newPassword) => {
  const { data } = await api.put(`/admin/users/${id}/reset-password`, { newPassword });
  return data;
};

export const listDepartments = async () => {
  const { data } = await api.get('/admin/departments');
  return data;
};

export const createDepartment = async (payload) => {
  const { data } = await api.post('/admin/departments', payload);
  return data;
};

export const getDepartmentClassrooms = async (id) => {
  const { data } = await api.get(`/admin/departments/${id}/classrooms`);
  return data;
};

export const deleteDepartment = async (id) => {
  const { data } = await api.delete(`/admin/departments/${id}`);
  return data;
};

export const getAnalytics = async () => {
  const { data } = await api.get('/admin/analytics');
  return data;
};

export const getAuditLog = async () => {
  const { data } = await api.get('/admin/audit-log');
  return data;
};
import api from './api';

export const getProfile = async () => {
  const { data } = await api.get('/student/profile');
  return data;
};

export const updateProfile = async (payload) => {
  const { data } = await api.put('/student/profile', payload);
  return data;
};

export const listDepartments = async () => {
  const { data } = await api.get('/student/departments');
  return data;
};

export const getDepartmentClassrooms = async (id) => {
  const { data } = await api.get(`/student/departments/${id}/classrooms`);
  return data;
};

export const joinClassroom = async (id) => {
  const { data } = await api.post(`/student/classrooms/${id}/join`);
  return data;
};

export const getMyClassrooms = async () => {
  const { data } = await api.get('/student/classrooms/joined');
  return data;
};

export const getClassroomDetails = async (id) => {
  const { data } = await api.get(`/student/classrooms/${id}`);
  return data;
};

export const getClassroomResources = async (id, subject) => {
  const { data } = await api.get(`/student/classrooms/${id}/subjects/${subject}/resources`);
  return data;
};

export const postHandwrittenNotes = async (id, payload) => {
  let body = payload;
  let headers;
  if (payload.file instanceof File) {
    body = new FormData();
    body.append('title', payload.title);
    body.append('description', payload.description || '');
    body.append('subject', payload.subject);
    body.append('type', 'Notes');
    body.append('file', payload.file);
    headers = { 'Content-Type': 'multipart/form-data' };
  }
  const { data } = await api.post(`/student/classrooms/${id}/subjects/${payload.subject}/notes`, body, { headers });
  return data;
};

export const listLibraryBooks = async (params = {}) => {
  const { data } = await api.get('/student/library/books', { params });
  return data;
};

export const requestBookBorrow = async (id) => {
  const { data } = await api.post(`/student/library/books/${id}/request`);
  return data;
};

export const listLabEquipment = async (params = {}) => {
  const { data } = await api.get('/student/lab/equipment', { params });
  return data;
};

export const requestEquipmentBooking = async (id) => {
  const { data } = await api.post(`/student/lab/equipment/${id}/request`);
  return data;
};

export const getStudentHistory = async () => {
  const { data } = await api.get('/student/history');
  return data;
};
import api from './api';

export const getFacultyProfile = async () => {
  const { data } = await api.get('/auth/me');
  return data; 
};

export const updateFacultyProfile = async ({ name, designation, yearJoined, subjectsCanTeach, photoFile }) => {
  const form = new FormData();
  if (name !== undefined) form.append('name', name);
  if (designation !== undefined) form.append('designation', designation);
  if (yearJoined !== undefined) form.append('yearJoined', yearJoined);
  if (subjectsCanTeach !== undefined) form.append('subjectsCanTeach', subjectsCanTeach);
  if (photoFile instanceof File) form.append('photo', photoFile);
  const { data } = await api.put('/auth/profile', form);
  return data; 
};

export const listAvailableClassrooms = async () => {
  const { data } = await api.get('/faculty/classrooms');
  return data;
};

export const listMyClassrooms = async () => {
  const { data } = await api.get('/faculty/classrooms/mine');
  return data;
};

export const createClassroom = async ({ year, section, subject }) => {
  const { data } = await api.post('/faculty/classrooms', { year, section, subject });
  return data;
};

export const joinClassroom = async (id, subject) => {
  const { data } = await api.post(`/faculty/classrooms/${id}/join`, { subject });
  return data;
};

export const getClassroom = async (id) => {
  const { data } = await api.get(`/faculty/classrooms/${id}`);
  return data;
};

export const getClassroomSubjectResources = async (id, subject) => {
  const { data } = await api.get(`/faculty/classrooms/${id}/subjects/${subject}/resources`);
  return data;
};

export const postClassroomResource = async (classroomId, { subject, type, title, description, file }) => {
  const form = new FormData();
  form.append('subject', subject);
  form.append('type', type);
  form.append('title', title);
  form.append('description', description || '');
  form.append('file', file);
  const { data } = await api.post(`/faculty/classrooms/${classroomId}/resources`, form);
  return data;
};

export const getResourceHistory = async (params = {}) => {
  const { data } = await api.get('/faculty/resources/mine', { params });
  return data;
};

const API_ORIGIN = (import.meta.env.VITE_API_URL || '').replace(/\/api\/?$/, '');
export const resolveFileUrl = (path) => (path ? `${API_ORIGIN}${path}` : '');
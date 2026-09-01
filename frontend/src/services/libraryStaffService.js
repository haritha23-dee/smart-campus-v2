import api from './api';

export const getLibraryProfile = async () => {
  const { data } = await api.get('/auth/me');
  return data; 
};

export const updateLibraryProfile = async ({ name, yearJoined, photoFile }) => {
  const form = new FormData();
  if (name !== undefined) form.append('name', name);
  if (yearJoined !== undefined) form.append('yearJoined', yearJoined);
  if (photoFile instanceof File) form.append('photo', photoFile);
  const { data } = await api.put('/auth/profile', form); 
  return data; 
};

export const changePassword = async ({ currentPassword, newPassword }) => {
  const { data } = await api.put('/auth/change-password', { currentPassword, newPassword });
  return data; 
};

export const getLibraryHistory = async () => {
  const [issuedRes, returnedRes, overdueRes, pendingRes] = await Promise.all([
    api.get('/library-staff/issued'),
    api.get('/library-staff/requests', { params: { status: 'returned' } }),
    api.get('/library-staff/overdue'),
    api.get('/library-staff/requests', { params: { status: 'pending' } }),
  ]);
  return {
    success: true,
    history: {
      issuedHistory: issuedRes.data.issued || [],
      returnedHistory: returnedRes.data.requests || [],
      overdueBooks: overdueRes.data.overdue || [],
      pendingCount: pendingRes.data.count || 0,
    },
  };
};

export const listInventorySections = async () => {
  const { data } = await api.get('/library-staff/sections');
  return data; 
};

export const listBooksBySection = async (section) => {
  const { data } = await api.get(`/library-staff/sections/${encodeURIComponent(section)}/books`);
  return data; 
};

export const addBook = async ({ title, author, section, totalCopies, description }) => {
  const { data } = await api.post('/library-staff/books', { title, author, section, totalCopies, description });
  return data; 
};

export const updateBook = async (id, payload) => {
  const { data } = await api.put(`/library-staff/books/${id}`, payload);
  return data; 
};

export const deleteBook = async (id) => {
  const { data } = await api.delete(`/library-staff/books/${id}`);
  return data; 
};

export const listBookRequests = async (status = 'pending') => {
  const { data } = await api.get('/library-staff/requests', { params: { status } });
  return data; 
};

export const approveBookRequest = async (id, loanDays) => {
  const { data } = await api.put(`/library-staff/requests/${id}/decision`, { decision: 'approved', loanDays });
  return data;
};

export const rejectBookRequest = async (id) => {
  const { data } = await api.put(`/library-staff/requests/${id}/decision`, { decision: 'rejected' });
  return data; 
};

export const listReturns = async () => {
  const { data } = await api.get('/library-staff/return-tracking');
  return data; 
};

export const markBookReturned = async (id) => {
  const { data } = await api.put(`/library-staff/requests/${id}/return`);
  return data;
};

const API_ORIGIN = (import.meta.env.VITE_API_URL || '').replace(/\/api\/?$/, '');
export const resolveFileUrl = (path) => (path ? `${API_ORIGIN}${path}` : '');
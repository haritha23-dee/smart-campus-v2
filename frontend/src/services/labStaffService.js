import api from './api';

export const getLabProfile = async () => {
    const { data } = await api.get('/auth/me');
    return data;
}

export const updateLabProfile = async ({ name, yearJoined, photoFile }) => {
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

export const getLabHistory = async () => {
  const [issuedRes, returnedRes, overdueRes, pendingRes] = await Promise.all([
    api.get('/lab-staff/booked'),
    api.get('/lab-staff/requests', { params: { status: 'returned' } }),
    api.get('/lab-staff/overdue'),
    api.get('/lab-staff/requests', { params: { status: 'pending' } }),
  ]);
  return {
    success: true,
    history: {
      issuedHistory: issuedRes.data.booked || [],
      returnedHistory: returnedRes.data.requests || [],
      overdueEquipment: overdueRes.data.overdue || [],
      pendingCount: pendingRes.data.count || 0,
    },
  };
};

export const listLabSections = async () => {
  const { data } = await api.get('/lab-staff/sections');
  return data; 
};

export const listEquipmentBySection = async (section) => {
  const { data } = await api.get(`/lab-staff/sections/${encodeURIComponent(section)}/equipment`);
  return data; 
};

export const addEquipment = async ({ name, section, totalUnits, description, imageFile }) => {
  const form = new FormData();
  form.append('name', name);
  form.append('section', section);
  form.append('totalUnits', totalUnits);
  if (description !== undefined) form.append('description', description);
  if (imageFile instanceof File) {
    form.append('image', imageFile);
  }

  const { data } = await api.post('/lab-staff/equipment', form);
  return data;
};

export const updateEquipment = async (id, { name, section, totalUnits, availableUnits, description, imageFile }) => {
  const form = new FormData();
  if (name !== undefined) form.append('name', name);
  if (section !== undefined) form.append('section', section);
  if (totalUnits !== undefined) form.append('totalUnits', totalUnits);
  if (availableUnits !== undefined) form.append('availableUnits', availableUnits);
  if (description !== undefined) form.append('description', description);
  if (imageFile instanceof File) {
    form.append('image', imageFile);
}

  const { data } = await api.put(`/lab-staff/equipment/${id}`, form);
  return data;
};

export const deleteEquipment = async (id) => {
  const { data } = await api.delete(`/lab-staff/equipment/${id}`);
  return data; 
};

//booking reqs
export const listBookingRequests = async (status = 'pending') => {
  const { data } = await api.get('/lab-staff/requests', { params: { status } });
  return data; 
};

export const approveBookingRequest = async (id, loanDays) => {
  const { data } = await api.put(`/lab-staff/requests/${id}/decision`, { decision: 'approved', loanDays });
  return data; 
};

export const rejectBookingRequest = async (id) => {
  const { data } = await api.put(`/lab-staff/requests/${id}/decision`, { decision: 'rejected' });
  return data; 
};

//return tracking
export const listLabReturns = async () => {
  const { data } = await api.get('/lab-staff/return-tracking');
  return data; 
};

export const markEquipmentReturned = async (id) => {
  const { data } = await api.put(`/lab-staff/requests/${id}/return`);
  return data; 
};

const API_ORIGIN = (import.meta.env.VITE_API_URL || '').replace(/\/api\/?$/, '');

export const resolveFileUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  
  const sanitizedPath = path
    .replace(/\\/g, '/')
    .replace(/^(\/?uploads\/)+/, 'uploads/');

  const cleanOrigin = API_ORIGIN.replace(/\/+$/, '');
  const cleanPath = sanitizedPath.startsWith('/') ? sanitizedPath : `/${sanitizedPath}`;
  
  return `${cleanOrigin}${cleanPath}`;
};
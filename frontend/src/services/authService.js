import api from './api';

export const login = async (email,password) => {
    const { data } = await api.post('/auth/login', { email,password });
    return data;
};

export const getCurrentUser = async() =>{
    const { data } = await api.get('/auth/me');
    return data;
};

export const updateProfile = async (formData) => {
    const { data } = await api.put('/auth/profile', formData);
    return data;
}
import axios from 'axios';
import { router } from 'expo-router';

import { toast } from '@/components/toast';
import { BASE_URL } from './constants';
import { storage } from './storage';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (request) => {
    const token = await storage.getToken();
    if (token) {
      request.headers.Authorization = `Bearer ${token}`;
    }
    return request;
  },
  (error) => {
    toast.error({ message: error.response?.data?.message || error.message || 'Something went wrong' });
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    const { data } = response;
    if (data.code === 200) {
      if (data.message && data.message !== 'Success') {
        toast.success({ message: data.message });
      }
      return Promise.resolve(data);
    } else {
      toast.error({ message: data.message });
      return Promise.reject(new Error(data.message));
    }
  },
  async (error) => {
    toast.error({ message: error.response?.data?.message || error.message || 'Something went wrong' });

    if (error.response?.status === 401) {
      await storage.removeToken();
      router.replace('/');
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (username: string, password: string) => api.post('/auth/login', { username, password }),
  logout: () => api.post('/auth/logout'),
};

export const userApi = {
  setAvailable: () => api.put('/user/available'),
  setUnavailable: () => api.put('/user/unavailable'),
};

export const livekitApi = {
  getToken: (room: string, username: string) => api.get('/livekit/token', { params: { room, username } }),
};

export default api;

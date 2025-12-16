import { jwtDecode } from 'jwt-decode';
import { useCallback } from 'react';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  login as loginAction,
  logout as logoutAction,
  setLoading,
  updateUser as updateUserAction,
} from '@/store/slices/authSlice';
import { authApi } from '@/utils/api';
import { storage } from '@/utils/storage';
import { User } from '@/utils/types';

export function useAuth() {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isLoading } = useAppSelector((state) => state.auth);

  const login = useCallback(
    async (username: string, password: string) => {
      try {
        dispatch(setLoading(true));
        const { data } = await authApi.login(username, password);

        const token = data.token;
        await storage.setToken(token);

        const decoded = jwtDecode<User>(token);
        const user: User = {
          id: decoded.id,
          username: decoded.username,
          name: decoded.name,
          email: decoded.email,
          avatar: decoded.avatar,
          status: decoded.status,
        };

        dispatch(loginAction({ user }));
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch]
  );

  const logout = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      await authApi.logout();
      await storage.removeToken();
      dispatch(logoutAction());
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  const updateUser = useCallback(
    (user: User) => {
      dispatch(updateUserAction(user));
    },
    [dispatch]
  );

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    updateUser,
  };
}

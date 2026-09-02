import api from './api';
import type {
  UserDTO,
  ProfileResponse,
  LoginHistoryEntry,
} from '../types/user.types';

export interface UserPayload {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  role?: 'USER' | 'ADMIN';
  enabled?: boolean;
  phoneNumber?: string;
  cin?: string;
  dateOfBirth?: string;
  nationality?: string;
  avatarUrl?: string;
  preferredLanguage?: string;
  timezone?: string;
  notificationEmail?: boolean;
  notificationSms?: boolean;
  notificationPush?: boolean;
}

export interface UserCreatePayload extends UserPayload {
  password: string;
}

export interface UserUpdatePayload extends Partial<UserPayload> {
  password?: string;
}

const userService = {
  list: async (): Promise<UserDTO[]> => {
    const resp = await api.get('/users');
    return resp.data as UserDTO[];
  },
  getById: async (id: string): Promise<UserDTO> => {
    const resp = await api.get(`/users/${id}`);
    return resp.data as UserDTO;
  },
  create: async (payload: UserCreatePayload): Promise<UserDTO> => {
    const resp = await api.post('/users', payload);
    return resp.data as UserDTO;
  },
  update: async (id: string, payload: UserUpdatePayload): Promise<UserDTO> => {
    const resp = await api.put(`/users/${id}`, payload);
    return resp.data as UserDTO;
  },
  updateMe: async (payload: UserUpdatePayload): Promise<UserDTO> => {
    const resp = await api.put('/users/me', payload);
    return resp.data as UserDTO;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/users/${id}`);
  },
  getMyProfile: async (): Promise<ProfileResponse> => {
    const resp = await api.get('/users/me/profile');
    return resp.data as ProfileResponse;
  },
  updateAvatar: async (avatarUrl: string | null): Promise<UserDTO> => {
    const resp = await api.put('/users/me/avatar', { avatarUrl });
    return resp.data as UserDTO;
  },
  updateNotifications: async (prefs: {
    email?: boolean;
    sms?: boolean;
    push?: boolean;
  }): Promise<UserDTO> => {
    const resp = await api.put('/users/me/notifications', prefs);
    return resp.data as UserDTO;
  },
  updatePreferences: async (prefs: {
    language?: string;
    timezone?: string;
  }): Promise<UserDTO> => {
    const resp = await api.put('/users/me/preferences', prefs);
    return resp.data as UserDTO;
  },
  getLoginHistory: async (): Promise<LoginHistoryEntry[]> => {
    const resp = await api.get('/users/me/login-history');
    return resp.data as LoginHistoryEntry[];
  },
};

export default userService;

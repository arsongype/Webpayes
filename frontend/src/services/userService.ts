import api from './api';
import type { UserDTO } from '../types/user.types';

export interface UserPayload {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  role?: 'USER' | 'ADMIN';
  enabled?: boolean;
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
  delete: async (id: string): Promise<void> => {
    await api.delete(`/users/${id}`);
  },
};

export default userService;

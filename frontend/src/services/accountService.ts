import api from './api';
import type { AccountDTO } from '../types/account.types';

const accountService = {
  list: async (userId?: string): Promise<AccountDTO[]> => {
    const params = userId ? { params: { userId } } : undefined;
    const resp = await api.get('/accounts', params);
    return resp.data as AccountDTO[];
  },
  getById: async (id: string): Promise<AccountDTO> => {
    const resp = await api.get(`/accounts/${id}`);
    return resp.data as AccountDTO;
  },
  create: async (payload: Partial<AccountDTO>): Promise<AccountDTO> => {
    const resp = await api.post('/accounts', payload);
    return resp.data as AccountDTO;
  },
  update: async (id: string, payload: Partial<AccountDTO>): Promise<AccountDTO> => {
    const resp = await api.put(`/accounts/${id}`, payload);
    return resp.data as AccountDTO;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/accounts/${id}`);
  }
};

export default accountService;

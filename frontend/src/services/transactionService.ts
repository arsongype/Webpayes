import api from './api';
import type { TransferRequest, TransferResponse, Transaction } from '../types/transaction.types';

const transactionService = {
  transfer: async (payload: TransferRequest): Promise<TransferResponse> => {
    const response = await api.post('/transactions/transfer', payload);
    return response.data as TransferResponse;
  },

  list: async (page = 0, size = 20): Promise<Transaction[]> => {
    const response = await api.get(`/transactions?page=${page}&size=${size}`);
    return response.data as Transaction[];
  },

  search: async (reference: string): Promise<Transaction[]> => {
    const response = await api.get(`/transactions/search?reference=${encodeURIComponent(reference)}`);
    return response.data as Transaction[];
  },

  getById: async (id: string): Promise<Transaction> => {
    const response = await api.get(`/transactions/${id}`);
    return response.data as Transaction;
  },

  getStats: async (): Promise<{ total: number; completed: number; pending: number; failed: number }> => {
    const response = await api.get('/transactions/stats');
    return response.data as { total: number; completed: number; pending: number; failed: number };
  },

  getMerchantSales: async (): Promise<{ total: number; count: number; from: string; to: string }> => {
    const response = await api.get('/transactions/merchant/sales');
    return response.data;
  },
};

export default transactionService;

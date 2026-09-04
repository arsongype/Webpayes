import api from './api';

export type PaymentMethodType = 'CARD' | 'MOBILE_MONEY' | 'BANK_TRANSFER';

export interface PaymentMethodDTO {
  id: string;
  userId: string;
  type: PaymentMethodType;
  provider?: string;
  accountNumber?: string;
  expiryDate?: string;
  isFavorite: boolean;
  isActive: boolean;
  createdAt?: string;
}

export interface PaymentMethodRequest {
  type: PaymentMethodType;
  provider?: string;
  accountNumber?: string;
  expiryDate?: string;
  isFavorite?: boolean;
}

export interface PaymentMethodCategoryDTO {
  id: string;
  name: string;
  description?: string;
  icon?: string;
}

const paymentMethodService = {
  list: async (): Promise<PaymentMethodDTO[]> => {
    const resp = await api.get('/payment-methods');
    return resp.data;
  },
  create: async (payload: PaymentMethodRequest): Promise<PaymentMethodDTO> => {
    const resp = await api.post('/payment-methods', payload);
    return resp.data;
  },
  update: async (id: string, payload: Partial<PaymentMethodRequest>): Promise<PaymentMethodDTO> => {
    const resp = await api.put(`/payment-methods/${id}`, payload);
    return resp.data;
  },
  remove: async (id: string): Promise<void> => {
    await api.delete(`/payment-methods/${id}`);
  },
  toggleFavorite: async (id: string): Promise<PaymentMethodDTO> => {
    const resp = await api.post(`/payment-methods/${id}/favorite`);
    return resp.data;
  },
  listCategories: async (): Promise<PaymentMethodCategoryDTO[]> => {
    try {
      const resp = await api.get('/payment-method-categories');
      return resp.data ?? [];
    } catch {
      return [];
    }
  },
  createCategory: async (payload: { name: string; description?: string; icon?: string }): Promise<PaymentMethodCategoryDTO> => {
    const resp = await api.post('/payment-method-categories', payload);
    return resp.data;
  },
  updateCategory: async (id: string, payload: { name: string; description?: string; icon?: string }): Promise<PaymentMethodCategoryDTO> => {
    const resp = await api.put(`/payment-method-categories/${id}`, payload);
    return resp.data;
  },
  deleteCategory: async (id: string): Promise<void> => {
    await api.delete(`/payment-method-categories/${id}`);
  },
};

export default paymentMethodService;

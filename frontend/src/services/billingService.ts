import api from './api';

export interface BillingInfoDTO {
  id: string;
  userId: string;
  fullName: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  taxId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BillingInfoRequest {
  fullName: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  taxId?: string;
}

const billingService = {
  get: async (): Promise<BillingInfoDTO | null> => {
    const resp = await api.get('/billing-infos/me');
    return resp.data;
  },
  list: async (): Promise<BillingInfoDTO[]> => {
    const resp = await api.get('/billing-infos/me/all');
    return resp.data;
  },
  create: async (payload: BillingInfoRequest): Promise<BillingInfoDTO> => {
    const resp = await api.post('/billing-infos/me', payload);
    return resp.data;
  },
  update: async (payload: BillingInfoRequest): Promise<BillingInfoDTO> => {
    const resp = await api.put('/billing-infos/me', payload);
    return resp.data;
  },
  delete: async (): Promise<void> => {
    await api.delete('/billing-infos/me');
  },
};

export default billingService;

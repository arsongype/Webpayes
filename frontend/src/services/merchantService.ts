import api from './api';

export interface MerchantProfileDTO {
  id: string;
  userId: string;
  shopName: string;
  description?: string;
  logoUrl?: string;
  phoneNumber: string;
  address?: string;
  bankAccountNumber?: string;
  bankName?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt?: string;
  updatedAt?: string;
}

export interface MerchantProfileRequest {
  shopName: string;
  description?: string;
  logoUrl?: string;
  phoneNumber: string;
  address?: string;
  bankAccountNumber?: string;
  bankName?: string;
}

export interface MerchantAffiliationRequestDTO {
  id: string;
  userId: string;
  reason?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt?: string;
}

export interface MerchantAffiliationRequestPayload {
  reason?: string;
}

const merchantService = {
  getProfile: async (): Promise<MerchantProfileDTO | null> => {
    const resp = await api.get('/merchant-profiles/me');
    return resp.data;
  },
  updateProfile: async (payload: MerchantProfileRequest): Promise<MerchantProfileDTO> => {
    const resp = await api.post('/merchant-profiles/me', payload);
    return resp.data;
  },
  listAll: async (): Promise<MerchantProfileDTO[]> => {
    const resp = await api.get('/merchant-profiles');
    return resp.data;
  },
  approveProfile: async (id: string): Promise<MerchantProfileDTO> => {
    const resp = await api.post(`/merchant-profiles/${id}/approve`);
    return resp.data;
  },
  rejectProfile: async (id: string): Promise<MerchantProfileDTO> => {
    const resp = await api.post(`/merchant-profiles/${id}/reject`);
    return resp.data;
  },
  getMyRequest: async (): Promise<MerchantAffiliationRequestDTO | null> => {
    const resp = await api.get('/merchant-affiliation-requests/me');
    return resp.data;
  },
  listRequests: async (): Promise<MerchantAffiliationRequestDTO[]> => {
    const resp = await api.get('/merchant-affiliation-requests');
    return resp.data;
  },
  submitRequest: async (payload: MerchantAffiliationRequestPayload): Promise<MerchantAffiliationRequestDTO> => {
    const resp = await api.post('/merchant-affiliation-requests', payload);
    return resp.data;
  },
  approveRequest: async (id: string): Promise<MerchantAffiliationRequestDTO> => {
    const resp = await api.post(`/merchant-affiliation-requests/${id}/approve`);
    return resp.data;
  },
  rejectRequest: async (id: string): Promise<MerchantAffiliationRequestDTO> => {
    const resp = await api.post(`/merchant-affiliation-requests/${id}/reject`);
    return resp.data;
  },
};

export default merchantService;

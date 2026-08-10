import api from './api';

export type RefundStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
export type DisputeStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

export interface RefundDTO {
  id: string;
  transactionId: string;
  amount: string;
  reason: string;
  status: RefundStatus;
  requestedBy: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt?: string;
}

export interface RefundRequest {
  transactionId: string;
  amount: string;
  reason: string;
}

export interface DisputeDTO {
  id: string;
  transactionId: string;
  reason: string;
  description: string;
  status: DisputeStatus;
  resolution?: string;
  createdBy: string;
  resolvedBy?: string;
  resolvedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DisputeRequest {
  transactionId: string;
  reason: string;
  description: string;
}

const refundService = {
  list: async (): Promise<RefundDTO[]> => {
    const resp = await api.get('/refunds');
    return resp.data;
  },
  create: async (payload: RefundRequest): Promise<RefundDTO> => {
    const resp = await api.post('/refunds', payload);
    return resp.data;
  },
  getByTransaction: async (transactionId: string): Promise<RefundDTO | null> => {
    const resp = await api.get(`/refunds/transaction/${transactionId}`);
    return resp.data;
  },
  approve: async (id: string): Promise<RefundDTO> => {
    const resp = await api.post(`/refunds/${id}/approve`);
    return resp.data;
  },
  reject: async (id: string): Promise<RefundDTO> => {
    const resp = await api.post(`/refunds/${id}/reject`);
    return resp.data;
  },
  complete: async (id: string): Promise<RefundDTO> => {
    const resp = await api.post(`/refunds/${id}/complete`);
    return resp.data;
  },
  listDisputes: async (): Promise<DisputeDTO[]> => {
    const resp = await api.get('/disputes');
    return resp.data;
  },
  createDispute: async (payload: DisputeRequest): Promise<DisputeDTO> => {
    const resp = await api.post('/disputes', payload);
    return resp.data;
  },
  getDisputeByTransaction: async (transactionId: string): Promise<DisputeDTO | null> => {
    const resp = await api.get(`/disputes/transaction/${transactionId}`);
    return resp.data;
  },
  updateDisputeStatus: async (id: string, status: DisputeStatus): Promise<DisputeDTO> => {
    const resp = await api.post(`/disputes/${id}/status`, { status });
    return resp.data;
  },
  resolveDispute: async (id: string, resolution: string): Promise<DisputeDTO> => {
    const resp = await api.post(`/disputes/${id}/resolve`, { resolution });
    return resp.data;
  },
};

export default refundService;

import api from './api';

export interface ReconciliationResponse {
  id: string;
  fileName: string;
  fileHash: string;
  statementDate: string;
  iban?: string;
  openingBalance?: number;
  closingBalance?: number;
  statementAmount: number;
  bookAmount: number;
  discrepancy: number;
  matchedCount: number;
  unmatchedCount: number;
  totalEntries: number;
  status: string;
  notes?: string;
  performedBy?: string;
  createdAt: string;
}

export interface ReconciliationEntry {
  id: string;
  endToEndId?: string;
  transactionId?: string;
  amount: number;
  currency: string;
  valueDate?: string;
  counterpartyIban?: string;
  counterpartyName?: string;
  reference?: string;
  matchStatus: string;
  discrepancyReason?: string;
}

const reconciliationService = {
  importStatement: async (fileName: string, xmlContent: string): Promise<ReconciliationResponse> => {
    const resp = await api.post('/reconciliation/import', { fileName, xmlContent });
    return resp.data;
  },
  list: async (page = 0, size = 20, status?: string): Promise<ReconciliationResponse[]> => {
    const params: Record<string, string | number> = { page, size };
    if (status) params.status = status;
    const resp = await api.get('/reconciliation', { params });
    return resp.data;
  },
  getById: async (id: string): Promise<ReconciliationResponse> => {
    const resp = await api.get(`/reconciliation/${id}`);
    return resp.data;
  },
  getEntries: async (id: string): Promise<ReconciliationEntry[]> => {
    const resp = await api.get(`/reconciliation/${id}/entries`);
    return resp.data;
  },
};

export default reconciliationService;

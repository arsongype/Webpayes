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

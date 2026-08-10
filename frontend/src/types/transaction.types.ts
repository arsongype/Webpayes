export interface Transaction {
  id: string;
  senderAccountId: string;
  receiverAccountId: string;
  amount: string;
  currency: string;
  status: TransactionStatus;
  reference: string;
  metadata?: string;
  fraudScore?: number;
  riskScore?: number;
  createdAt: string;
  updatedAt: string;
}

export const TransactionStatus = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
} as const;

export type TransactionStatus = typeof TransactionStatus[keyof typeof TransactionStatus];

export interface TransferRequest {
  senderAccountId?: string;
  receiverAccountId: string;
  amount: string;
  description?: string;
}

export interface TransferResponse {
  id: string;
  senderAccountId: string;
  receiverAccountId: string;
  amount: string;
  currency: string;
  status: TransactionStatus;
  reference: string;
  fraudScore?: number;
  riskScore?: number;
  createdAt: string;
}

export interface LedgerEntry {
  id: string;
  transactionId: string;
  accountId: string;
  entryType: 'DEBIT' | 'CREDIT';
  amount: string;
  currency: string;
  createdAt: string;
}

export interface FraudAlert {
  id: string;
  transactionId: string;
  isFraudulent: boolean;
  fraudScore: number;
  riskLevel: string;
  recommendation: string;
  createdAt: string;
}

export interface RiskScore {
  transactionId: string;
  riskScore: number;
  riskLevel: string;
  recommendation: string;
  maxRecommendedAmount: string;
}

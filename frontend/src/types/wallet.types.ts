export interface WalletBalanceDTO {
  accountId: string;
  balance: string;
  currency: string;
}

export interface WalletTransactionDTO {
  id: string;
  accountId: string;
  type: string;
  amount: string;
  currency: string;
  description?: string;
  createdAt?: string;
}

export interface WalletTransactionPayload {
  accountId: string;
  amount: string;
  description: string;
}

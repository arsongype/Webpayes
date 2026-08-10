export interface AccountDTO {
  id: string;
  userId: string;
  accountNumber: string;
  balance: string; // BigDecimal serialized as string
  currency: string;
  kycStatus?: string;
  createdAt?: string;
}

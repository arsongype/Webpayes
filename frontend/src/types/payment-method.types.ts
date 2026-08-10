export type PaymentMethodType = 'CARD' | 'MOBILE_MONEY' | 'BANK_TRANSFER';

export interface PaymentMethodCategoryDTO {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  createdAt?: string;
}

export interface PaymentMethodDTO {
  id: string;
  userId: string;
  categoryId: string;
  type: PaymentMethodType;
  provider?: string;
  accountNumber?: string;
  expiryDate?: string;
  isFavorite: boolean;
  isActive: boolean;
  createdAt?: string;
}

export interface PaymentMethodRequest {
  categoryId: string;
  type: PaymentMethodType;
  provider?: string;
  accountNumber?: string;
  expiryDate?: string;
  isFavorite?: boolean;
}

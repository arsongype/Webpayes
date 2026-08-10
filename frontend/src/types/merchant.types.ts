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

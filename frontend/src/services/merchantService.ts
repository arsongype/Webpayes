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
  kycStatus?: 'PENDING' | 'VERIFIED' | 'REJECTED';
  kycConfidence?: number;
  kycVerifiedAt?: string;
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
  userFirstName?: string;
  userLastName?: string;
  userEmail?: string;
  reason?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt?: string;
  idDocumentType?: string;
  idDocumentNumber?: string;
  idDocumentImage?: string;
  businessRegistrationImage?: string;
  kycStatus?: 'PENDING' | 'VERIFIED' | 'REJECTED';
  kycSubmittedAt?: string;
}

export interface MerchantAffiliationRequestPayload {
  reason?: string;
  idDocumentImage?: string;
  idDocumentType?: string;
  idDocumentNumber?: string;
  businessRegistrationImage?: string;
}

export interface MerchantAffiliationRequestPageDTO {
  content: MerchantAffiliationRequestDTO[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface KycVerificationRequest {
  document_image: string;
  full_name?: string;
  date_of_birth?: string;
  nationality?: string;
}

export interface KycVerificationResponse {
  verification_id: string;
  user_id: string;
  status: string;
  extracted_data?: Record<string, unknown>;
  confidence_score: number;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface KycStatusResponse {
  status: string;
  confidence?: number;
  verifiedAt?: string;
  maxAttempts?: number;
  remainingAttempts?: number;
  locked?: boolean;
  lockedUntil?: string;
}

export interface TwoFactorSetupResponse {
  secret: string;
  qrCodeUrl: string;
}

export interface TwoFactorStatusResponse {
  twoFactorEnabled: boolean;
}

export interface TwoFactorRecoveryResponse {
  recoveryCodes: string[];
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
  search: async (query: string): Promise<MerchantProfileDTO[]> => {
    const resp = await api.get(`/merchant-profiles/search?q=${encodeURIComponent(query)}`);
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
  listRequestsPaginated: async (page = 0, size = 5): Promise<MerchantAffiliationRequestPageDTO> => {
    const resp = await api.get(`/merchant-affiliation-requests/page?page=${page}&size=${size}`);
    return resp.data as MerchantAffiliationRequestPageDTO;
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
  verifyKyc: async (id: string, status: string): Promise<MerchantAffiliationRequestDTO> => {
    const resp = await api.post(`/merchant-affiliation-requests/${id}/verify-kyc?status=${status}`);
    return resp.data;
  },
  verifyKycDocument: async (payload: KycVerificationRequest): Promise<KycVerificationResponse> => {
    const resp = await api.post('/kyc/verify', {
      documentImage: payload.document_image,
      fullName: payload.full_name,
      dateOfBirth: payload.date_of_birth,
      nationality: payload.nationality,
    });
    return resp.data;
  },
  getKycStatus: async (): Promise<KycStatusResponse> => {
    const resp = await api.get('/kyc/status');
    return resp.data;
  },
  setup2fa: async (): Promise<TwoFactorSetupResponse> => {
    const resp = await api.post('/auth/two-factor/setup');
    return resp.data;
  },
  enable2fa: async (secret: string, code: string): Promise<void> => {
    await api.post(`/auth/two-factor/enable?secret=${secret}&code=${code}`);
  },
  get2faStatus: async (): Promise<TwoFactorStatusResponse> => {
    const resp = await api.get('/auth/two-factor/status');
    return resp.data;
  },
  getRecoveryCodes: async (): Promise<string[]> => {
    const resp = await api.get('/auth/two-factor/recovery-codes');
    return resp.data.recoveryCodes;
  },
};

export default merchantService;

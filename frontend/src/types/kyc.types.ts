export const KycStatus = {
  PENDING: 'en_attente',
  VALIDATED: 'valide',
  REJECTED: 'rejete',
} as const;

export type KycStatus = (typeof KycStatus)[keyof typeof KycStatus];

export interface KycVerificationRequest {
  user_id: string;
  id_document_image?: string;
  full_name: string;
  date_of_birth: string;
  nationality: string;
}

export interface KycVerificationResponse {
  verification_id: string;
  user_id: string;
  status: KycStatus;
  extracted_data?: Record<string, unknown>;
  confidence_score?: number;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface KycStatusUpdate {
  status: KycStatus;
  rejection_reason?: string;
}

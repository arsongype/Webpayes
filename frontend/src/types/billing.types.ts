export interface BillingInfoDTO {
  id: string;
  userId: string;
  fullName: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  taxId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BillingInfoRequest {
  fullName: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  taxId?: string;
}

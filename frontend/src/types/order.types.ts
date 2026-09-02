export interface OrderDTO {
  id: string;
  buyerId: string;
  buyerName: string;
  productId: string;
  productName: string;
  quantity: number;
  totalAmount: string;
  currency: string;
  status: 'PENDING' | 'PAID' | 'CANCELLED' | 'REFUNDED';
  paymentReference?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrderRequest {
  productId: string;
  quantity: number;
  paymentReference?: string;
}

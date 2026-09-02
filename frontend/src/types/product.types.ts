export interface ProductDTO {
  id: string;
  merchantId: string;
  name: string;
  description?: string;
  price: string;
  currency: string;
  imageUrl?: string;
  stock: number;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductRequest {
  name: string;
  description?: string;
  price: string;
  currency?: string;
  imageUrl?: string;
  stock?: number;
  active?: boolean;
}

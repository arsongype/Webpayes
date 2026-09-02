import api from './api';
import type { ProductDTO, ProductRequest } from '../types/product.types';

const productService = {
  list: async (query?: string): Promise<ProductDTO[]> => {
    const url = query ? `/products?q=${encodeURIComponent(query)}` : '/products';
    const resp = await api.get(url);
    return resp.data.content ?? resp.data;
  },

  getById: async (id: string): Promise<ProductDTO> => {
    const resp = await api.get(`/products/${id}`);
    return resp.data;
  },

  listMy: async (): Promise<ProductDTO[]> => {
    const resp = await api.get('/products/my');
    return resp.data;
  },

  create: async (payload: ProductRequest): Promise<ProductDTO> => {
    const resp = await api.post('/products', payload);
    return resp.data;
  },

  update: async (id: string, payload: ProductRequest): Promise<ProductDTO> => {
    const resp = await api.put(`/products/${id}`, payload);
    return resp.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/products/${id}`);
  },
};

export default productService;

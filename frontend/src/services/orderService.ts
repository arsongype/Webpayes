import api from './api';
import type { OrderDTO, OrderRequest } from '../types/order.types';

const orderService = {
  listMy: async (): Promise<OrderDTO[]> => {
    const resp = await api.get('/orders/my');
    return resp.data;
  },

  listMerchant: async (): Promise<OrderDTO[]> => {
    const resp = await api.get('/orders/merchant');
    return resp.data;
  },

  create: async (payload: OrderRequest): Promise<OrderDTO> => {
    const resp = await api.post('/orders', payload);
    return resp.data;
  },

  markAsPaid: async (id: string): Promise<OrderDTO> => {
    const resp = await api.post(`/orders/${id}/pay`);
    return resp.data;
  },

  cancel: async (id: string): Promise<OrderDTO> => {
    const resp = await api.post(`/orders/${id}/cancel`);
    return resp.data;
  },
};

export default orderService;

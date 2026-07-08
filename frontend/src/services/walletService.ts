import api from './api';
import type { WalletBalanceDTO, WalletTransactionDTO, WalletTransactionPayload } from '../types/wallet.types';

const walletService = {
  getBalance: async (accountId: string): Promise<WalletBalanceDTO> => {
    const response = await api.get('/wallet/balance', { params: { accountId } });
    return response.data as WalletBalanceDTO;
  },

  getHistory: async (accountId: string): Promise<WalletTransactionDTO[]> => {
    const response = await api.get('/wallet/history', { params: { accountId } });
    return response.data as WalletTransactionDTO[];
  },

  deposit: async (payload: WalletTransactionPayload): Promise<WalletTransactionDTO> => {
    const response = await api.post('/wallet/deposit', payload);
    return response.data as WalletTransactionDTO;
  },

  withdraw: async (payload: WalletTransactionPayload): Promise<WalletTransactionDTO> => {
    const response = await api.post('/wallet/withdraw', payload);
    return response.data as WalletTransactionDTO;
  },
};

export default walletService;

import { useBalanceStream } from '../hooks/useBalanceStream';

export function useRealtimeBalance(updateBalance: (balance: number, currency: string) => void) {
  return useBalanceStream((balance, currency) => {
    updateBalance(balance, currency);
  });
}

import { useState, useEffect } from 'react';
import { useRealtimeBalance } from '../hooks/useRealtimeBalance';

export function BalanceDisplay({ userId }: { userId: string }) {
  const [balance, setBalance] = useState<number | null>(null);
  const [currency, setCurrency] = useState('MGA');

  useRealtimeBalance((newBalance: number, newCurrency: string) => {
    setBalance(newBalance);
    setCurrency(newCurrency);
  });

  useEffect(() => {
    const fetchBalance = async () => {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/accounts/balance', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setBalance(data.balance);
      setCurrency(data.currency || 'MGA');
    };

    fetchBalance();
  }, [userId]);

  return (
    <div>
      <h3>Solde</h3>
      <p>
        {balance != null ? `${balance} ${currency}` : 'Chargement...'}
      </p>
    </div>
  );
}

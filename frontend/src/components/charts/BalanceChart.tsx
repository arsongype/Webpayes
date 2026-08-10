import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface BalanceChartProps {
  transactions: Array<{ createdAt?: string; amount: string; type: string }>;
  currency?: string;
}

const BalanceChart = ({ transactions, currency = 'MGA' }: BalanceChartProps) => {
  const data = useMemo(() => {
    const sorted = [...transactions].sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : Number.POSITIVE_INFINITY;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : Number.POSITIVE_INFINITY;
      return dateA - dateB;
    });

    return sorted.reduce<{ date: string; balance: number }[]>((acc, tx) => {
      const last = acc.length > 0 ? acc[acc.length - 1].balance : 0;
      const date = tx.createdAt ? new Date(tx.createdAt) : new Date();
      acc.push({
        date: date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
        balance: last + Number(tx.amount),
      });
      return acc;
    }, []);
  }, [transactions]);

  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-400">
        Pas assez de données pour afficher le graphique
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
        <XAxis dataKey="date" stroke="#94a3b8" style={{ fontSize: '12px' }} />
        <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} tickFormatter={(val: number | string) => `${Number(val).toFixed(2)} ${currency}`} />
        <Tooltip
          contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
          labelStyle={{ color: '#e2e8f0' }}
          formatter={(value: unknown) => [`${Number(value).toFixed(2)} ${currency}`, 'Solde']}
        />
        <Line type="monotone" dataKey="balance" stroke="#22d3ee" strokeWidth={2} dot={{ fill: '#22d3ee', r: 4 }} />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default BalanceChart;

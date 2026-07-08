import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface TransactionsChartProps {
  transactions: { status: string; amount: string }[];
}

const TransactionsChart = ({ transactions }: TransactionsChartProps) => {
  const data = useMemo(() => {
    const grouped: Record<string, { status: string; count: number; total: number }> = {};
    transactions.forEach((tx) => {
      if (!grouped[tx.status]) {
        grouped[tx.status] = { status: tx.status, count: 0, total: 0 };
      }
      grouped[tx.status].count += 1;
      grouped[tx.status].total += Number(tx.amount);
    });
    return Object.values(grouped);
  }, [transactions]);

  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-400">
        Pas de données à afficher
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
        <XAxis dataKey="status" stroke="#94a3b8" style={{ fontSize: '12px' }} />
        <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
        <Tooltip
          contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
          labelStyle={{ color: '#e2e8f0' }}
          formatter={(value: unknown, name: string | number | undefined) => [
            String(name ?? '') === 'count' ? `${value} transactions` : `${Number(value).toFixed(2)} MGA`,
            String(name ?? '') === 'count' ? 'Nombre' : 'Montant total',
          ]}
        />
        <Bar dataKey="count" fill="#22d3ee" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default TransactionsChart;

import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface BalanceChartProps {
  transactions: Array<{ createdAt?: string; amount: string; type: string }>;
  currency?: string;
}

interface ChartPoint {
  date: string;
  fullDate: string;
  balance: number;
  delta: number;
  type: string;
}

const CustomTooltip = ({ active, payload, currency }: { active?: boolean; payload?: Array<{ payload: ChartPoint }>; currency: string }) => {
  if (!active || !payload || !payload.length) return null;
  const point = payload[0].payload;
  const isPositive = point.delta >= 0;
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-xl dark:border-white/10 dark:bg-slate-900">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        {point.fullDate}
      </p>
      <p className="mt-1 text-lg font-bold tabular-nums text-slate-900 dark:text-white">
        {point.balance.toFixed(2)} {currency}
      </p>
      <p
        className={`mt-0.5 inline-flex items-center gap-1 text-xs font-semibold ${
          isPositive ? 'text-emerald-600 dark:text-emerald-300' : 'text-rose-600 dark:text-rose-300'
        }`}
      >
        {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
        {isPositive ? '+' : ''}
        {point.delta.toFixed(2)} {currency} · {point.type}
      </p>
    </div>
  );
};

const BalanceChart = ({ transactions, currency = 'MGA' }: BalanceChartProps) => {
  const { data, stats } = useMemo(() => {
    const sorted = [...transactions].sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : Number.POSITIVE_INFINITY;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : Number.POSITIVE_INFINITY;
      return dateA - dateB;
    });

    const points: ChartPoint[] = [];
    let running = 0;
    for (const tx of sorted) {
      const amount = Number(tx.amount);
      const prev = running;
      running = running + amount;
      const date = tx.createdAt ? new Date(tx.createdAt) : new Date();
      points.push({
        date: date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
        fullDate: date.toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }),
        balance: running,
        delta: running - prev,
        type: tx.type,
      });
    }

    const start = points.length > 0 ? points[0].balance : 0;
    const end = points.length > 0 ? points[points.length - 1].balance : 0;
    const change = end - start;
    const pct = start !== 0 ? (change / Math.abs(start)) * 100 : 0;
    const isPositive = change >= 0;

    return {
      data: points,
      stats: { start, end, change, pct, isPositive, count: points.length },
    };
  }, [transactions]);

  if (data.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/30">
        <div className="text-3xl">📊</div>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Pas assez de données pour afficher le graphique
        </p>
        <p className="text-xs text-slate-400">Effectuez au moins une transaction pour voir votre historique</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Stats summary */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 dark:border-white/10 dark:bg-slate-900/60">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Solde actuel
          </span>
          <span className="ml-2 text-sm font-bold tabular-nums text-slate-900 dark:text-white">
            {stats.end.toFixed(2)} {currency}
          </span>
        </div>
        <div
          className={`flex items-center gap-1 rounded-xl border px-3 py-1.5 ${
            stats.isPositive
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300'
              : 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300'
          }`}
        >
          {stats.isPositive ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
          <span className="text-xs font-semibold">
            {stats.isPositive ? '+' : ''}
            {stats.change.toFixed(2)} {currency}
          </span>
          <span className="text-[10px] opacity-70">({stats.isPositive ? '+' : ''}{stats.pct.toFixed(1)}%)</span>
        </div>
        <span className="text-[10px] text-slate-400">{stats.count} opération{stats.count > 1 ? 's' : ''}</span>
      </div>

      {/* Chart */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-slate-900/60">
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" />
            <XAxis dataKey="date" stroke="#94a3b8" style={{ fontSize: '11px' }} tickLine={false} />
            <YAxis
              stroke="#94a3b8"
              style={{ fontSize: '11px' }}
              tickLine={false}
              tickFormatter={(val: number) => `${Number(val).toFixed(0)}`}
            />
            <Tooltip content={<CustomTooltip currency={currency} />} cursor={{ stroke: '#06b6d4', strokeWidth: 1, strokeDasharray: '3 3' }} />
            <Area
              type="monotone"
              dataKey="balance"
              stroke="#06b6d4"
              strokeWidth={2.5}
              fill="url(#balanceGradient)"
              dot={{ r: 3, fill: '#06b6d4', strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 5, fill: '#06b6d4', strokeWidth: 2, stroke: '#fff' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default BalanceChart;

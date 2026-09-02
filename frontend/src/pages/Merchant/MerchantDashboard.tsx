import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, TrendingUp, CheckCircle2, ChevronLeft, DollarSign } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../components/common/Toast/ToastContainer';

interface AnalyticsResponse {
  totalVolume: number;
  totalTransactions: number;
  completedTransactions: number;
  pendingTransactions: number;
  failedTransactions: number;
  successRate: number;
  dailyVolumes: Array<{ date: string; volume: number }>;
  methodBreakdown: Array<{ method: string; count: number }>;
}

const methodLabels: Record<string, string> = {
  card: 'Carte bancaire',
  mobile_money: 'Mobile Money',
  internal: 'Interne',
  unknown: 'Autre',
};

const methodColors: Record<string, string> = {
  card: 'bg-blue-500',
  mobile_money: 'bg-amber-500',
  internal: 'bg-emerald-500',
  unknown: 'bg-slate-500',
};

const MerchantDashboard = () => {
  const toast = useToast();
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
  const [days, setDays] = useState(7);
  const [loading, setLoading] = useState(false);
  const [recentTx, setRecentTx] = useState<any[]>([]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const resp = await api.get(`/merchant/dashboard/analytics?days=${days}`);
      setAnalytics(resp.data);
    } catch (err: any) {
      toast.addToast({ type: 'error', title: 'Erreur', message: 'Impossible de charger les analyses.', duration: 6000 });
    } finally {
      setLoading(false);
    }
  };

  const loadRecent = async () => {
    try {
      const resp = await api.get(`/merchant/dashboard/recent-transactions?limit=10`);
      setRecentTx(resp.data);
    } catch {
      toast.addToast({ type: 'error', title: 'Erreur', message: 'Impossible de charger les transactions.', duration: 6000 });
    }
  };

  useEffect(() => {
    loadAnalytics();
    loadRecent();
  }, [days]);

  const maxVolume = analytics ? Math.max(...analytics.dailyVolumes.map(d => d.volume), 1) : 1;

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900 sm:px-6 lg:px-8 dark:bg-slate-950 dark:text-slate-50">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center gap-3">
          <Link to="/merchant" className="rounded-full p-2 hover:bg-slate-200 dark:hover:bg-slate-800">
            <ChevronLeft size={20} />
          </Link>
          <BarChart3 className="h-8 w-8 text-cyan-600 dark:text-cyan-300" />
          <div>
            <h1 className="text-3xl font-semibold">Tableau de bord marchand</h1>
            <p className="mt-2 text-slate-500 dark:text-slate-400">
              Vue d'ensemble des performances de votre boutique
            </p>
          </div>
        </div>

        <div className="mb-6 flex justify-end gap-2">
          {[7, 30, 90].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                days === d
                  ? 'bg-cyan-500 text-white'
                  : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:bg-slate-800 dark:text-slate-200'
              }`}
            >
              {d} jours
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-slate-500 dark:text-slate-400">Chargement des analyses...</p>
        ) : analytics ? (
          <>
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-xl backdrop-blur dark:border-white/10 dark:bg-slate-900/70">
                <div className="mb-2 flex items-center gap-2 text-slate-500 dark:text-slate-400">
                  <DollarSign size={16} />
                  <span className="text-xs font-medium uppercase">Volume total</span>
                </div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {analytics.totalVolume.toFixed(2)} €
                </p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-xl backdrop-blur dark:border-white/10 dark:bg-slate-900/70">
                <div className="mb-2 flex items-center gap-2 text-slate-500 dark:text-slate-400">
                  <BarChart3 size={16} />
                  <span className="text-xs font-medium uppercase">Transactions</span>
                </div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{analytics.totalTransactions}</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-xl backdrop-blur dark:border-white/10 dark:bg-slate-900/70">
                <div className="mb-2 flex items-center gap-2 text-slate-500 dark:text-slate-400">
                  <TrendingUp size={16} />
                  <span className="text-xs font-medium uppercase">Taux de réussite</span>
                </div>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-300">
                  {analytics.successRate.toFixed(1)}%
                </p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-xl backdrop-blur dark:border-white/10 dark:bg-slate-900/70">
                <div className="mb-2 flex items-center gap-2 text-slate-500 dark:text-slate-400">
                  <CheckCircle2 size={16} />
                  <span className="text-xs font-medium uppercase">Réussies</span>
                </div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{analytics.completedTransactions}</p>
              </div>
            </div>

            <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-xl backdrop-blur dark:border-white/10 dark:bg-slate-900/70">
                <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Volume par jour</h2>
                <div className="space-y-2">
                  {analytics.dailyVolumes.map((d) => (
                    <div key={d.date} className="flex items-center gap-3">
                      <span className="w-20 text-xs text-slate-500 dark:text-slate-400">
                        {new Date(d.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                      </span>
                      <div className="h-6 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-400 to-cyan-600 transition-all"
                          style={{ width: `${(d.volume / maxVolume) * 100}%` }}
                        />
                      </div>
                      <span className="w-20 text-right text-sm font-medium text-slate-700 dark:text-slate-200">
                        {d.volume.toFixed(0)} €
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-xl backdrop-blur dark:border-white/10 dark:bg-slate-900/70">
                <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Répartition par méthode</h2>
                {analytics.methodBreakdown.length === 0 ? (
                  <p className="text-sm text-slate-500 dark:text-slate-400">Aucune donnée disponible</p>
                ) : (
                  <div className="space-y-3">
                    {analytics.methodBreakdown.map((m) => {
                      const total = analytics.methodBreakdown.reduce((sum, x) => sum + x.count, 0);
                      const pct = total > 0 ? (m.count / total) * 100 : 0;
                      return (
                        <div key={m.method}>
                          <div className="mb-1 flex items-center justify-between text-sm">
                            <span className="font-medium text-slate-700 dark:text-slate-200">
                              {methodLabels[m.method] || m.method}
                            </span>
                            <span className="text-slate-500 dark:text-slate-400">{m.count} ({pct.toFixed(1)}%)</span>
                          </div>
                          <div className="h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                            <div
                              className={`h-full ${methodColors[m.method] || 'bg-slate-500'} transition-all`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-xl backdrop-blur dark:border-white/10 dark:bg-slate-900/70">
              <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Transactions récentes</h2>
              {recentTx.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">Aucune transaction</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-white/10">
                        <th className="pb-3 font-medium text-slate-500 dark:text-slate-400">Date</th>
                        <th className="pb-3 font-medium text-slate-500 dark:text-slate-400">Montant</th>
                        <th className="pb-3 font-medium text-slate-500 dark:text-slate-400">Statut</th>
                        <th className="pb-3 font-medium text-slate-500 dark:text-slate-400">Référence</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-white/10">
                      {recentTx.map((tx) => {
                        const statusColors: Record<string, string> = {
                          COMPLETED: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300',
                          PENDING: 'bg-amber-500/15 text-amber-600 dark:text-amber-300',
                          FAILED: 'bg-rose-500/15 text-rose-600 dark:text-rose-300',
                        };
                        return (
                          <tr key={tx.id}>
                            <td className="py-3 text-slate-700 dark:text-slate-200">
                              {new Date(tx.createdAt).toLocaleString()}
                            </td>
                            <td className="py-3 font-medium text-slate-900 dark:text-white">
                              {tx.amount} {tx.currency}
                            </td>
                            <td className="py-3">
                              <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[tx.status] || statusColors.PENDING}`}>
                                {tx.status}
                              </span>
                            </td>
                            <td className="py-3 font-mono text-xs text-slate-500 dark:text-slate-400">{tx.reference}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default MerchantDashboard;

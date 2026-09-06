import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronLeft,
  BarChart3,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  KeyRound,
  TrendingUp,
  DollarSign,
  Activity,
  ArrowUpRight,
  Download,
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../components/common/Toast/useToast';
import type { Transaction } from '../../types/transaction.types';
import { exportDashboardToPdf } from '../../utils/exportPdf';

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
  const [loading, setLoading] = useState(true);
  const [recentTx, setRecentTx] = useState<Transaction[]>([]);
  const [error, setError] = useState<string | null>(null);

  const loadAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await api.get(`/merchant/dashboard/analytics?days=${days}`);
      if (resp.status === 204 || !resp.data) {
        setAnalytics(null);
        return;
      }
      setAnalytics(resp.data);
    } catch (err) {
      const axiosError = err as { response?: { status?: number; data?: { message?: string } } };
      if (axiosError?.response?.status === 204 || axiosError?.response?.status === 404) {
        setAnalytics(null);
        return;
      }
      if (axiosError?.response?.status === 401 || axiosError?.response?.status === 403) {
        setError('Session expirée. Reconnectez-vous.');
        setAnalytics(null);
        return;
      }
      const message = axiosError?.response?.data?.message ?? 'Impossible de charger les analyses.';
      toast.addToast({ type: 'error', title: 'Erreur', message, duration: 6000 });
      setError(message);
      setAnalytics(null);
    } finally {
      setLoading(false);
    }
  };

  const loadRecent = async () => {
    try {
      const resp = await api.get(`/merchant/dashboard/recent-transactions?limit=10`);
      if (resp.status === 204) {
        setRecentTx([]);
        return;
      }
      setRecentTx(resp.data ?? []);
    } catch {
      setRecentTx([]);
    }
  };

  useEffect(() => {
    loadAnalytics();
    loadRecent();
  }, [days]);

  const [showAllDailyVolumes, setShowAllDailyVolumes] = useState(false);

  const maxVolume = analytics ? Math.max(...analytics.dailyVolumes.map((d) => d.volume), 1) : 1;
  const totalMethods = analytics?.methodBreakdown.reduce((sum, m) => sum + m.count, 0) ?? 0;

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 dark:bg-slate-950 dark:text-slate-50 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/merchant/portal"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 dark:border-white/10 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              aria-label="Retour au portail"
            >
              <ChevronLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight sm:text-3xl">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white">
                  <BarChart3 className="h-5 w-5" />
                </div>
                Tableau de bord marchand
              </h1>
              <p className="mt-0.5 flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                <Activity className="h-3.5 w-3.5" />
                Vue d'ensemble des performances de votre boutique
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1 dark:border-white/10 dark:bg-slate-800">
              {[7, 30, 90].map((d) => (
                <button
                  key={d}
                  onClick={() => setDays(d)}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                    days === d
                      ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                  }`}
                >
                  {d}j
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => analytics && exportDashboardToPdf(analytics, days)}
              disabled={!analytics}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 dark:border-white/10 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Exporter PDF</span>
            </button>
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800/50 dark:bg-amber-950/30">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/50">
                <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-amber-900 dark:text-amber-200">Erreur de chargement</p>
                <p className="text-sm text-amber-700 dark:text-amber-300">{error}</p>
              </div>
              <button
                type="button"
                onClick={loadAnalytics}
                className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-amber-500"
              >
                Réessayer
              </button>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white p-12 dark:border-white/10 dark:bg-slate-900">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
            <span className="ml-3 text-sm text-slate-500">Chargement des analyses...</span>
          </div>
        ) : analytics ? (
          <>
            {/* Stats Grid */}
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Volume total" value={`${analytics.totalVolume.toFixed(2)} €`} accent="cyan" icon={DollarSign} />
              <StatCard label="Transactions" value={analytics.totalTransactions} accent="blue" icon={Activity} />
              <StatCard
                label="Taux de réussite"
                value={`${analytics.successRate.toFixed(1)}%`}
                accent="emerald"
                icon={TrendingUp}
                highlight={analytics.successRate >= 80}
              />
              <StatCard label="Réussies" value={analytics.completedTransactions} accent="violet" icon={CheckCircle2} />
            </div>

            {/* Secondary stats */}
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800/40 dark:bg-amber-950/20">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/50">
                  <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">En attente</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">{analytics.pendingTransactions}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-800/40 dark:bg-rose-950/20">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-100 dark:bg-rose-900/50">
                  <XCircle className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Échouées</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">{analytics.failedTransactions}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-cyan-200 bg-cyan-50 p-4 dark:border-cyan-800/40 dark:bg-cyan-950/20">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-100 dark:bg-cyan-900/50">
                  <CheckCircle2 className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Succès</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">{analytics.completedTransactions}</p>
                </div>
              </div>
            </div>

            {/* Charts row */}
            <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Volume par jour */}
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900 lg:col-span-2">
                <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-white/5">
                  <div>
                    <h2 className="text-sm font-semibold">Volume par jour</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Évolution sur les {days} derniers jours</p>
                  </div>
                  <Calendar className="h-4 w-4 text-slate-400" />
                </div>
                <div className="p-5">
                  {analytics.dailyVolumes.length === 0 ? (
                    <p className="py-8 text-center text-sm text-slate-500">Aucune donnée disponible</p>
                  ) : (
                    <>
                      <div className={`space-y-2.5 ${!showAllDailyVolumes ? 'max-h-[320px] overflow-hidden' : ''}`}>
                        {analytics.dailyVolumes.slice(0, showAllDailyVolumes ? undefined : 10).map((d) => (
                          <div key={d.date} className="flex items-center gap-3 text-sm">
                            <span className="w-16 flex-shrink-0 text-xs text-slate-500 dark:text-slate-400">
                              {new Date(d.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                            </span>
                            <div className="h-5 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800/60">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-cyan-600 transition-all"
                                style={{ width: `${Math.max(2, (d.volume / maxVolume) * 100)}%` }}
                              />
                            </div>
                            <span className="w-20 flex-shrink-0 text-right text-sm font-semibold tabular-nums text-slate-700 dark:text-slate-200">
                              {d.volume.toFixed(0)} €
                            </span>
                          </div>
                        ))}
                      </div>
                      {analytics.dailyVolumes.length > 10 && (
                        <button
                          type="button"
                          onClick={() => setShowAllDailyVolumes((v) => !v)}
                          className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-cyan-600 transition hover:text-cyan-700 dark:text-cyan-400"
                        >
                          {showAllDailyVolumes ? 'Réduire' : `Voir les ${analytics.dailyVolumes.length - 10} autres jours`}
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Répartition par méthode */}
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900">
                <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-white/5">
                  <div>
                    <h2 className="text-sm font-semibold">Par méthode</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Répartition</p>
                  </div>
                  <TrendingUp className="h-4 w-4 text-slate-400" />
                </div>
                <div className="p-5">
                  {analytics.methodBreakdown.length === 0 ? (
                    <p className="py-8 text-center text-sm text-slate-500">Aucune donnée</p>
                  ) : (
                    <div className="space-y-3">
                      {analytics.methodBreakdown.map((m) => {
                        const total = totalMethods || 1;
                        const pct = (m.count / total) * 100;
                        const color = methodColors[m.method] || methodColors.unknown;
                        return (
                          <div key={m.method}>
                            <div className="mb-1.5 flex items-center justify-between text-sm">
                              <span className="font-medium text-slate-700 dark:text-slate-200">{methodLabels[m.method] || m.method}</span>
                              <span className="text-xs tabular-nums text-slate-500 dark:text-slate-400">
                                {m.count} · {pct.toFixed(0)}%
                              </span>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800/60">
                              <div
                                className={`h-full rounded-full ${color} transition-all duration-500`}
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
            </div>

            {/* Recent transactions */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900">
              <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-white/5">
                <div>
                  <h2 className="text-sm font-semibold">Transactions récentes</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Les 10 dernières opérations</p>
                </div>
                <Link
                  to="/merchant/portal"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-600 hover:underline dark:text-cyan-400"
                >
                  Voir tout <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {recentTx.length === 0 ? (
                <p className="px-5 py-12 text-center text-sm text-slate-500">Aucune transaction</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/50 dark:border-white/5 dark:bg-slate-800/30">
                        <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Date</th>
                        <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Montant</th>
                        <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Statut</th>
                        <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Référence</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                      {recentTx.map((tx) => {
                        const statusConfig: Record<string, { bg: string; text: string; icon: typeof CheckCircle2 }> = {
                          COMPLETED: { bg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300', icon: CheckCircle2 },
                          PENDING: { bg: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300', icon: Clock },
                          FAILED: { bg: 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300', icon: XCircle },
                        };
                        const cfg = statusConfig[tx.status] || statusConfig.PENDING;
                        const StatusIcon = cfg.icon;
                        return (
                          <tr key={tx.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                            <td className="whitespace-nowrap px-5 py-3 text-slate-700 dark:text-slate-200">
                              {new Date(tx.createdAt).toLocaleString('fr-FR', {
                                day: '2-digit',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </td>
                            <td className="whitespace-nowrap px-5 py-3 font-semibold tabular-nums text-slate-900 dark:text-white">
                              {tx.amount} {tx.currency}
                            </td>
                            <td className="px-5 py-3">
                              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${cfg.bg}`}>
                                <StatusIcon className="h-3 w-3" />
                                {tx.status}
                              </span>
                            </td>
                            <td className="px-5 py-3 font-mono text-xs text-slate-500 dark:text-slate-400">{tx.reference}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Quick link to API keys */}
            <div className="mt-5 overflow-hidden rounded-2xl border border-cyan-200 bg-gradient-to-br from-cyan-50 to-blue-50 p-5 dark:border-cyan-500/20 dark:from-cyan-500/5 dark:to-blue-500/5">
              <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/60 backdrop-blur dark:bg-slate-800/60">
                    <KeyRound className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                  </div>
                  <div>
                    <p className="font-semibold">Gérez vos clés API</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Créez et gérez vos clés d'accès à l'API</p>
                  </div>
                </div>
                <Link
                  to="/merchant/portal"
                  className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-cyan-400"
                >
                  <KeyRound className="h-4 w-4" />
                  Voir les clés
                </Link>
              </div>
            </div>
          </>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center dark:border-white/10 dark:bg-slate-900">
          <BarChart3 className="mx-auto mb-4 h-10 w-10 text-cyan-600 dark:text-cyan-400" />
          <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-white">Aucune donnée disponible</h3>
          <p className="mx-auto max-w-md text-sm text-slate-600 dark:text-slate-400">
            {error ? error : 'Commencez à effectuer des transactions pour voir vos analyses de performance ici.'}
          </p>
          <button
            type="button"
            onClick={loadAnalytics}
            className="mt-4 rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-400"
          >
            Réessayer
          </button>
        </div>
      )}
      </div>
    </div>
  );
};

const StatCard = ({
  label,
  value,
  accent,
  icon: Icon,
  highlight,
}: {
  label: string;
  value: string | number;
  accent: 'cyan' | 'blue' | 'emerald' | 'violet';
  icon?: typeof DollarSign;
  highlight?: boolean;
}) => {
  const accents: Record<string, string> = {
    cyan: 'from-cyan-500/10 to-cyan-500/0 text-cyan-600 dark:text-cyan-400',
    blue: 'from-blue-500/10 to-blue-500/0 text-blue-600 dark:text-blue-400',
    emerald: 'from-emerald-500/10 to-emerald-500/0 text-emerald-600 dark:text-emerald-400',
    violet: 'from-violet-500/10 to-violet-500/0 text-violet-600 dark:text-violet-400',
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900">
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${accents[accent]}`} />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{label}</p>
          <p
            className={`mt-2 text-2xl font-bold tabular-nums tracking-tight ${
              highlight ? 'text-emerald-600 dark:text-emerald-300' : 'text-slate-900 dark:text-white'
            }`}
          >
            {value}
          </p>
        </div>
        {Icon && (
          <div className={`rounded-xl bg-gradient-to-br ${accents[accent]} p-2.5 text-white`}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
    </div>
  );
};

export default MerchantDashboard;

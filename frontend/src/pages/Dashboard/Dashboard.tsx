import { useEffect, useRef, useState } from 'react';
import { Plus, AlertCircle, Loader2, ArrowUpRight, ArrowDownLeft, TrendingUp, Activity, Clock, CheckCircle2, XCircle, Receipt } from 'lucide-react';
import { fetchTransactions, fetchStats } from '../../store/slices/transactionSlice';
import { useAuth } from '../../hooks/useAuth';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppDispatch';
import accountService from '../../services/accountService';
import walletService from '../../services/walletService';
import { useToast } from '../../components/common/Toast/useToast';
import { useRealtimeBalance } from '../../hooks/useRealtimeBalance';
import BalanceChart from '../../components/charts/BalanceChart';
import type { AccountDTO } from '../../types/account.types';
import type { WalletTransactionDTO } from '../../types/wallet.types';
import { formatDateTime } from '../../utils/dateFormat';

const Dashboard = () => {
  const dispatch = useAppDispatch();
  const { user, updateUser } = useAuth();
  const toast = useToast();
  const { stats, loading } = useAppSelector((state) => state.transactions);
  const [accounts, setAccounts] = useState<AccountDTO[]>([]);
  const [transactions, setTransactions] = useState<WalletTransactionDTO[]>([]);
  const [creatingAccount, setCreatingAccount] = useState(false);
  const [accountChecked, setAccountChecked] = useState(false);
  const updateUserRef = useRef(updateUser);
  // eslint-disable-next-line react-hooks/refs
  updateUserRef.current = updateUser;

  useRealtimeBalance((newBalance: number, newCurrency: string) => {
    setAccounts((prev) => {
      if (prev.length === 0) return prev;
      const updated = [...prev];
      updated[0] = { ...updated[0], balance: String(newBalance), currency: newCurrency };
      return updated;
    });
    dispatch(fetchStats());
    dispatch(fetchTransactions({ page: 0, size: 5 }));
  });

  useEffect(() => {
    dispatch(fetchStats());
    dispatch(fetchTransactions({ page: 0, size: 5 }));
  }, [dispatch]);

  useEffect(() => {
    const load = async () => {
      try {
        const accs = await accountService.list();
        const sorted = [...accs].sort((a, b) => Number(b.balance) - Number(a.balance));
        setAccounts(sorted);
        if (sorted.length > 0) {
          if (updateUserRef.current && sorted[0].accountNumber) {
            updateUserRef.current({ accountNumber: sorted[0].accountNumber });
          }
          const hist = await walletService.getHistory(sorted[0].id);
          setTransactions(hist);
        }
      } catch {
        // ignore
      } finally {
        setAccountChecked(true);
      }
    };
    load();
  }, []);

  const handleCreateAccount = async () => {
    setCreatingAccount(true);
    try {
      const newAcc = await accountService.create({ currency: 'MGA' });
      setAccounts([newAcc]);
      if (updateUser && newAcc.accountNumber) {
        updateUser({ accountNumber: newAcc.accountNumber });
      }
      toast.addToast({
        type: 'success',
        title: 'Compte créé',
        message: `Votre compte ${newAcc.accountNumber} a été créé avec succès.`,
        duration: 6000,
      });
    } catch (err) {
      const axiosError = err as { response?: { data?: { message?: string } } } | null | undefined;
      const message = axiosError?.response?.data?.message ?? 'Impossible de créer le compte.';
      toast.addToast({
        type: 'error',
        title: 'Erreur',
        message,
        duration: 6000,
      });
    } finally {
      setCreatingAccount(false);
    }
  };

  const account = accounts[0];
  const balance = account ? Number(account.balance) : 0;
  const txIcon = (type: string) => {
    if (type === 'CREDIT' || type === 'DEPOSIT') return <ArrowDownLeft className="h-4 w-4" />;
    return <ArrowUpRight className="h-4 w-4" />;
  };
  const txColor = (type: string) => {
    if (type === 'CREDIT' || type === 'DEPOSIT') return 'text-emerald-600 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-500/20';
    return 'text-rose-600 dark:text-rose-300 bg-rose-100 dark:bg-rose-500/20';
  };

  return (
    <div className="bg-slate-100 px-4 py-6 text-slate-900 dark:bg-slate-950 dark:text-slate-50 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-5">
        {/* Hero header */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900/60 sm:p-8">
          <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-linear-to-br from-cyan-500/10 to-blue-500/10 blur-2xl" />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-600 dark:text-cyan-400">
                Tableau de bord
              </p>
              <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
                Bienvenue{user?.firstName ? `, ${user.firstName}` : ''} 👋
              </h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Gérez vos comptes, effectuez des transferts et consultez votre historique.
              </p>
            </div>
            {account && (
              <div className="rounded-2xl border border-cyan-200 bg-linear-to-br from-cyan-50 to-blue-50 p-4 dark:border-cyan-500/20 dark:from-cyan-500/10 dark:to-blue-500/10">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-cyan-700 dark:text-cyan-300">
                  Solde disponible
                </p>
                <p className="mt-1 text-2xl font-bold tabular-nums tracking-tight text-slate-900 dark:text-white">
                  {balance.toFixed(2)}{' '}
                  <span className="text-sm font-medium text-slate-500">{account.currency}</span>
                </p>
                <p className="mt-0.5 font-mono text-[10px] text-slate-500 dark:text-slate-400">
                  {account.accountNumber}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatTile
            label="Transactions"
            value={stats?.total ?? 0}
            accent="from-cyan-500/10 to-cyan-500/0"
            icon={Activity}
            loading={loading}
          />
          <StatTile
            label="Complétées"
            value={stats?.completed ?? 0}
            accent="from-emerald-500/10 to-emerald-500/0"
            icon={CheckCircle2}
            loading={loading}
          />
          <StatTile
            label="En attente"
            value={stats?.pending ?? 0}
            accent="from-amber-500/10 to-amber-500/0"
            icon={Clock}
            loading={loading}
          />
          <StatTile
            label="Échouées"
            value={stats?.failed ?? 0}
            accent="from-rose-500/10 to-rose-500/0"
            icon={XCircle}
            loading={loading}
          />
        </div>

        {/* No account banner */}
        {accountChecked && accounts.length === 0 && (
          <div className="overflow-hidden rounded-2xl border border-amber-200 bg-linear-to-br from-amber-50 to-orange-50 dark:border-amber-500/30 dark:from-amber-500/10 dark:to-orange-500/5">
            <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-amber-500/20">
                <AlertCircle className="h-6 w-6 text-amber-700 dark:text-amber-300" />
              </div>
              <div className="flex-1">
                <h2 className="font-semibold text-amber-900 dark:text-amber-200">Aucun compte attribué</h2>
                <p className="mt-0.5 text-sm text-amber-800 dark:text-amber-300/80">
                  Créez un compte pour commencer à effectuer des transactions.
                </p>
              </div>
              <button
                onClick={handleCreateAccount}
                disabled={creatingAccount}
                className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-amber-400 disabled:opacity-50"
              >
                {creatingAccount ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus size={16} />}
                {creatingAccount ? 'Création...' : 'Créer mon compte'}
              </button>
            </div>
          </div>
        )}

        {/* Chart + recent transactions */}
        {account && (
          <div className="grid gap-5 lg:grid-cols-3">
            {/* Chart */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900/60 lg:col-span-2">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="flex items-center gap-2 text-base font-semibold">
                    <TrendingUp className="h-4 w-4 text-cyan-500" />
                    Évolution du solde
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Historique de vos transactions
                  </p>
                </div>
                <span className="rounded-full bg-cyan-50 px-2.5 py-0.5 text-[10px] font-semibold text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-300">
                  {transactions.length} op.
                </span>
              </div>
              <BalanceChart transactions={transactions} currency={account.currency} />
            </div>

            {/* Recent transactions */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900/60">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-base font-semibold">
                  <Receipt className="h-4 w-4 text-emerald-500" />
                  Opérations récentes
                </h2>
                <span className="text-xs text-slate-400">Top 5</span>
              </div>
              {transactions.length === 0 ? (
                <p className="rounded-xl bg-slate-50 py-8 text-center text-sm text-slate-500 dark:bg-slate-800/50">
                  Aucune opération pour le moment
                </p>
              ) : (
                <div className="space-y-2">
                  {transactions.slice(0, 5).map((tx) => {
                    const isIncoming = tx.type === 'CREDIT' || tx.type === 'DEPOSIT';
                    return (
                      <div
                        key={tx.id}
                        className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-2.5 dark:border-white/5 dark:bg-slate-800/40"
                      >
                        <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${txColor(tx.type)}`}>
                          {txIcon(tx.type)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-semibold text-slate-700 dark:text-slate-200">
                            {tx.type}
                          </p>
                          <p className="text-[10px] text-slate-500">
                            {tx.createdAt ? formatDateTime(tx.createdAt, { hour: '2-digit', minute: '2-digit' }) : '—'}
                          </p>
                        </div>
                        <p
                          className={`text-sm font-bold tabular-nums ${
                            isIncoming ? 'text-emerald-600 dark:text-emerald-300' : 'text-slate-900 dark:text-white'
                          }`}
                        >
                          {isIncoming ? '+' : '-'}
                          {Number(tx.amount).toFixed(2)} {account.currency}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const StatTile = ({
  label,
  value,
  accent,
  icon: Icon,
  loading,
}: {
  label: string;
  value: string | number;
  accent: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  loading: boolean;
}) => (
  <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-slate-900/60">
    <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${accent}`} />
    <div className="flex items-center justify-between">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <Icon className="h-3.5 w-3.5 text-slate-400" />
    </div>
    <p className="mt-1.5 text-2xl font-bold tabular-nums tracking-tight text-slate-900 dark:text-white">
      {loading ? '…' : value}
    </p>
  </div>
);

export default Dashboard;

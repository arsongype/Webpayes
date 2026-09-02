import { useEffect, useState } from 'react';
import { Plus, AlertCircle, Loader2 } from 'lucide-react';
import { fetchTransactions, fetchStats } from '../../store/slices/transactionSlice';
import { useAuth } from '../../hooks/useAuth';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppDispatch';
import accountService from '../../services/accountService';
import walletService from '../../services/walletService';
import { useToast } from '../../components/common/Toast/ToastContainer';
import BalanceChart from '../../components/charts/BalanceChart';
import type { AccountDTO } from '../../types/account.types';
import type { WalletTransactionDTO } from '../../types/wallet.types';

const Dashboard = () => {
  const dispatch = useAppDispatch();
  const { user, updateUser } = useAuth();
  const toast = useToast();
  const { stats, loading } = useAppSelector((state) => state.transactions);
  const [accounts, setAccounts] = useState<AccountDTO[]>([]);
  const [transactions, setTransactions] = useState<WalletTransactionDTO[]>([]);
  const [creatingAccount, setCreatingAccount] = useState(false);
  const [accountChecked, setAccountChecked] = useState(false);

  useEffect(() => {
    dispatch(fetchStats());
    dispatch(fetchTransactions({ page: 0, size: 5 }));
  }, [dispatch]);

  useEffect(() => {
    const load = async () => {
      try {
        const accs = await accountService.list();
        setAccounts(accs);
        if (accs.length > 0) {
          if (updateUser && accs[0].accountNumber) {
            updateUser({ accountNumber: accs[0].accountNumber });
          }
          const hist = await walletService.getHistory(accs[0].id);
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
    } catch (err: any) {
      toast.addToast({
        type: 'error',
        title: 'Erreur',
        message: err?.response?.data?.message ?? 'Impossible de créer le compte.',
        duration: 6000,
      });
    } finally {
      setCreatingAccount(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-6 text-slate-900 sm:px-6 lg:px-8 dark:bg-slate-950 dark:text-slate-50">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-4xl border border-slate-200 bg-white/80 p-6 shadow-xl backdrop-blur dark:border-white/10 dark:bg-slate-900/70">
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-600/80 dark:text-cyan-300/80">Dashboard</p>
          <h1 className="mt-3 text-2xl font-semibold sm:text-3xl lg:text-4xl">
            Bienvenue{user?.firstName ? `, ${user.firstName}` : ''}
          </h1>
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-300 sm:text-base">
            Gérez vos comptes, effectuez des transferts et consultez votre historique.
          </p>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center dark:border-white/10 dark:bg-slate-800/50">
              <p className="text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400">Transactions</p>
              <p className="mt-1 text-xl font-bold text-slate-900 dark:text-white sm:text-2xl">
                {loading ? '...' : stats?.total ?? 0}
              </p>
            </div>
            <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4 text-center">
              <p className="text-xs uppercase tracking-widest text-emerald-600 dark:text-emerald-300">Complétées</p>
              <p className="mt-1 text-xl font-bold text-emerald-600 dark:text-emerald-300 sm:text-2xl">
                {loading ? '...' : stats?.completed ?? 0}
              </p>
            </div>
            <div className="rounded-2xl border border-yellow-400/30 bg-yellow-500/10 p-4 text-center">
              <p className="text-xs uppercase tracking-widest text-yellow-600 dark:text-yellow-300">En attente</p>
              <p className="mt-1 text-xl font-bold text-yellow-600 dark:text-yellow-300 sm:text-2xl">
                {loading ? '...' : stats?.pending ?? 0}
              </p>
            </div>
          </div>
        </div>

        {accountChecked && accounts.length === 0 && (
          <div className="rounded-4xl border border-amber-300/30 bg-amber-500/10 p-6 dark:border-amber-700/30">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-6 w-6 flex-shrink-0 text-amber-600 dark:text-amber-300" />
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-amber-800 dark:text-amber-200">Aucun compte attribué</h2>
                <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">
                  Vous n'avez pas encore de compte financier. Créez-en un pour commencer à effectuer des transactions.
                </p>
                <button
                  onClick={handleCreateAccount}
                  disabled={creatingAccount}
                  className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {creatingAccount ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus size={16} />}
                  {creatingAccount ? 'Création...' : 'Créer mon compte'}
                </button>
              </div>
            </div>
          </div>
        )}

        {accounts.length > 0 && (
          <div className="rounded-4xl border border-slate-200 bg-slate-50 p-6 dark:border-white/10 dark:bg-slate-800/50">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Solde et historique</h2>
            <div className="mt-4">
              <div className="text-sm text-slate-500 dark:text-slate-400">Compte: {accounts[0].accountNumber}</div>
              <div className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{accounts[0].currency} {Number(accounts[0].balance).toFixed(2)}</div>
            </div>
            <div className="mt-6">
              <BalanceChart transactions={transactions} currency={accounts[0].currency} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

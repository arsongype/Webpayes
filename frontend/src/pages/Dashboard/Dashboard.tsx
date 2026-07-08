import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchTransactions, fetchStats } from '../../store/slices/transactionSlice';
import { useAuth } from '../../hooks/useAuth';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppDispatch';
import accountService from '../../services/accountService';
import walletService from '../../services/walletService';
import BalanceChart from '../../components/charts/BalanceChart';

const Dashboard = () => {
  const dispatch = useAppDispatch();
  const { user, logout } = useAuth();
  const { stats, loading } = useAppSelector((state) => state.transactions);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);

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
          const hist = await walletService.getHistory(accs[0].id);
          setTransactions(hist);
        }
      } catch (err) {
        // ignore
      }
    };
    load();
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900 sm:px-6 lg:px-8 dark:bg-slate-950 dark:text-slate-50">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-4xl border border-slate-200 bg-white/80 p-8 shadow-xl backdrop-blur dark:border-white/10 dark:bg-slate-900/70">
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-600/80 dark:text-cyan-300/80">Dashboard</p>
          <h1 className="mt-4 text-4xl font-semibold">
            Bienvenue{user?.firstName ? `, ${user.firstName}` : ''}
          </h1>
          <p className="mt-4 max-w-2xl text-slate-500 dark:text-slate-300">
            Votre session JWT est active. Gérez vos comptes, effectuez des transferts et consultez votre historique.
          </p>

          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-center dark:border-white/10 dark:bg-slate-800/50">
              <p className="text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400">Transactions</p>
              <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
                {loading ? '...' : stats?.total ?? 0}
              </p>
            </div>
            <div className="rounded-3xl border border-emerald-400/30 bg-emerald-500/10 p-6 text-center">
              <p className="text-xs uppercase tracking-widest text-emerald-600 dark:text-emerald-300">Complétées</p>
              <p className="mt-2 text-3xl font-bold text-emerald-600 dark:text-emerald-300">
                {loading ? '...' : stats?.completed ?? 0}
              </p>
            </div>
            <div className="rounded-3xl border border-yellow-400/30 bg-yellow-500/10 p-6 text-center">
              <p className="text-xs uppercase tracking-widest text-yellow-600 dark:text-yellow-300">En attente</p>
              <p className="mt-2 text-3xl font-bold text-yellow-600 dark:text-yellow-300">
                {loading ? '...' : stats?.pending ?? 0}
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Link
              to="/wallet"
              className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 sm:w-auto dark:bg-slate-800 dark:hover:bg-slate-700"
            >
              Gérer mon portefeuille
            </Link>
            <Link
              to="/transactions"
              className="inline-flex w-full items-center justify-center rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-400 sm:w-auto"
            >
              Voir les transactions
            </Link>
            <Link
              to="/transfer"
              className="inline-flex w-full items-center justify-center rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-400 sm:w-auto"
            >
              Nouveau transfert
            </Link>
            <button
              type="button"
              onClick={logout}
              className="inline-flex w-full items-center justify-center rounded-2xl bg-cyan-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300 sm:w-auto"
            >
              Déconnexion
            </button>
          </div>
          {accounts.length > 0 && (
            <div className="mt-8 rounded-4xl border border-slate-200 bg-slate-50 p-6 dark:border-white/10 dark:bg-slate-800/50">
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
    </div>
  );
};

export default Dashboard;

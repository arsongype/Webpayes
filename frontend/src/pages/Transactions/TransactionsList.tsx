import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchTransactions } from '../../store/slices/transactionSlice';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppDispatch';
import Button from '../../components/common/Button/Button';

const formatCurrency = (value: string, currency: string = 'MGA') => {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency }).format(Number(value));
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
};

const getStatusBadge = (status: string) => {
  const styles: Record<string, string> = {
    PENDING: 'bg-yellow-500/20 text-yellow-200 border-yellow-400/30',
    COMPLETED: 'bg-emerald-500/20 text-emerald-200 border-emerald-400/30',
    FAILED: 'bg-red-500/20 text-red-200 border-red-400/30',
    CANCELLED: 'bg-slate-500/20 text-slate-200 border-slate-400/30',
  };
  const labels: Record<string, string> = {
    PENDING: 'En attente',
    COMPLETED: 'Complété',
    FAILED: 'Échoué',
    CANCELLED: 'Annulé',
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${styles[status] ?? styles.PENDING}`}>
      {labels[status] ?? status}
    </span>
  );
};

const TransactionsList = () => {
  const dispatch = useAppDispatch();
  const { transactions, loading, error } = useAppSelector((state) => state.transactions);

  useEffect(() => {
    dispatch(fetchTransactions({ page: 0, size: 20 }));
  }, [dispatch]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-cyan-400 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900 sm:px-6 lg:px-8 dark:bg-slate-950 dark:text-slate-50">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Transactions</h1>
            <p className="mt-2 text-slate-500 dark:text-slate-300">Historique de vos transferts</p>
          </div>
          <Link to="/transfer">
            <Button variant="primary">Nouveau transfert</Button>
          </Link>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-red-600 dark:text-red-200">
            {error}
          </div>
        )}

        <div className="overflow-hidden rounded-4xl border border-slate-200 bg-white/80 shadow-xl backdrop-blur dark:border-white/10 dark:bg-slate-900/70">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-white/10">
              <thead className="bg-slate-50 dark:bg-white/5">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-300">Référence</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-300">Montant</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-300">Statut</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-300">Date</th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-white/10">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                      Aucune transaction
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx) => (
                    <tr key={tx.id} className="transition hover:bg-slate-50 dark:hover:bg-white/5">
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-mono text-cyan-600 dark:text-cyan-200">{tx.reference}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white">
                        {formatCurrency(tx.amount, tx.currency)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">{getStatusBadge(tx.status)}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500 dark:text-slate-300">
                        {formatDate(tx.createdAt)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right">
                        <Link to={`/transactions/${tx.id}`} className="text-sm font-medium text-cyan-600 hover:text-cyan-700 dark:text-cyan-300 dark:hover:text-cyan-200">
                          Détails
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionsList;

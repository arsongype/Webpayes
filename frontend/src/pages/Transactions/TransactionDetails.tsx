import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchTransactionById } from '../../store/slices/transactionSlice';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppDispatch';
import { TransactionStatus } from '../../types/transaction.types';

const formatCurrency = (value: string, currency: string = 'MGA') => {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency }).format(Number(value));
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const TransactionDetails = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const { currentTransaction, loading } = useAppSelector((state) => state.transactions);

  useEffect(() => {
    if (id) {
      dispatch(fetchTransactionById(id));
    }
  }, [dispatch, id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-cyan-400 border-t-transparent" />
      </div>
    );
  }

  if (!currentTransaction) {
    return (
      <div className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900 dark:bg-slate-950 dark:text-slate-50">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-4xl border border-slate-200 bg-white/80 p-8 text-center dark:border-white/10 dark:bg-slate-900/70">
            <p className="text-slate-500 dark:text-slate-300">Transaction introuvable</p>
            <Link to="/transactions" className="mt-4 inline-block text-cyan-600 hover:text-cyan-700 dark:text-cyan-300 dark:hover:text-cyan-200">
              Retour à la liste
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const statusStyles: Record<TransactionStatus, string> = {
    [TransactionStatus.PENDING]: 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-200 border-yellow-400/30',
    [TransactionStatus.COMPLETED]: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-200 border-emerald-400/30',
    [TransactionStatus.FAILED]: 'bg-red-500/20 text-red-600 dark:text-red-200 border-red-400/30',
    [TransactionStatus.CANCELLED]: 'bg-slate-500/20 text-slate-600 dark:text-slate-200 border-slate-400/30',
  };

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900 sm:px-6 lg:px-8 dark:bg-slate-950 dark:text-slate-50">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6">
          <Link to="/transactions" className="text-sm text-cyan-600 hover:text-cyan-700 dark:text-cyan-300 dark:hover:text-cyan-200">
            ← Retour à la liste
          </Link>
        </div>

        <div className="rounded-4xl border border-slate-200 bg-white/80 p-8 shadow-xl backdrop-blur dark:border-white/10 dark:bg-slate-900/70">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-semibold">Détails de la transaction</h1>
            <span className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium ${statusStyles[currentTransaction.status]}`}>
              {currentTransaction.status}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-slate-800/50">
              <p className="text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400">Référence</p>
              <p className="mt-1 font-mono text-cyan-600 dark:text-cyan-200">{currentTransaction.reference}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-slate-800/50">
              <p className="text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400">Montant</p>
              <p className="mt-1 text-xl font-semibold text-slate-900 dark:text-white">
                {formatCurrency(currentTransaction.amount, currentTransaction.currency)}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-slate-800/50">
              <p className="text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400">Compte émetteur</p>
              <p className="mt-1 font-mono text-sm text-slate-700 dark:text-slate-200">{currentTransaction.senderAccountId}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-slate-800/50">
              <p className="text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400">Compte destinataire</p>
              <p className="mt-1 font-mono text-sm text-slate-700 dark:text-slate-200">{currentTransaction.receiverAccountId}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-slate-800/50">
              <p className="text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400">Date de création</p>
              <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">{formatDate(currentTransaction.createdAt)}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-slate-800/50">
              <p className="text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400">Dernière mise à jour</p>
              <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">{formatDate(currentTransaction.updatedAt)}</p>
            </div>
          </div>

          {(currentTransaction.fraudScore !== undefined || currentTransaction.riskScore !== undefined) && (
            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-slate-800/50">
              <p className="text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400">Analyse IA</p>
              <div className="mt-2 flex gap-4">
                {currentTransaction.fraudScore !== undefined && (
                  <div>
                    <span className="text-sm text-slate-600 dark:text-slate-300">Score de fraude</span>
                    <p className="text-lg font-semibold text-cyan-600 dark:text-cyan-200">{(currentTransaction.fraudScore * 100).toFixed(1)}%</p>
                  </div>
                )}
                {currentTransaction.riskScore !== undefined && (
                  <div>
                    <span className="text-sm text-slate-600 dark:text-slate-300">Score de risque</span>
                    <p className="text-lg font-semibold text-cyan-600 dark:text-cyan-200">{(currentTransaction.riskScore * 100).toFixed(1)}%</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionDetails;

import { useEffect, useState } from 'react';
import refundService, { type RefundDTO, type RefundRequest } from '../../services/refundService';
import transactionService, { type Transaction } from '../../services/transactionService';
import { useAuth } from '../../hooks/useAuth';

const Refunds = () => {
  const { user } = useAuth();
  const [refunds, setRefunds] = useState<RefundDTO[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [form, setForm] = useState<RefundRequest>({ transactionId: '', amount: '', reason: '' });

  const load = async () => {
    try {
      const [r, t] = await Promise.all([refundService.list(), transactionService.list(0, 100)]);
      setRefunds(r);
      setTransactions(t.content || []);
    } catch {
      setError('Impossible de charger les remboursements.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      await refundService.create(form);
      setSuccess('Demande de remboursement envoyée.');
      setShowForm(false);
      setForm({ transactionId: '', amount: '', reason: '' });
      load();
    } catch {
      setError('Échec de la demande.');
    }
  };

  const statusColor = (s: string) => s === 'APPROVED' || s === 'COMPLETED' ? 'emerald' : s === 'REJECTED' ? 'rose' : 'amber';

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900 dark:bg-slate-950 dark:text-slate-50 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-4xl border border-slate-200 bg-white/80 p-8 shadow-xl backdrop-blur dark:border-white/10 dark:bg-slate-900/70">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-cyan-600/80 dark:text-cyan-300/80">Transactions</p>
              <h1 className="mt-2 text-3xl font-semibold">Remboursements</h1>
            </div>
            <button onClick={() => setShowForm(!showForm)} className="rounded-2xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-400">
              {showForm ? 'Annuler' : 'Nouvelle demande'}
            </button>
          </div>

          {error && (
            <div className="mb-6 rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-600 dark:text-rose-200" role="alert">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-6 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-600 dark:text-emerald-200" role="status">
              {success}
            </div>
          )}

          {showForm && (
            <form className="mb-8 rounded-3xl border border-slate-200 bg-slate-50 p-6 dark:border-white/10 dark:bg-slate-800/50" onSubmit={handleSubmit}>
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Transaction</label>
                  <select value={form.transactionId} onChange={(e) => setForm({ ...form, transactionId: e.target.value })} className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-cyan-500 dark:border-white/10 dark:bg-slate-800/80 dark:text-slate-100" required>
                    <option value="">Sélectionner</option>
                    {transactions.map((t) => <option key={t.id} value={t.id}>{t.reference} — {t.amount} {t.currency}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Montant</label>
                  <input type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-cyan-500 dark:border-white/10 dark:bg-slate-800/80 dark:text-slate-100" required />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Motif</label>
                  <input value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-cyan-500 dark:border-white/10 dark:bg-slate-800/80 dark:text-slate-100" required />
                </div>
              </div>
              <div className="mt-6">
                <button type="submit" className="rounded-2xl bg-cyan-500 px-6 py-3 font-semibold text-white transition hover:bg-cyan-400">Envoyer</button>
              </div>
            </form>
          )}

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />
            </div>
          ) : refunds.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 text-center dark:border-white/10 dark:bg-slate-800/50">
              <p className="text-slate-500 dark:text-slate-400">Aucun remboursement.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {refunds.map((r) => (
                <div key={r.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-slate-800/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">{r.amount} {r.reason}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Transaction: {r.transactionId}</p>
                    </div>
                    <span className={`inline-flex items-center rounded-full bg-${statusColor(r.status)}-500/15 px-3 py-1 text-xs font-medium text-${statusColor(r.status)}-600 dark:text-${statusColor(r.status)}-300`}>
                      {r.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Refunds;

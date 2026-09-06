import { useEffect, useState } from 'react';
import refundService, { type RefundDTO } from '../../services/refundService';
import { CheckCircle2, XCircle } from 'lucide-react';

const AdminRefunds = () => {
  const [refunds, setRefunds] = useState<RefundDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('');

  const load = async () => {
    try {
      const data = await refundService.list();
      setRefunds(data);
    } catch {
      setError('Impossible de charger les remboursements.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  const handleAction = async (id: string, action: 'approve' | 'reject' | 'complete') => {
    try {
      if (action === 'approve') await refundService.approve(id);
      else if (action === 'reject') await refundService.reject(id);
      else await refundService.complete(id);
      setSuccess('Action effectuée.');
      load();
    } catch {
      setError('Échec.');
    }
  };

  const statusConfig: Record<string, { bg: string; text: string }> = {
    APPROVED: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-300' },
    COMPLETED: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-300' },
    REJECTED: { bg: 'bg-rose-100 dark:bg-rose-900/30', text: 'text-rose-700 dark:text-rose-300' },
    PENDING: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-300' },
  };

  const filtered = filter ? refunds.filter((r) => r.status === filter) : refunds;

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-6 lg:px-8 dark:bg-slate-950 dark:text-slate-50">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6">
          <p className="text-sm font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Admin</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">Gestion des remboursements</h1>
        </div>

        <div className="mb-6">
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-cyan-500 dark:border-white/10 dark:bg-slate-800/80 dark:text-slate-100">
            <option value="">Tous</option>
            <option value="PENDING">En attente</option>
            <option value="APPROVED">Approuvés</option>
            <option value="REJECTED">Rejetés</option>
            <option value="COMPLETED">Complétés</option>
          </select>
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

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center dark:border-white/10 dark:bg-slate-900">
            <p className="text-slate-500 dark:text-slate-400">Aucun remboursement.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-slate-900">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 dark:border-white/5 dark:bg-slate-800/40">
                    <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Montant</th>
                    <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Raison</th>
                    <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Statut</th>
                    <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-right text-slate-500 dark:text-slate-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {filtered.map((r) => {
                    const status = statusConfig[r.status] || statusConfig.PENDING;
                    return (
                      <tr key={r.id} className="transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/30">
                        <td className="whitespace-nowrap px-6 py-3.5 font-semibold text-slate-900 dark:text-white">{r.amount}</td>
                        <td className="px-6 py-3.5 text-slate-600 dark:text-slate-300">{r.reason}</td>
                        <td className="whitespace-nowrap px-6 py-3.5">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${status.bg} ${status.text}`}>
                            {r.status}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-3.5 text-right">
                          {r.status === 'PENDING' && (
                            <>
                              <button onClick={() => handleAction(r.id, 'approve')} className="mr-2 inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-500/20 dark:text-emerald-300">
                                <CheckCircle2 size={14} />
                                Approuver
                              </button>
                              <button onClick={() => handleAction(r.id, 'reject')} className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-500/20 dark:text-rose-300">
                                <XCircle size={14} />
                                Rejeter
                              </button>
                            </>
                          )}
                          {r.status === 'APPROVED' && (
                            <button onClick={() => handleAction(r.id, 'complete')} className="inline-flex items-center gap-1 rounded-full bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold text-cyan-700 transition hover:bg-cyan-500/20 dark:text-cyan-300">
                              Compléter
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminRefunds;

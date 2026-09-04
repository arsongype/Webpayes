import { useEffect, useState } from 'react';
import refundService, { type RefundDTO } from '../../services/refundService';

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

  const statusColor = (s: string) => s === 'APPROVED' || s === 'COMPLETED' ? 'emerald' : s === 'REJECTED' ? 'rose' : 'amber';

  const filtered = filter ? refunds.filter((r) => r.status === filter) : refunds;

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900 dark:bg-slate-950 dark:text-slate-50 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-4xl border border-slate-200 bg-white/80 p-8 shadow-xl backdrop-blur dark:border-white/10 dark:bg-slate-900/70">
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-600/80 dark:text-cyan-300/80">Admin</p>
          <h1 className="mt-2 text-3xl font-semibold">Gestion des remboursements</h1>

          <div className="mt-4">
            <select value={filter} onChange={(e) => setFilter(e.target.value)} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-slate-900 outline-none focus:border-cyan-500 dark:border-white/10 dark:bg-slate-800/80 dark:text-slate-100">
              <option value="">Tous</option>
              <option value="PENDING">En attente</option>
              <option value="APPROVED">Approuvés</option>
              <option value="REJECTED">Rejetés</option>
              <option value="COMPLETED">Complétés</option>
            </select>
          </div>

          {error && (
            <div className="mt-6 rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-600 dark:text-rose-200" role="alert">
              {error}
            </div>
          )}
          {success && (
            <div className="mt-6 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-600 dark:text-emerald-200" role="status">
              {success}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 text-center dark:border-white/10 dark:bg-slate-800/50">
              <p className="text-slate-500 dark:text-slate-400">Aucun remboursement.</p>
            </div>
          ) : (
            <div className="mt-8 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-white/10">
                    <th className="pb-3 font-medium text-slate-500 dark:text-slate-400">Montant</th>
                    <th className="pb-3 font-medium text-slate-500 dark:text-slate-400">Raison</th>
                    <th className="pb-3 font-medium text-slate-500 dark:text-slate-400">Statut</th>
                    <th className="pb-3 font-medium text-slate-500 dark:text-slate-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-white/10">
                  {filtered.map((r) => (
                    <tr key={r.id}>
                      <td className="py-4 font-medium text-slate-900 dark:text-white">{r.amount}</td>
                      <td className="py-4 text-slate-500 dark:text-slate-400">{r.reason}</td>
                      <td className="py-4">
                        <span className={`inline-flex items-center rounded-full bg-${statusColor(r.status)}-500/15 px-3 py-1 text-xs font-medium text-${statusColor(r.status)}-600 dark:text-${statusColor(r.status)}-300`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="py-4">
                        {r.status === 'PENDING' && (
                          <>
                            <button onClick={() => handleAction(r.id, 'approve')} className="mr-2 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-300">Approuver</button>
                            <button onClick={() => handleAction(r.id, 'reject')} className="mr-2 rounded-full bg-rose-500/15 px-3 py-1 text-xs font-medium text-rose-600 dark:text-rose-300">Rejeter</button>
                          </>
                        )}
                        {r.status === 'APPROVED' && (
                          <button onClick={() => handleAction(r.id, 'complete')} className="rounded-full bg-cyan-500/15 px-3 py-1 text-xs font-medium text-cyan-600 dark:text-cyan-300">Compléter</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminRefunds;


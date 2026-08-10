import { useEffect, useState } from 'react';
import merchantService, { type MerchantAffiliationRequestDTO } from '../../services/merchantService';

const AdminAffiliationRequests = () => {
  const [requests, setRequests] = useState<MerchantAffiliationRequestDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const load = async () => {
    try {
      const data = await merchantService.listRequests();
      setRequests(data);
    } catch {
      setError('Impossible de charger les demandes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleApprove = async (id: string) => {
    try {
      await merchantService.approveRequest(id);
      setSuccess('Demande approuvée.');
      load();
    } catch {
      setError('Échec.');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await merchantService.rejectRequest(id);
      setSuccess('Demande rejetée.');
      load();
    } catch {
      setError('Échec.');
    }
  };

  const statusColor = (s: string) => s === 'APPROVED' ? 'emerald' : s === 'REJECTED' ? 'rose' : 'amber';

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900 dark:bg-slate-950 dark:text-slate-50 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-4xl border border-slate-200 bg-white/80 p-8 shadow-xl backdrop-blur dark:border-white/10 dark:bg-slate-900/70">
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-600/80 dark:text-cyan-300/80">Admin</p>
          <h1 className="mt-2 text-3xl font-semibold">Demandes d'affiliation marchand</h1>

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
          ) : requests.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 text-center dark:border-white/10 dark:bg-slate-800/50">
              <p className="text-slate-500 dark:text-slate-400">Aucune demande.</p>
            </div>
          ) : (
            <div className="mt-8 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-white/10">
                    <th className="pb-3 font-medium text-slate-500 dark:text-slate-400">Utilisateur</th>
                    <th className="pb-3 font-medium text-slate-500 dark:text-slate-400">Motif</th>
                    <th className="pb-3 font-medium text-slate-500 dark:text-slate-400">Statut</th>
                    <th className="pb-3 font-medium text-slate-500 dark:text-slate-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-white/10">
                  {requests.map((r) => (
                    <tr key={r.id}>
                      <td className="py-4 font-medium text-slate-900 dark:text-white">{r.userId}</td>
                      <td className="py-4 text-slate-500 dark:text-slate-400">{r.reason || '—'}</td>
                      <td className="py-4">
                        <span className={`inline-flex items-center rounded-full bg-${statusColor(r.status)}-500/15 px-3 py-1 text-xs font-medium text-${statusColor(r.status)}-600 dark:text-${statusColor(r.status)}-300`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="py-4">
                        {r.status !== 'APPROVED' && (
                          <button onClick={() => handleApprove(r.id)} className="mr-2 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-300">Approuver</button>
                        )}
                        {r.status !== 'REJECTED' && (
                          <button onClick={() => handleReject(r.id)} className="rounded-full bg-rose-500/15 px-3 py-1 text-xs font-medium text-rose-600 dark:text-rose-300">Rejeter</button>
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

export default AdminAffiliationRequests;

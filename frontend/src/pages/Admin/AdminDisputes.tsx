import { useEffect, useState } from 'react';
import refundService, { type DisputeDTO } from '../../services/refundService';

const AdminDisputes = () => {
  const [disputes, setDisputes] = useState<DisputeDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('');
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [resolution, setResolution] = useState('');

  const load = async () => {
    try {
      const data = await refundService.listDisputes();
      setDisputes(data);
    } catch {
      setError('Impossible de charger les litiges.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  const handleStatusUpdate = async (id: string, status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED') => {
    try {
      await refundService.updateDisputeStatus(id, status);
      setSuccess('Statut mis à jour.');
      load();
    } catch {
      setError('Échec.');
    }
  };

  const handleResolve = async (id: string) => {
    try {
      await refundService.resolveDispute(id, resolution);
      setSuccess('Litige résolu.');
      setResolvingId(null);
      setResolution('');
      load();
    } catch {
      setError('Échec.');
    }
  };

  const statusColor = (s: string) => s === 'RESOLVED' || s === 'CLOSED' ? 'emerald' : s === 'IN_PROGRESS' ? 'cyan' : 'amber';

  const filtered = filter ? disputes.filter((d) => d.status === filter) : disputes;

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900 dark:bg-slate-950 dark:text-slate-50 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-4xl border border-slate-200 bg-white/80 p-8 shadow-xl backdrop-blur dark:border-white/10 dark:bg-slate-900/70">
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-600/80 dark:text-cyan-300/80">Admin</p>
          <h1 className="mt-2 text-3xl font-semibold">Gestion des litiges</h1>

          <div className="mt-4">
            <select value={filter} onChange={(e) => setFilter(e.target.value)} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-slate-900 outline-none focus:border-cyan-500 dark:border-white/10 dark:bg-slate-800/80 dark:text-slate-100">
              <option value="">Tous</option>
              <option value="OPEN">Ouverts</option>
              <option value="IN_PROGRESS">En cours</option>
              <option value="RESOLVED">Résolus</option>
              <option value="CLOSED">Fermés</option>
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
              <p className="text-slate-500 dark:text-slate-400">Aucun litige.</p>
            </div>
          ) : (
            <div className="mt-8 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-white/10">
                    <th className="pb-3 font-medium text-slate-500 dark:text-slate-400">Raison</th>
                    <th className="pb-3 font-medium text-slate-500 dark:text-slate-400">Description</th>
                    <th className="pb-3 font-medium text-slate-500 dark:text-slate-400">Statut</th>
                    <th className="pb-3 font-medium text-slate-500 dark:text-slate-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-white/10">
                  {filtered.map((d) => (
                    <tr key={d.id}>
                      <td className="py-4 font-medium text-slate-900 dark:text-white">{d.reason}</td>
                      <td className="py-4 text-slate-500 dark:text-slate-400">{d.description}</td>
                      <td className="py-4">
                        <span className={`inline-flex items-center rounded-full bg-${statusColor(d.status)}-500/15 px-3 py-1 text-xs font-medium text-${statusColor(d.status)}-600 dark:text-${statusColor(d.status)}-300`}>
                          {d.status}
                        </span>
                      </td>
                      <td className="py-4">
                        {d.status === 'OPEN' && (
                          <button onClick={() => handleStatusUpdate(d.id, 'IN_PROGRESS')} className="mr-2 rounded-full bg-cyan-500/15 px-3 py-1 text-xs font-medium text-cyan-600 dark:text-cyan-300">Prendre</button>
                        )}
                        {d.status === 'IN_PROGRESS' && (
                          <button onClick={() => { setResolvingId(d.id); setResolution(''); }} className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-300">Résoudre</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {resolvingId && (
            <div className="mt-8 rounded-3xl border border-slate-200 bg-slate-50 p-6 dark:border-white/10 dark:bg-slate-800/50">
              <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Résoudre le litige</h3>
              <textarea
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                rows={3}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-cyan-500 dark:border-white/10 dark:bg-slate-800/80 dark:text-slate-100"
                placeholder="Solution apportée..."
                required
              />
              <div className="mt-4 flex gap-4">
                <button onClick={() => handleResolve(resolvingId)} className="rounded-2xl bg-emerald-500 px-6 py-3 font-semibold text-white transition hover:bg-emerald-400">Résoudre</button>
                <button onClick={() => setResolvingId(null)} className="rounded-2xl border border-slate-300 px-6 py-3 font-medium text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-slate-800">Annuler</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDisputes;


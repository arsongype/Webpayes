import { useEffect, useState } from 'react';
import refundService, { type DisputeDTO } from '../../services/refundService';
import { CheckCircle2, XCircle } from 'lucide-react';

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

  const statusConfig: Record<string, { bg: string; text: string }> = {
    RESOLVED: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-300' },
    CLOSED: { bg: 'bg-slate-100 dark:bg-slate-800/50', text: 'text-slate-700 dark:text-slate-300' },
    IN_PROGRESS: { bg: 'bg-cyan-100 dark:bg-cyan-900/30', text: 'text-cyan-700 dark:text-cyan-300' },
    OPEN: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-300' },
  };

  const filtered = filter ? disputes.filter((d) => d.status === filter) : disputes;

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-6 lg:px-8 dark:bg-slate-950 dark:text-slate-50">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6">
          <p className="text-sm font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Admin</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">Gestion des litiges</h1>
        </div>

        <div className="mb-6">
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-cyan-500 dark:border-white/10 dark:bg-slate-800/80 dark:text-slate-100">
            <option value="">Tous</option>
            <option value="OPEN">Ouverts</option>
            <option value="IN_PROGRESS">En cours</option>
            <option value="RESOLVED">Résolus</option>
            <option value="CLOSED">Fermés</option>
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
            <p className="text-slate-500 dark:text-slate-400">Aucun litige.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-slate-900">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 dark:border-white/5 dark:bg-slate-800/40">
                    <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Raison</th>
                    <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Description</th>
                    <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Statut</th>
                    <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-right text-slate-500 dark:text-slate-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {filtered.map((d) => {
                    const status = statusConfig[d.status] || statusConfig.OPEN;
                    return (
                      <tr key={d.id} className="transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/30">
                        <td className="whitespace-nowrap px-6 py-3.5 font-semibold text-slate-900 dark:text-white">{d.reason}</td>
                        <td className="px-6 py-3.5 text-slate-600 dark:text-slate-300">{d.description}</td>
                        <td className="whitespace-nowrap px-6 py-3.5">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${status.bg} ${status.text}`}>
                            {d.status}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-3.5 text-right">
                          {d.status === 'OPEN' && (
                            <button onClick={() => handleStatusUpdate(d.id, 'IN_PROGRESS')} className="inline-flex items-center gap-1 rounded-full bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold text-cyan-700 transition hover:bg-cyan-500/20 dark:text-cyan-300">
                              Prendre
                            </button>
                          )}
                          {d.status === 'IN_PROGRESS' && (
                            <button onClick={() => setResolvingId(d.id)} className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-500/20 dark:text-emerald-300">
                              <CheckCircle2 size={14} />
                              Résoudre
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

        {resolvingId && (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900">
            <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Résoudre le litige</h3>
            <textarea
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              rows={3}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-500 dark:border-white/10 dark:bg-slate-800/80 dark:text-slate-100"
              placeholder="Solution apportée..."
              required
            />
            <div className="mt-4 flex gap-3">
              <button onClick={() => handleResolve(resolvingId)} className="rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md transition hover:shadow-lg">
                Résoudre
              </button>
              <button onClick={() => setResolvingId(null)} className="rounded-2xl border border-slate-300 px-6 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-slate-800">
                Annuler
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDisputes;

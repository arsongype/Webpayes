import { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import merchantService, { type MerchantProfileDTO } from '../../services/merchantService';

const AdminMerchants = () => {
  const location = useLocation();
  const searchResults = (location.state as { searchResults?: MerchantProfileDTO[] } | null)?.searchResults;
  const [profiles, setProfiles] = useState<MerchantProfileDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      let data: MerchantProfileDTO[];
      if (searchResults) {
        data = searchResults;
      } else {
        data = await merchantService.listAll();
      }
      setProfiles(data);
    } catch {
      setError('Impossible de charger les marchands.');
    } finally {
      setLoading(false);
    }
  }, [searchResults]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const handleApprove = async (id: string) => {
    try {
      await merchantService.approveProfile(id);
      setSuccess('Marchand approuvé.');
      load();
    } catch {
      setError('Échec.');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await merchantService.rejectProfile(id);
      setSuccess('Marchand rejeté.');
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
          <h1 className="mt-2 text-3xl font-semibold">Gestion des marchands</h1>

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
          ) : profiles.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 text-center dark:border-white/10 dark:bg-slate-800/50">
              <p className="text-slate-500 dark:text-slate-400">Aucun marchand.</p>
            </div>
          ) : (
            <div className="mt-8 space-y-4">
              {profiles.map((p) => (
                <div key={p.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-white/10 dark:bg-slate-800/50">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">{p.shopName}</h3>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{p.phoneNumber}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex items-center rounded-full bg-${statusColor(p.status)}-500/15 px-3 py-1 text-xs font-medium text-${statusColor(p.status)}-600 dark:text-${statusColor(p.status)}-300`}>
                        {p.status}
                      </span>
                      {p.status !== 'APPROVED' && (
                        <button onClick={() => handleApprove(p.id)} className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-300">Approuver</button>
                      )}
                      {p.status !== 'REJECTED' && (
                        <button onClick={() => handleReject(p.id)} className="rounded-full bg-rose-500/15 px-3 py-1 text-xs font-medium text-rose-600 dark:text-rose-300">Rejeter</button>
                      )}
                    </div>
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

export default AdminMerchants;

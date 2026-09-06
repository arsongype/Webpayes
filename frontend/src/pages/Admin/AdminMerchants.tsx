import { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import merchantService, { type MerchantProfileDTO } from '../../services/merchantService';
import { CheckCircle2, XCircle, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { exportTableToPdf } from '../../utils/exportPdf';

const AdminMerchants = () => {
  const location = useLocation();
  const searchResults = (location.state as { searchResults?: MerchantProfileDTO[] } | null)?.searchResults;
  const [profiles, setProfiles] = useState<MerchantProfileDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const pageSize = 5;

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

  const startIndex = page * pageSize;
  const visibleProfiles = profiles.slice(startIndex, startIndex + pageSize);
  const totalPages = Math.max(1, Math.ceil(profiles.length / pageSize));

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

  const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
    APPROVED: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-300', dot: 'bg-emerald-500' },
    REJECTED: { bg: 'bg-rose-100 dark:bg-rose-900/30', text: 'text-rose-700 dark:text-rose-300', dot: 'bg-rose-500' },
    PENDING: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-300', dot: 'bg-amber-500' },
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-6 lg:px-8 dark:bg-slate-950 dark:text-slate-50">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6">
          <p className="text-sm font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Admin</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">Gestion des marchands</h1>
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

        <div className="mb-6 flex justify-end">
          <button
            type="button"
            onClick={() =>
              exportTableToPdf({
                title: 'Gestion des marchands',
                subtitle: `Exporté le ${new Date().toLocaleString('fr-FR')}`,
                columns: [
                  { key: 'shopName', label: 'Boutique' },
                  { key: 'phone', label: 'Téléphone' },
                  { key: 'status', label: 'Statut' },
                ],
                rows: profiles.map((p) => ({
                  shopName: p.shopName,
                  phone: p.phoneNumber,
                  status: p.status,
                })),
              })
            }
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            <Download className="h-4 w-4" />
            Exporter PDF
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />
          </div>
        ) : profiles.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center dark:border-white/10 dark:bg-slate-900">
            <p className="text-slate-500 dark:text-slate-400">Aucun marchand.</p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {visibleProfiles.map((p) => {
                const status = statusConfig[p.status] || statusConfig.PENDING;
                return (
                  <div key={p.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-white/10 dark:bg-slate-900">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white">{p.shopName}</h3>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{p.phoneNumber}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${status.bg} ${status.text}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                          {p.status}
                        </span>
                        {p.status !== 'APPROVED' && (
                          <button onClick={() => handleApprove(p.id)} className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-500/20 dark:text-emerald-300">
                            <CheckCircle2 size={14} />
                            Approuver
                          </button>
                        )}
                        {p.status !== 'REJECTED' && (
                          <button onClick={() => handleReject(p.id)} className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-500/20 dark:text-rose-300">
                            <XCircle size={14} />
                            Rejeter
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
                <span>
                  {profiles.length} marchand(s) — page {page + 1} sur {totalPages}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0}
                    className="inline-flex items-center gap-1 rounded-xl border border-slate-300 bg-white px-3 py-1.5 transition hover:bg-slate-50 disabled:opacity-50 dark:border-white/10 dark:bg-slate-800 dark:hover:bg-slate-700"
                  >
                    <ChevronLeft size={14} /> Précédent
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                    disabled={page >= totalPages - 1}
                    className="inline-flex items-center gap-1 rounded-xl border border-slate-300 bg-white px-3 py-1.5 transition hover:bg-slate-50 disabled:opacity-50 dark:border-white/10 dark:bg-slate-800 dark:hover:bg-slate-700"
                  >
                    Suivant <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminMerchants;

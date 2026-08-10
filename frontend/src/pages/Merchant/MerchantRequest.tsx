import { useEffect, useState } from 'react';
import merchantService, { type MerchantAffiliationRequestDTO } from '../../services/merchantService';
import { useAuth } from '../../hooks/useAuth';

const MerchantRequest = () => {
  const { user } = useAuth();
  const [request, setRequest] = useState<MerchantAffiliationRequestDTO | null>(null);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await merchantService.getMyRequest();
        setRequest(data);
      } catch {
        setError('Impossible de vérifier le statut de votre demande.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      const created = await merchantService.submitRequest({ reason });
      setRequest(created);
      setSuccess('Demande envoyée avec succès.');
      setReason('');
    } catch {
      setError('Échec de l\'envoi de la demande.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 dark:bg-slate-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />
      </div>
    );
  }

  const statusColor = request?.status === 'APPROVED' ? 'emerald' : request?.status === 'REJECTED' ? 'rose' : 'amber';

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900 dark:bg-slate-950 dark:text-slate-50 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        <div className="rounded-4xl border border-slate-200 bg-white/80 p-8 shadow-xl backdrop-blur dark:border-white/10 dark:bg-slate-900/70">
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-600/80 dark:text-cyan-300/80">Marchand</p>
          <h1 className="mt-2 text-3xl font-semibold">Devenir marchand</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Soumettez une demande pour obtenir un profil marchand et commencer à vendre sur la plateforme.
          </p>

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

          {request ? (
            <div className="mt-8 rounded-3xl border border-slate-200 bg-slate-50 p-6 dark:border-white/10 dark:bg-slate-800/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Statut de la demande</p>
                  <p className={`mt-1 text-lg font-semibold text-${statusColor}-600 dark:text-${statusColor}-300`}>
                    {request.status}
                  </p>
                </div>
                <span className={`inline-flex items-center rounded-full bg-${statusColor}-500/15 px-3 py-1 text-xs font-medium text-${statusColor}-600 dark:text-${statusColor}-300`}>
                  {request.status}
                </span>
              </div>
              {request.reason && (
                <div className="mt-4">
                  <p className="text-sm text-slate-500 dark:text-slate-400">Motif</p>
                  <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">{request.reason}</p>
                </div>
              )}
            </div>
          ) : (
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Pourquoi souhaitez-vous devenir marchand ?
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={4}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-500 dark:border-white/10 dark:bg-slate-800/80 dark:text-slate-100 dark:focus:border-cyan-400"
                  placeholder="Décrivez votre activité..."
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-2xl bg-cyan-500 px-4 py-3 font-semibold text-white transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? 'Envoi...' : 'Soumettre la demande'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default MerchantRequest;

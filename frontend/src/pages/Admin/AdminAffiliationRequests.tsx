import { useEffect, useState } from 'react';
import merchantService, { type MerchantAffiliationRequestDTO, type MerchantAffiliationRequestPageDTO } from '../../services/merchantService';
import { Eye, Shield, FileText, ChevronLeft, ChevronRight, CheckCircle2, XCircle } from 'lucide-react';

const AdminAffiliationRequests = () => {
  const [requests, setRequests] = useState<MerchantAffiliationRequestDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);
  const [showDocModal, setShowDocModal] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const load = async (p = 0) => {
    setLoading(true);
    try {
      const data: MerchantAffiliationRequestPageDTO = await merchantService.listRequestsPaginated(p, 5);
      setRequests(data.content);
      setPage(data.number);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
    } catch {
      setError('Impossible de charger les demandes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

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

  const handleVerifyKyc = async (id: string, status: string) => {
    try {
      await merchantService.verifyKyc(id, status);
      setSuccess(`KYC ${status === 'VERIFIED' ? 'vérifié' : 'rejeté'}.`);
      load();
    } catch {
      setError('Échec de la vérification KYC.');
    }
  };

  const statusConfig: Record<string, { bg: string; text: string }> = {
    APPROVED: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-300' },
    REJECTED: { bg: 'bg-rose-100 dark:bg-rose-900/30', text: 'text-rose-700 dark:text-rose-300' },
    PENDING: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-300' },
  };

  const kycStatusConfig: Record<string, { bg: string; text: string }> = {
    VERIFIED: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-300' },
    REJECTED: { bg: 'bg-rose-100 dark:bg-rose-900/30', text: 'text-rose-700 dark:text-rose-300' },
    PENDING: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-300' },
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 dark:bg-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-md">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Demandes d'affiliation marchand</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Vérifiez les documents KYC et approuvez les profils marchands.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-600 dark:text-rose-200">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-600 dark:text-emerald-200">
            {success}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />
          </div>
        ) : requests.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center dark:border-white/10 dark:bg-slate-900">
            <FileText className="mx-auto mb-4 h-12 w-12 text-slate-400" />
            <p className="text-slate-500 dark:text-slate-400">Aucune demande pour le moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {requests.map((r) => {
              const status = statusConfig[r.status] || statusConfig.PENDING;
              const kycStatus = kycStatusConfig[r.kycStatus || 'PENDING'] || kycStatusConfig.PENDING;
              return (
                <div
                  key={r.id}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-white/10 dark:bg-slate-900"
                >
                  <div className="mb-4 flex items-start justify-between">
                    <div className="space-y-1">
                      <h3 className="font-semibold text-slate-900 dark:text-white">
                        {r.userFirstName} {r.userLastName}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{r.userEmail}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500">ID utilisateur: {r.userId}</p>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${status.bg} ${status.text}`}>
                      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
                      {r.status}
                    </span>
                  </div>

                  {r.reason && (
                    <div className="mb-3 rounded-xl bg-slate-50 p-3 text-sm dark:bg-slate-800/50">
                      <span className="font-medium text-slate-600 dark:text-slate-400">Motif:</span> {r.reason}
                    </div>
                  )}

                  <div className="mb-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Statut KYC:</span>
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-semibold ${kycStatus.bg} ${kycStatus.text}`}>
                        {r.kycStatus || 'PENDING'}
                      </span>
                    </div>
                    {r.idDocumentType && (
                      <div className="flex justify-between">
                        <span className="text-slate-500 dark:text-slate-400">Pièce d'identité:</span>
                        <span className="text-slate-900 dark:text-white">{r.idDocumentType} • {r.idDocumentNumber}</span>
                      </div>
                    )}
                    {r.kycSubmittedAt && (
                      <div className="flex justify-between">
                        <span className="text-slate-500 dark:text-slate-400">Soumis le:</span>
                        <span className="text-slate-900 dark:text-white">
                          {new Date(r.kycSubmittedAt).toLocaleString()}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Créé le:</span>
                      <span className="text-slate-900 dark:text-white">
                        {r.createdAt && new Date(r.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {r.idDocumentImage && (
                    <button
                      onClick={() => { setSelectedDoc(r.idDocumentImage!); setShowDocModal(true); }}
                      className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-slate-100 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200 dark:border-white/10 dark:bg-slate-800/50 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                      <Eye size={18} />
                      Voir le document d'identité
                    </button>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {r.kycStatus !== 'VERIFIED' && (
                      <>
                        <button
                          onClick={() => handleVerifyKyc(r.id, 'VERIFIED')}
                          className="flex-1 rounded-full bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-500/20 dark:text-emerald-300"
                        >
                          Vérifier KYC
                        </button>
                        <button
                          onClick={() => handleVerifyKyc(r.id, 'REJECTED')}
                          className="flex-1 rounded-full bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-500/20 dark:text-rose-300"
                        >
                          Rejeter KYC
                        </button>
                      </>
                    )}
                    {r.status !== 'APPROVED' && r.kycStatus === 'VERIFIED' && (
                      <button
                        onClick={() => handleApprove(r.id)}
                        className="flex-1 rounded-full bg-amber-500/10 px-3 py-2 text-xs font-semibold text-amber-700 transition hover:bg-amber-500/20 dark:text-amber-300"
                      >
                        Approuver la demande
                      </button>
                    )}
                    {r.status !== 'REJECTED' && (
                      <button
                        onClick={() => handleReject(r.id)}
                        className="flex-1 rounded-full bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-500/20 dark:text-rose-300"
                      >
                        Rejeter
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {totalPages > 1 && !loading && (
          <div className="mt-6 flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
            <span>{totalElements} demande(s) — page {page + 1} sur {totalPages}</span>
            <div className="flex gap-2">
              <button
                onClick={() => load(page - 1)}
                disabled={page === 0}
                className="inline-flex items-center gap-1 rounded-xl border border-slate-300 bg-white px-3 py-1.5 transition hover:bg-slate-50 disabled:opacity-50 dark:border-white/10 dark:bg-slate-800 dark:hover:bg-slate-700"
              >
                <ChevronLeft size={14} /> Précédent
              </button>
              <button
                onClick={() => load(page + 1)}
                disabled={page >= totalPages - 1}
                className="inline-flex items-center gap-1 rounded-xl border border-slate-300 bg-white px-3 py-1.5 transition hover:bg-slate-50 disabled:opacity-50 dark:border-white/10 dark:bg-slate-800 dark:hover:bg-slate-700"
              >
                Suivant <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {showDocModal && selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowDocModal(false)}>
          <div className="max-w-3xl rounded-2xl bg-white p-4 dark:bg-slate-900" onClick={(e) => e.stopPropagation()}>
            <img
              src={selectedDoc.startsWith('data:image') ? selectedDoc : `data:image/png;base64,${selectedDoc}`}
              alt="KYC Document"
              className="max-h-[80vh] w-full object-contain"
            />
            <button
              onClick={() => setShowDocModal(false)}
              className="mt-3 w-full rounded-xl bg-slate-200 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAffiliationRequests;

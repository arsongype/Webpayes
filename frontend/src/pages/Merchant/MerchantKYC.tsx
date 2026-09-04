import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileCheck2, Upload, Loader2, CheckCircle2, XCircle, ChevronLeft, AlertTriangle, IdCard, Lock, RefreshCw } from 'lucide-react';
import merchantService, { type KycStatusResponse } from '../../services/merchantService';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../components/common/Toast/useToast';

const MerchantKYC = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [status, setStatus] = useState<KycStatusResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [documentImage, setDocumentImage] = useState<string>('');
  const [fullName, setFullName] = useState(`${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim());
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [nationality, setNationality] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadStatus = useCallback(async () => {
    setLoading(true);
    try {
      const data = await merchantService.getKycStatus();
      setStatus(data);
    } catch {
      toast.addToast({ type: 'error', title: 'Erreur', message: 'Impossible de charger le statut KYC.', duration: 6000 });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadStatus();
  }, [loadStatus]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.addToast({ type: 'error', title: 'Fichier trop volumineux', message: 'Maximum 5MB.', duration: 6000 });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setDocumentImage(result.split(',')[1] ?? '');
    };
    reader.readAsDataURL(file);
  };

  const handleResetForm = () => {
    setDocumentImage('');
    setFullName(`${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim());
    setDateOfBirth('');
    setNationality('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status?.locked) {
      toast.addToast({
        type: 'error',
        title: 'Verrouillé',
        message: `Vous avez atteint le nombre maximum de tentatives. Réessayez après le ${new Date(status.lockedUntil!).toLocaleString()}.`,
        duration: 8000,
      });
      return;
    }
    if (!documentImage) {
      toast.addToast({ type: 'error', title: 'Erreur', message: 'Veuillez sélectionner un document.', duration: 6000 });
      return;
    }
    if (!fullName.trim()) {
      toast.addToast({ type: 'error', title: 'Erreur', message: 'Le nom complet est requis.', duration: 6000 });
      return;
    }
    setUploading(true);
    try {
      const result = await merchantService.verifyKycDocument({
        document_image: documentImage,
        full_name: fullName,
        date_of_birth: dateOfBirth || undefined,
        nationality: nationality || undefined,
      });
      toast.addToast({
        type: result.status === 'VERIFIED' ? 'success' : 'warning',
        title: result.status === 'VERIFIED' ? 'KYC vérifiée' : 'KYC rejetée',
        message: result.status === 'VERIFIED'
          ? `Document vérifié avec succès (confiance: ${(result.confidence_score * 100).toFixed(0)}%)`
          : result.rejection_reason || 'Échec de la vérification',
        duration: 6000,
      });
      handleResetForm();
      loadStatus();
    } catch (err) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      const data = axiosError?.response?.data;
      const message = data?.message || 'Échec de la vérification KYC.';
      toast.addToast({ type: 'error', title: 'Erreur', message, duration: 8000 });
      loadStatus();
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900 sm:px-6 lg:px-8 dark:bg-slate-950 dark:text-slate-50">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex items-center gap-3">
          <Link to="/merchant" className="rounded-full p-2 hover:bg-slate-200 dark:hover:bg-slate-800">
            <ChevronLeft size={20} />
          </Link>
          <IdCard className="h-8 w-8 text-cyan-600 dark:text-cyan-300" />
          <div>
            <h1 className="text-3xl font-semibold">Vérification d'identité (KYC)</h1>
            <p className="mt-2 text-slate-500 dark:text-slate-400">
              Soumettez votre document d'identité pour vérification automatique
            </p>
          </div>
        </div>

        {loading ? (
          <p className="text-slate-500 dark:text-slate-400">Chargement...</p>
        ) : (
          <>
            {status?.locked && (
              <div className="mb-6 rounded-3xl border border-rose-300/30 bg-rose-500/10 p-6 dark:border-rose-700/30">
                <div className="flex items-start gap-3">
                  <Lock className="h-8 w-8 flex-shrink-0 text-rose-600 dark:text-rose-300" />
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold text-rose-800 dark:text-rose-200">Vérification KYC verrouillée</h2>
                    <p className="mt-1 text-sm text-rose-700 dark:text-rose-300">
                      Vous avez atteint le nombre maximum de tentatives ({status.maxAttempts}).
                    </p>
                    <p className="mt-1 text-sm text-rose-700 dark:text-rose-300">
                      Vous pourrez réessayer le <strong>{new Date(status.lockedUntil!).toLocaleString()}</strong>.
                    </p>
                    <button
                      onClick={loadStatus}
                      className="mt-3 inline-flex items-center gap-2 rounded-xl border border-rose-300 bg-white px-3 py-1.5 text-sm font-medium text-rose-700 transition hover:bg-rose-50 dark:border-rose-700 dark:bg-slate-900 dark:text-rose-300"
                    >
                      <RefreshCw size={14} />
                      Vérifier à nouveau
                    </button>
                  </div>
                </div>
              </div>
            )}

            {!status?.locked && status && status.status !== 'NOT_STARTED' && status.remainingAttempts !== undefined && status.remainingAttempts < status.maxAttempts! && (
              <div className="mb-6 rounded-3xl border border-amber-300/30 bg-amber-500/10 p-4 text-sm text-amber-800 dark:text-amber-200">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                  <p>
                    <strong>Tentatives restantes : {status.remainingAttempts} / {status.maxAttempts}</strong>
                    {' '}— Si toutes les tentatives échouent, votre vérification KYC sera verrouillée pendant 24h.
                  </p>
                </div>
              </div>
            )}

            {status && status.status !== 'PENDING' && status.status !== 'NOT_STARTED' && (
              <div className={`mb-6 rounded-3xl border p-6 ${
                status.status === 'VERIFIED'
                  ? 'border-emerald-300/30 bg-emerald-500/10 dark:border-emerald-700/30'
                  : 'border-rose-300/30 bg-rose-500/10 dark:border-rose-700/30'
              }`}>
                <div className="flex items-center gap-3">
                  {status.status === 'VERIFIED' ? (
                    <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-300" />
                  ) : (
                    <XCircle className="h-8 w-8 text-rose-600 dark:text-rose-300" />
                  )}
                  <div>
                    <h2 className="text-lg font-semibold">
                      {status.status === 'VERIFIED' ? 'Identité vérifiée' : 'Vérification échouée'}
                    </h2>
                    <p className="text-sm">
                      Confiance : {status.confidence ? `${(status.confidence * 100).toFixed(0)}%` : 'N/A'}
                      {status.verifiedAt && ` • Vérifié le ${new Date(status.verifiedAt).toLocaleString()}`}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className={`rounded-3xl border border-slate-200 bg-white/80 p-8 shadow-xl backdrop-blur dark:border-white/10 dark:bg-slate-900/70 ${status?.locked ? 'pointer-events-none opacity-50' : ''}`}>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Nom complet
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-cyan-500 dark:border-white/10 dark:bg-slate-800/80 dark:text-slate-100"
                    placeholder="Jean Dupont"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Date de naissance
                    </label>
                    <input
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-cyan-500 dark:border-white/10 dark:bg-slate-800/80 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Nationalité
                    </label>
                    <input
                      type="text"
                      value={nationality}
                      onChange={(e) => setNationality(e.target.value)}
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-cyan-500 dark:border-white/10 dark:bg-slate-800/80 dark:text-slate-100"
                      placeholder="Française"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Document d'identité (CNI, passeport)
                  </label>
                  <div className="rounded-2xl border-2 border-dashed border-slate-300 p-6 text-center dark:border-white/20">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    {documentImage ? (
                      <div className="space-y-2">
                        <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Document chargé</p>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-sm text-cyan-600 hover:underline dark:text-cyan-300"
                        >
                          Changer de fichier
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="space-y-2"
                      >
                        <Upload className="mx-auto h-12 w-12 text-slate-400" />
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Cliquez pour télécharger</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">JPG, PNG • Max 5MB</p>
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-2 rounded-2xl border border-amber-300/30 bg-amber-500/10 p-3 text-sm text-amber-800 dark:text-amber-200">
                  <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                  <p>
                    Vos documents sont traités par notre moteur IA et ne sont pas conservés après vérification.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={uploading || !documentImage}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-500 px-4 py-3 font-semibold text-white transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Vérification en cours...
                    </>
                  ) : (
                    <>
                      <FileCheck2 size={18} />
                      Soumettre pour vérification
                    </>
                  )}
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MerchantKYC;






import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import merchantService, { type MerchantAffiliationRequestDTO } from '../../services/merchantService';

import RequiredAsterisk from '../../components/common/RequiredAsterisk/RequiredAsterisk';
import { Store, Package, ShoppingBag, TrendingUp, Wallet, QrCode, FileText, Upload, CheckCircle, Clock, XCircle } from 'lucide-react';

const MerchantRequest = () => {
  const [request, setRequest] = useState<MerchantAffiliationRequestDTO | null>(null);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [reasonTouched, setReasonTouched] = useState(false);

  const [idDocType, setIdDocType] = useState('PASSPORT');
  const [idDocNumber, setIdDocNumber] = useState('');
  const [idDocImage, setIdDocImage] = useState<string | null>(null);
  const [bizRegImage, setBizRegImage] = useState<string | null>(null);
  const [kycTouched, setKycTouched] = useState(false);

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleIdDocChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const base64 = await fileToBase64(file);
      setIdDocImage(base64);
      setKycTouched(true);
    }
  };

  const handleBizRegChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const base64 = await fileToBase64(file);
      setBizRegImage(base64);
    }
  };

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
    setReasonTouched(true);
    if (!reason.trim()) {
      setError('Veuillez expliquer pourquoi vous souhaitez devenir marchand.');
      return;
    }
    if (!idDocImage) {
      setKycTouched(true);
      setError('Veuillez télécharger une pièce d\'identité pour le KYC.');
      return;
    }
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      const created = await merchantService.submitRequest({
        reason,
        idDocumentImage: idDocImage,
        idDocumentType: idDocType,
        idDocumentNumber: idDocNumber || undefined,
        businessRegistrationImage: bizRegImage ?? undefined,
      });
      setRequest(created);
      setSuccess('Demande envoyée avec succès. Vos documents KYC seront vérifiés.');
      setReason('');
      setIdDocNumber('');
      setIdDocImage(null);
      setBizRegImage(null);
      setKycTouched(false);
      setReasonTouched(false);
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

  const statusIcon = request?.status === 'APPROVED'
    ? <CheckCircle className="h-5 w-5 text-emerald-500" />
    : request?.status === 'REJECTED'
      ? <XCircle className="h-5 w-5 text-rose-500" />
      : <Clock className="h-5 w-5 text-amber-500" />;

  const kycStatusIcon = request?.kycStatus === 'VERIFIED'
    ? <CheckCircle className="h-5 w-5 text-emerald-500" />
    : request?.kycStatus === 'REJECTED'
      ? <XCircle className="h-5 w-5 text-rose-500" />
      : <Clock className="h-5 w-5 text-amber-500" />;

  const nextSteps = [
    { icon: Store, label: 'Profil marchand', description: 'Ajoutez le nom de votre boutique et un logo.', path: '/merchant/profile' },
    { icon: Package, label: 'Catalogue produits', description: 'Créez votre catalogue de produits.', path: '/products' },
    { icon: ShoppingBag, label: 'Gestion commandes', description: 'Consultez et traitez les commandes.', path: '/orders/merchant' },
    { icon: TrendingUp, label: 'Rapports de vente', description: 'Suivez vos performances.', path: '/merchant/sales' },
    { icon: Wallet, label: 'Paiements', description: 'Configurez vos comptes de réception.', path: '/payment-methods' },
    { icon: QrCode, label: 'QR Code', description: 'Générez un QR Code de paiement.', path: '/qr' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 dark:bg-slate-950 dark:text-slate-50 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold sm:text-3xl">Devenir marchand</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Obtenez un profil marchand et commencez à encaisser sur la plateforme.
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-600 dark:text-rose-200" role="alert">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-600 dark:text-emerald-200" role="status">
            {success}
          </div>
        )}

        {request ? (
          <div className="space-y-5">
            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-slate-900 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Statut de la demande</p>
                  <p className="mt-1 flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
                    {statusIcon}
                    {request.status === 'PENDING' ? 'En attente de validation' : request.status}
                  </p>
                </div>
                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                  request.status === 'APPROVED'
                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300'
                    : request.status === 'REJECTED'
                    ? 'bg-rose-500/15 text-rose-600 dark:text-rose-300'
                    : 'bg-amber-500/15 text-amber-600 dark:text-amber-300'
                }`}>
                  {request.status}
                </span>
              </div>

              {request.reason && (
                <div className="mt-3">
                  <p className="text-sm text-slate-500 dark:text-slate-400">Motif</p>
                  <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">{request.reason}</p>
                </div>
              )}

              {request.kycStatus && (
                <div className="mt-3 flex items-center justify-between rounded-lg bg-slate-50 p-3 dark:bg-slate-800/50">
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">KYC</p>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                      {request.idDocumentType && `${request.idDocumentType} ${request.idDocumentNumber || ''}`}
                    </p>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                    request.kycStatus === 'VERIFIED'
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300'
                      : request.kycStatus === 'REJECTED'
                      ? 'bg-rose-500/15 text-rose-600 dark:text-rose-300'
                      : 'bg-amber-500/15 text-amber-600 dark:text-amber-300'
                  }`}>
                    {kycStatusIcon}
                    {request.kycStatus === 'VERIFIED' ? 'Vérifié' : request.kycStatus === 'REJECTED' ? 'Rejeté' : 'En attente'}
                  </span>
                </div>
              )}

              {request.status === 'PENDING' && (
                <div className="mt-3 rounded-lg border border-amber-400/30 bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-300">
                  Votre demande est en cours d'examen par notre équipe.
                </div>
              )}
              {request.status === 'APPROVED' && (
                <div className="mt-3 rounded-lg border border-emerald-400/30 bg-emerald-500/10 p-3 text-sm text-emerald-700 dark:text-emerald-300">
                  Votre profil marchand est actif !
                </div>
              )}
            </div>

            {request.status === 'APPROVED' && (
              <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-slate-900 sm:p-6">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Prochaines étapes</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Vous pouvez maintenant configurer votre activité marchande.
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {nextSteps.map((step) => (
                    <Link
                      key={step.path}
                      to={step.path}
                      className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm transition-colors hover:border-cyan-400 hover:bg-cyan-50 dark:border-white/10 dark:bg-slate-800 dark:hover:bg-cyan-950/50"
                    >
                      <step.icon className="mt-0.5 h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">{step.label}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{step.description}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow dark:border-white/10 dark:bg-slate-900 sm:p-6">
              <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-slate-100">Votre activité</h2>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-600 dark:text-slate-300">
                  Pourquoi souhaitez-vous devenir marchand ? <RequiredAsterisk hasError={reasonTouched && !reason.trim()} />
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  onBlur={() => setReasonTouched(true)}
                  rows={3}
                  className={`w-full rounded-xl border bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-500 dark:border-white/10 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-cyan-400 ${reasonTouched && !reason.trim() ? 'border-red-500 dark:border-red-400' : 'border-slate-300'}`}
                  placeholder="Décrivez votre activité..."
                  required
                />
                {reasonTouched && !reason.trim() && (
                  <p className="mt-1 text-sm text-red-500 dark:text-red-300">Ce champ est requis</p>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow dark:border-white/10 dark:bg-slate-900 sm:p-6">
              <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
                <FileText className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                Documents KYC
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-600 dark:text-slate-300">Type de pièce</label>
                  <select
                    value={idDocType}
                    onChange={(e) => setIdDocType(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 outline-none focus:border-cyan-500 dark:border-white/10 dark:bg-slate-800 dark:text-slate-100"
                  >
                    <option value="PASSPORT">Passeport</option>
                    <option value="ID_CARD">Carte nationale d'identité</option>
                    <option value="DRIVER_LICENSE">Permis de conduire</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-600 dark:text-slate-300">Numéro de document</label>
                  <input
                    type="text"
                    value={idDocNumber}
                    onChange={(e) => setIdDocNumber(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 outline-none focus:border-cyan-500 dark:border-white/10 dark:bg-slate-800 dark:text-slate-100"
                    placeholder="Ex: A12345678"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-600 dark:text-slate-300">
                    Pièce d'identité<RequiredAsterisk hasError={kycTouched && !idDocImage} />
                  </label>
                  <label className="flex min-h-[100px] cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-sm text-slate-600 transition-colors hover:border-cyan-500 hover:bg-cyan-50 dark:border-white/10 dark:bg-slate-800/50 dark:hover:bg-cyan-950/50 dark:text-slate-300">
                    <Upload className="h-5 w-5" />
                    <span>Cliquez pour télécharger votre pièce d'identité</span>
                    <input type="file" accept="image/*" onChange={handleIdDocChange} className="hidden" />
                  </label>
                  {kycTouched && !idDocImage && (
                    <p className="mt-1 text-sm text-red-500">Ce document est requis</p>
                  )}
                  {idDocImage && <p className="mt-1 text-sm text-emerald-600">Document téléchargé ✓</p>}
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-600 dark:text-slate-300">
                    Registre du commerce (optionnel)
                  </label>
                  <label className="flex min-h-[80px] cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-center text-sm text-slate-600 transition-colors hover:border-cyan-500 hover:bg-cyan-50 dark:border-white/10 dark:bg-slate-800/50 dark:hover:bg-cyan-950/50 dark:text-slate-300">
                    <Upload className="h-5 w-5" />
                    <span>Choisir un fichier</span>
                    <input type="file" accept="image/*" onChange={handleBizRegChange} className="hidden" />
                  </label>
                  {bizRegImage && <p className="mt-1 text-sm text-emerald-600">Document téléchargé ✓</p>}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-cyan-500 px-4 py-3.5 font-semibold text-white transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Envoi...' : 'Soumettre la demande'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default MerchantRequest;



import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { KeyRound, Copy, Check, RefreshCw, AlertCircle, Store, Plus, ChevronLeft, ChevronRight, Shield, ListChecks, Power } from 'lucide-react';
import merchantApiKeyService, { type ApiKeyListResponse, type ApiKeyResponse } from '../../services/merchantApiKeyService';
import merchantService, { type MerchantAffiliationRequestDTO, type MerchantProfileDTO } from '../../services/merchantService';
import transactionService from '../../services/transactionService';
import type { Transaction } from '../../types/transaction.types';
import { useAuth } from '../../hooks/useAuth';
import RequiredAsterisk from '../../components/common/RequiredAsterisk/RequiredAsterisk';
import { useToast } from '../../components/common/Toast/ToastContainer';

const MerchantPortal = () => {
  const { user, updateUser } = useAuth();
  const toast = useToast();
  const [apiKeys, setApiKeys] = useState<ApiKeyListResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingKeys, setLoadingKeys] = useState(false);
  const [affiliation, setAffiliation] = useState<MerchantAffiliationRequestDTO | null>(null);
  const [profile, setProfile] = useState<MerchantProfileDTO | null>(null);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyNameTouched, setNewKeyNameTouched] = useState(false);
  const [showGeneratedModal, setShowGeneratedModal] = useState(false);
  const [generatedKey, setGeneratedKey] = useState<ApiKeyResponse | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [twoFactorCodeTouched, setTwoFactorCodeTouched] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState<boolean | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingTx, setLoadingTx] = useState(false);
  const [txPage, setTxPage] = useState(0);
  const [activeSection, setActiveSection] = useState<'keys' | 'tx' | 'profile'>('keys');
  const affiliationToastShown = useRef(false);

  useEffect(() => {
    if (affiliationToastShown.current) return;
    affiliationToastShown.current = true;
    loadApiKeys();
    loadTransactions();
    load2FAStatus();
  }, []);

  const load2FAStatus = async () => {
    try {
      const status = await merchantService.get2faStatus();
      setTwoFactorEnabled(status.twoFactorEnabled);
    } catch {
      // ignore
    }
  };

  const loadApiKeys = async () => {
    setLoadingKeys(true);
    try {
      const data = await merchantApiKeyService.list();
      setApiKeys(data);

      const aff = await merchantService.getMyRequest().catch(() => null);
      setAffiliation(aff);

      const prof = await merchantService.getProfile().catch(() => null);
      setProfile(prof);
      if (prof?.shopName && updateUser) {
        updateUser({ shopName: prof.shopName });
      }

      if (!aff) {
        toast.addToast({
          type: 'warning',
          title: 'Profil manquant',
          message: 'Aucun profil marchand trouvé. Créez-en un pour accéder au portail.',
          duration: 6000,
        });
      } else if (aff.status === 'PENDING') {
        const kycText = aff.kycStatus ? ` | KYC: ${aff.kycStatus}` : '';
        toast.addToast({
          type: 'info',
          title: 'Demande en cours',
          message: `Votre demande de profil marchand est en cours de validation.${kycText}`,
          duration: 6000,
        });
      }
    } catch (err: any) {
      toast.addToast({
        type: 'error',
        title: 'Erreur',
        message: err?.response?.data?.message ?? 'Impossible de charger les clés API.',
        duration: 6000,
      });
    } finally {
      setLoadingKeys(false);
    }
  };

  const loadTransactions = async (page = 0) => {
    setLoadingTx(true);
    try {
      const data = await transactionService.list(page, 10);
      setTransactions(data);
      setTxPage(page);
    } catch {
      toast.addToast({ type: 'error', title: 'Erreur', message: 'Impossible de charger les transactions.', duration: 6000 });
    } finally {
      setLoadingTx(false);
    }
  };

  const handleGenerateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setNewKeyNameTouched(true);
    if (!newKeyName.trim()) {
      toast.addToast({ type: 'error', title: 'Erreur', message: 'Veuillez donner un nom à la clé.', duration: 6000 });
      return;
    }

    if (twoFactorEnabled) {
      setTwoFactorCodeTouched(true);
      if (!/^\d{6}$/.test(twoFactorCode)) {
        toast.addToast({ type: 'error', title: '2FA requise', message: 'Veuillez entrer votre code à 6 chiffres.', duration: 6000 });
        setShow2FAModal(true);
        return;
      }
    }

    setLoading(true);
    try {
      const data = await merchantApiKeyService.generate(newKeyName, twoFactorEnabled ? twoFactorCode : undefined);
      setGeneratedKey(data);
      setShowGeneratedModal(true);
      setNewKeyName('');
      setNewKeyNameTouched(false);
      setTwoFactorCode('');
      setShow2FAModal(false);
      toast.addToast({ type: 'success', title: 'Succès', message: 'Clé API générée avec succès.', duration: 6000 });
      loadApiKeys();
    } catch (err: any) {
      toast.addToast({
        type: 'error',
        title: 'Erreur',
        message: err?.response?.data?.message ?? err?.response?.status === 401
          ? 'Code 2FA invalide. Veuillez réessayer.'
          : 'Échec de la génération de la clé API.',
        duration: 6000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeKey = async (keyId: string) => {
    try {
      await merchantApiKeyService.revoke(keyId);
      toast.addToast({
        type: 'success',
        title: 'Clé révoquée',
        message: 'Clé API révoquée.',
        duration: 6000,
      });
      loadApiKeys();
    } catch {
      toast.addToast({
        type: 'error',
        title: 'Erreur',
        message: 'Échec de la révocation.',
        duration: 6000,
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900 sm:px-6 lg:px-8 dark:bg-slate-950 dark:text-slate-50">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex items-center gap-3">
          <Store className="h-8 w-8 text-cyan-600 dark:text-cyan-300" />
          <div>
            <h1 className="text-3xl font-semibold">Portail Marchand</h1>
            <p className="mt-2 text-slate-500 dark:text-slate-400">
              Gérez vos clés API, surveillez les transactions et configurez votre boutique.
            </p>
          </div>
        </div>
        <nav className="mb-6 flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white/80 p-2 shadow-sm dark:border-white/10 dark:bg-slate-900/70">
          <button
            type="button"
            onClick={() => setActiveSection('keys')}
            className={`inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${activeSection === 'keys' ? 'bg-cyan-500 text-white shadow' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'}`}
          >
            <KeyRound size={16} /> Clés API
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('tx')}
            className={`inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${activeSection === 'tx' ? 'bg-cyan-500 text-white shadow' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'}`}
          >
            <ListChecks size={16} /> Transactions
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('profile')}
            className={`inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${activeSection === 'profile' ? 'bg-cyan-500 text-white shadow' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'}`}
          >
            <Store size={16} /> Boutique
          </button>
        </nav>

        <div className="space-y-6">
          <div className="rounded-4xl border border-slate-200 bg-white/80 p-8 shadow-xl backdrop-blur dark:border-white/10 dark:bg-slate-900/70">
            {activeSection === 'keys' && (
              <>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Clés API</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Créez et gérez vos clés d'accès à l'API de paiement.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setNewKeyName('');
                  setNewKeyNameTouched(false);
                  setTwoFactorCode('');
                  setTwoFactorCodeTouched(false);
                  setShowGeneratedModal(false);
                  setGeneratedKey(null);
                  setShow2FAModal(twoFactorEnabled === true);
                  (document.getElementById('generateModal') as HTMLDialogElement | null)?.showModal();
                }}
                disabled={affiliation?.status === 'PENDING'}
                className="inline-flex items-center gap-2 rounded-2xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Plus size={16} />
                Générer une clé
              </button>
            </div>

            {loadingKeys ? (
              <p className="text-slate-500 dark:text-slate-400">Chargement des clés...</p>
            ) : !affiliation ? (
              <div className="rounded-xl border border-rose-400/30 bg-rose-500/10 p-4 text-sm text-rose-700 dark:text-rose-200">
                <p className="mb-2 font-medium">Aucun profil marchand trouvé.</p>
                <p className="mb-3">Veuillez d'abord créer un profil marchand pour accéder à ce portail.</p>
                <Link
                  to="/merchant/request"
                  className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2 font-semibold text-white transition hover:bg-cyan-400"
                >
                  <Plus size={16} />
                  Créer un profil marchand
                </Link>
              </div>
            ) : affiliation.status === 'PENDING' ? (
              <div className="rounded-xl border border-amber-400/30 bg-amber-500/10 p-4 text-sm text-amber-700 dark:text-amber-200">
                <p className="mb-2 font-medium">Demande en cours de validation</p>
                {affiliation.kycStatus && (
                  <p className="mb-2">Statut KYC: {affiliation.kycStatus}</p>
                )}
                <p>Votre profil marchand a été soumis et est en cours d'examen par notre équipe.</p>
                <p className="mt-2">Les clés API seront disponibles une fois votre profil approuvé par un administrateur.</p>
              </div>
            ) : affiliation.status !== 'APPROVED' ? (
              <div className="rounded-xl border border-rose-400/30 bg-rose-500/10 p-4 text-sm text-rose-700 dark:text-rose-200">
                <p className="mb-2 font-medium">Profil refusé</p>
                <p>Votre profil marchand a été rejeté.</p>
              </div>
            ) : apiKeys.length === 0 ? (
              <div className="rounded-xl border border-amber-400/30 bg-amber-500/10 p-4 text-sm text-amber-700 dark:text-amber-200">
                <p>Votre profil est approuvé mais aucune clé API n'a pas été générée.</p>
                <p className="mb-3">Cliquez sur "Générer une clé" pour créer votre première clé API.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {apiKeys.map((key) => (
                  <div
                    key={key.keyId}
                    className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-slate-800/50"
                  >
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">{key.name}</p>
                      <div className="mt-1 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                        <span className="font-mono">{key.prefix}••••••••</span>
                        <span className={key.active ? 'text-emerald-600 dark:text-emerald-300' : 'text-rose-600 dark:text-rose-300'}>
                          {key.active ? 'Active' : 'Révoquée'}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                        Créée le {new Date(key.createdAt).toLocaleDateString()}
                        {key.lastUsedAt && ` • Dernière utilisation: ${new Date(key.lastUsedAt).toLocaleDateString()}`}
                      </p>
                    </div>
                    {key.active && (
                      <button
                        type="button"
                        onClick={() => handleRevokeKey(key.keyId)}
                        className="inline-flex items-center gap-2 rounded-xl border border-rose-300 bg-white px-3 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 dark:border-rose-700 dark:bg-slate-900 dark:text-rose-300 dark:hover:bg-slate-800"
                      >
                        <Power size={14} /> Révoquer
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
              </>
            )}

            {activeSection === 'profile' && (
              <div className="space-y-3">
                <h2 className="mb-2 text-xl font-semibold text-slate-900 dark:text-white">Informations de la boutique</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  <InfoLine label="Nom de la boutique" value={profile?.shopName ?? user?.shopName ?? 'Non renseigné'} />
                  <InfoLine label="Compte" value={user?.accountNumber ?? (loadingKeys ? 'Chargement...' : 'Non attribué')} />
                  <InfoLine label="Rôle" value={user?.roles?.join(', ') ?? 'USER'} />
                  <InfoLine
                    label="Authentification 2FA"
                    value={twoFactorEnabled === null ? 'Vérification...' : twoFactorEnabled ? '✓ Activée' : '✗ Désactivée'}
                    tone={twoFactorEnabled ? 'success' : 'muted'}
                    action={twoFactorEnabled === false ? { to: '/settings/two-factor', label: 'Activer' } : undefined}
                  />
                </div>
              </div>
            )}

            {activeSection === 'tx' && affiliation?.status === 'APPROVED' && (
            <div className="rounded-4xl border border-slate-200 bg-white/80 p-8 shadow-xl backdrop-blur dark:border-white/10 dark:bg-slate-900/70">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Tableau de bord analytique</h2>
                <Link
                  to="/merchant/dashboard"
                  className="inline-flex items-center gap-2 rounded-2xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-400"
                >
                  Voir le dashboard complet
                </Link>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Consultez les statistiques détaillées de vos transactions, le taux de réussite, et les performances par canal de paiement.
              </p>
             </div>
           )}

          {affiliation?.status === 'APPROVED' && (
            <div className="rounded-4xl border border-slate-200 bg-white/80 p-8 shadow-xl backdrop-blur dark:border-white/10 dark:bg-slate-900/70">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Historique des paiements</h2>
                <button
                  onClick={() => loadTransactions(txPage)}
                  className="inline-flex items-center gap-2 rounded-2xl bg-slate-200 px-3 py-1 text-sm font-medium text-slate-700 hover:bg-slate-300 dark:bg-slate-700/50 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  <RefreshCw size={14} />
                  Actualiser
                </button>
              </div>

              {loadingTx ? (
                <p className="text-slate-500 dark:text-slate-400">Chargement...</p>
              ) : transactions.length === 0 ? (
                <p className="text-slate-500 dark:text-slate-400">Aucune transaction pour le moment.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-white/10">
                        <th className="pb-3 font-medium text-slate-500 dark:text-slate-400">Date</th>
                        <th className="pb-3 font-medium text-slate-500 dark:text-slate-400">Montant</th>
                        <th className="pb-3 font-medium text-slate-500 dark:text-slate-400">Statut</th>
                        <th className="pb-3 font-medium text-slate-500 dark:text-slate-400">Référence</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-white/10">
                      {transactions.map((tx) => {
                        const statusColors: Record<string, string> = {
                          COMPLETED: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300',
                          PENDING: 'bg-amber-500/15 text-amber-600 dark:text-amber-300',
                          FAILED: 'bg-rose-500/15 text-rose-600 dark:text-rose-300',
                          CANCELLED: 'bg-slate-500/15 text-slate-600 dark:text-slate-400',
                        };
                        return (
                          <tr key={tx.id}>
                            <td className="py-3 text-slate-900 dark:text-white">{new Date(tx.createdAt).toLocaleString()}</td>
                            <td className="py-3 font-medium text-slate-900 dark:text-white">{tx.amount} {tx.currency}</td>
                            <td className="py-3">
                              <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[tx.status] || statusColors.PENDING}`}>
                                {tx.status}
                              </span>
                            </td>
                            <td className="py-3 text-slate-500 dark:text-slate-400 font-mono">{tx.reference}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {transactions.length > 0 && (
                <div className="mt-4 flex justify-end gap-2">
                  <button
                    onClick={() => loadTransactions(0)}
                    disabled={txPage === 0}
                    className="rounded-xl border border-slate-300 bg-white px-3 py-1 text-sm dark:border-white/10 dark:bg-slate-800"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <button
                    onClick={() => loadTransactions(txPage + 1)}
                    className="rounded-xl border border-slate-300 bg-white px-3 py-1 text-sm dark:border-white/10 dark:bg-slate-800"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              )}
            </div>
            )}
          </div>
        </div>

        <dialog id="generateModal" className="rounded-3xl border border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900">
          <div className="p-6">
            <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Nouvelle clé API</h3>
            {show2FAModal && twoFactorEnabled && (
              <div className="mb-4 flex items-start gap-2 rounded-2xl border border-amber-300/30 bg-amber-500/10 p-3 text-sm text-amber-800 dark:text-amber-200">
                <Shield className="h-5 w-5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Code 2FA requis</p>
                  <p className="text-xs">Saisissez le code à 6 chiffres de votre application d'authentification.</p>
                </div>
              </div>
            )}
            <form className="space-y-4" onSubmit={handleGenerateKey}>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Nom de la clé<RequiredAsterisk hasError={newKeyNameTouched && !newKeyName.trim()} />
                </label>
                <input
                  type="text"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  onBlur={() => setNewKeyNameTouched(true)}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-cyan-500 dark:border-white/10 dark:bg-slate-800/80 dark:text-slate-100"
                  placeholder="ex: Production API Key"
                  required
                />
                {newKeyNameTouched && !newKeyName.trim() && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-300">Ce champ est requis</p>
                )}
              </div>
              {twoFactorEnabled && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Code 2FA (Google Authenticator)<RequiredAsterisk hasError={twoFactorCodeTouched && !/^\d{6}$/.test(twoFactorCode)} />
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={twoFactorCode}
                    onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    onBlur={() => setTwoFactorCodeTouched(true)}
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-center font-mono text-xl tracking-widest outline-none focus:border-cyan-500 dark:border-white/10 dark:bg-slate-800/80 dark:text-slate-100"
                    placeholder="000000"
                    maxLength={6}
                    required
                  />
                  {twoFactorCodeTouched && !/^\d{6}$/.test(twoFactorCode) && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-300">Code à 6 chiffres requis</p>
                  )}
                </div>
              )}
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setNewKeyName('');
                    setNewKeyNameTouched(false);
                    setTwoFactorCode('');
                    setShow2FAModal(false);
                    (document.getElementById('generateModal') as HTMLDialogElement | null)?.close();
                  }}
                  className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:bg-slate-800/80 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-2xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? 'Génération...' : 'Générer'}
                </button>
              </div>
            </form>
          </div>
        </dialog>

        {showGeneratedModal && generatedKey && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-xl dark:border-white/10 dark:bg-slate-900">
              <div className="mb-4 flex items-center gap-3 rounded-2xl border border-amber-400/30 bg-amber-500/10 p-3 text-amber-800 dark:text-amber-200">
                <AlertCircle size={20} />
                <p className="text-sm font-medium">
                  Conservez cette clé en lieu sûr. Vous ne pourrez plus la récupérer.
                </p>
              </div>

              <h3 className="mb-3 text-lg font-semibold text-slate-900 dark:text-white">Clé API générée</h3>

              <div className="mb-4 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-center font-mono text-sm break-all dark:border-white/10 dark:bg-slate-800/50 dark:text-slate-200">
                {generatedKey.apiKey}
              </div>

              <div className="mb-4 text-center text-sm text-slate-500 dark:text-slate-400">
                <p>Nom : <span className="font-medium text-slate-700 dark:text-slate-200">{generatedKey.name}</span></p>
                <p>Préfixe : <span className="font-mono text-slate-700 dark:text-slate-200">{generatedKey.prefix}</span></p>
              </div>

              <button
                onClick={() => copyToClipboard(generatedKey.apiKey)}
                className="mb-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:bg-slate-800/80 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                {copiedKey ? <Check size={18} /> : <Copy size={18} />}
                {copiedKey ? 'Copiée !' : 'Copier la clé'}
              </button>

              <button
                onClick={() => {
                  setShowGeneratedModal(false);
                  setGeneratedKey(null);
                  setCopiedKey(false);
                }}
                className="w-full rounded-2xl bg-cyan-500 py-3 font-semibold text-white transition hover:bg-cyan-400"
              >
                Compris
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const InfoLine = ({
  label,
  value,
  tone = 'default',
  action,
}: {
  label: string;
  value: string;
  tone?: 'default' | 'success' | 'muted';
  action?: { to: string; label: string };
}) => (
  <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-white/10 dark:bg-slate-800/40">
    <div>
      <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
      <p
        className={`text-sm font-medium ${
          tone === 'success'
            ? 'text-emerald-600 dark:text-emerald-300'
            : tone === 'muted'
            ? 'text-slate-500 dark:text-slate-400'
            : 'text-slate-900 dark:text-white'
        }`}
      >
        {value}
      </p>
    </div>
    {action && (
      <Link
        to={action.to}
        className="text-xs font-semibold text-cyan-600 hover:underline dark:text-cyan-300"
      >
        {action.label}
      </Link>
    )}
  </div>
);

export default MerchantPortal;

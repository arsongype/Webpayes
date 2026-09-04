import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  KeyRound,
  Copy,
  Check,
  RefreshCw,
  AlertCircle,
  Store,
  Plus,
  ChevronLeft,
  ChevronRight,
  Shield,
  TrendingUp,
  Activity,
  Sparkles,
  ArrowUpRight,
  Calendar,
  Search,
  X,
  Building2,
  Lock,
  Eye,
  EyeOff,
  Power,
} from 'lucide-react';
import merchantApiKeyService, {
  type ApiKeyListResponse,
  type ApiKeyResponse,
} from '../../services/merchantApiKeyService';
import merchantService, {
  type MerchantAffiliationRequestDTO,
  type MerchantProfileDTO,
} from '../../services/merchantService';
import transactionService from '../../services/transactionService';
import type { Transaction } from '../../types/transaction.types';
import { useAuth } from '../../hooks/useAuth';
import RequiredAsterisk from '../../components/common/RequiredAsterisk/RequiredAsterisk';
import { useToast } from '../../components/common/Toast/useToast';

type Section = 'keys' | 'tx' | 'profile' | 'overview';

const SECTIONS: Array<{ key: Section; label: string; icon: React.ComponentType<{ size?: number; className?: string }>; description: string }> = [
  { key: 'overview', label: 'Vue d\'ensemble', icon: Sparkles, description: 'Tableau de bord' },
  { key: 'keys', label: 'Clés API', icon: KeyRound, description: 'Authentification' },
  { key: 'tx', label: 'Transactions', icon: Activity, description: 'Historique' },
  { key: 'profile', label: 'Boutique', icon: Building2, description: 'Informations' },
];

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
  const [revealKeyId, setRevealKeyId] = useState<string | null>(null);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [twoFactorCodeTouched, setTwoFactorCodeTouched] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState<boolean | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingTx, setLoadingTx] = useState(false);
  const [txPage, setTxPage] = useState(0);
  const [activeSection, setActiveSection] = useState<Section>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const affiliationToastShown = useRef(false);
  const loadApiKeysRef = useRef<() => void>(() => {});
  const loadTransactionsRef = useRef<(p?: number) => void>(() => {});
  const load2FAStatusRef = useRef<() => void>(() => {});

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
    } catch {
      // ignore
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
      // ignore
    } finally {
      setLoadingTx(false);
    }
  };

  // eslint-disable-next-line react-hooks/refs
  loadApiKeysRef.current = loadApiKeys;
  // eslint-disable-next-line react-hooks/refs
  loadTransactionsRef.current = loadTransactions;
  // eslint-disable-next-line react-hooks/refs
  load2FAStatusRef.current = load2FAStatus;

  useEffect(() => {
    if (affiliationToastShown.current) return;
    affiliationToastShown.current = true;
    loadApiKeysRef.current();
    loadTransactionsRef.current();
    load2FAStatusRef.current();
  }, []);

  // Scroll to top when section changes (helps when the content is long)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [activeSection]);

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
    } catch (err) {
      const axiosError = err as { response?: { data?: { message?: string }; status?: number } };
      toast.addToast({
        type: 'error',
        title: 'Erreur',
        message: axiosError?.response?.data?.message ?? axiosError?.response?.status === 401
          ? 'Code 2FA invalide. Veuillez réessayer.'
          : 'Échec de la génération de la clé API.',
        duration: 6000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeKey = async (keyId: string) => {
    if (!window.confirm('Révoquer définitivement cette clé API ? Cette action est irréversible.')) {
      return;
    }
    try {
      await merchantApiKeyService.revoke(keyId);
      toast.addToast({
        type: 'success',
        title: 'Clé révoquée',
        message: 'Clé API révoquée avec succès.',
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

  // Stats calculées
  const stats = {
    totalKeys: apiKeys.length,
    activeKeys: apiKeys.filter((k) => k.active).length,
    totalTx: transactions.length,
    completedTx: transactions.filter((t) => t.status === 'COMPLETED').length,
  };

  return (
    <div className="bg-slate-100 px-4 py-6 text-slate-900 dark:bg-slate-950 dark:text-slate-50 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header moderne */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 opacity-30 blur-xl" />
              <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg">
                <Store className="h-6 w-6" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Portail Marchand</h1>
                {affiliation?.status === 'APPROVED' && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
                    <Check className="h-3 w-3" /> Vérifié
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                {profile?.shopName || user?.shopName || 'Ma boutique'} · Gestion des clés API et transactions
              </p>
            </div>
          </div>
          {affiliation?.status === 'APPROVED' && (
            <Link
              to="/merchant/dashboard"
              className="inline-flex items-center justify-center gap-2 self-start rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-500/30 transition hover:shadow-xl sm:self-auto"
            >
              <TrendingUp className="h-4 w-4" />
              Dashboard analytique
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          )}
        </div>

        {/* Layout principal */}
        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          {/* Sidebar */}
          <aside className="space-y-2 lg:sticky lg:top-6 lg:self-start">
            {SECTIONS.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.key;
              return (
                <button
                  key={section.key}
                  type="button"
                  onClick={() => setActiveSection(section.key)}
                  className={`group flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30'
                      : 'border border-slate-200 bg-white text-slate-700 hover:border-cyan-300 hover:bg-cyan-50/50 dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-200 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${
                      isActive
                        ? 'bg-white/20 backdrop-blur'
                        : 'bg-slate-100 dark:bg-slate-800/80 group-hover:bg-cyan-100 dark:group-hover:bg-cyan-900/30'
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400 group-hover:text-cyan-600 dark:group-hover:text-cyan-400'}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-semibold ${isActive ? 'text-white' : ''}`}>{section.label}</p>
                    <p className={`text-xs ${isActive ? 'text-white/80' : 'text-slate-500 dark:text-slate-400'}`}>
                      {section.description}
                    </p>
                  </div>
                </button>
              );
            })}

            {/* Sidebar footer */}
            <div className="mt-4 rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-4 dark:border-amber-500/20 dark:from-amber-500/5 dark:to-orange-500/5">
              <div className="mb-2 flex items-center gap-2">
                <Lock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <span className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-300">
                  Sécurité
                </span>
              </div>
              <p className="text-xs text-amber-700 dark:text-amber-200">
                {twoFactorEnabled
                  ? '2FA active. Vos clés sont protégées.'
                  : 'Activez la 2FA pour sécuriser vos clés API.'}
              </p>
              {twoFactorEnabled === false && (
                <Link
                  to="/settings/two-factor"
                  className="mt-2 inline-block text-xs font-semibold text-amber-700 underline hover:text-amber-900 dark:text-amber-300 dark:hover:text-amber-100"
                >
                  Activer maintenant →
                </Link>
              )}
            </div>
          </aside>

          {/* Contenu principal */}
          <main>
            {activeSection === 'overview' && (
              <OverviewSection
                stats={stats}
                apiKeys={apiKeys}
                transactions={transactions}
                loadingKeys={loadingKeys}
                loadingTx={loadingTx}
                affiliation={affiliation}
                onGenerateClick={() => {
                  setNewKeyName('');
                  setNewKeyNameTouched(false);
                  setTwoFactorCode('');
                  setTwoFactorCodeTouched(false);
                  setShowGeneratedModal(false);
                  setGeneratedKey(null);
                  setShow2FAModal(twoFactorEnabled === true);
                  (document.getElementById('generateModal') as HTMLDialogElement | null)?.showModal();
                }}
              />
            )}

            {activeSection === 'keys' && (
              <KeysSection
                apiKeys={apiKeys}
                loadingKeys={loadingKeys}
                affiliation={affiliation}
                revealKeyId={revealKeyId}
                onToggleReveal={setRevealKeyId}
                onRevoke={handleRevokeKey}
                onCopy={copyToClipboard}
                onGenerateClick={() => {
                  setNewKeyName('');
                  setNewKeyNameTouched(false);
                  setTwoFactorCode('');
                  setTwoFactorCodeTouched(false);
                  setShowGeneratedModal(false);
                  setGeneratedKey(null);
                  setShow2FAModal(twoFactorEnabled === true);
                  (document.getElementById('generateModal') as HTMLDialogElement | null)?.showModal();
                }}
              />
            )}

            {activeSection === 'tx' && (
              <TransactionsSection
                transactions={transactions}
                loadingTx={loadingTx}
                affiliation={affiliation}
                txPage={txPage}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                onRefresh={() => loadTransactions(txPage)}
                onNextPage={() => loadTransactions(txPage + 1)}
                onPrevPage={() => loadTransactions(0)}
              />
            )}

            {activeSection === 'profile' && (
              <ProfileSection
                profile={profile}
                user={user}
                loadingKeys={loadingKeys}
                twoFactorEnabled={twoFactorEnabled}
              />
            )}
          </main>
        </div>

        {/* Modal: Génération de clé */}
        <dialog
          id="generateModal"
          className="rounded-3xl border border-slate-200 bg-white p-0 backdrop:bg-black/50 dark:border-white/10 dark:bg-slate-900"
        >
          <div className="w-full max-w-md p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white">
                <KeyRound className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Nouvelle clé API</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Créez une clé pour accéder à notre API
                </p>
              </div>
            </div>

            {show2FAModal && twoFactorEnabled && (
              <div className="mb-4 flex items-start gap-3 rounded-2xl border border-amber-300/50 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
                <Shield className="h-5 w-5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Code 2FA requis</p>
                  <p className="text-xs">Saisissez le code à 6 chiffres de votre application d'authentification.</p>
                </div>
              </div>
            )}

            <form className="space-y-4" onSubmit={handleGenerateKey}>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Nom de la clé
                  <RequiredAsterisk hasError={newKeyNameTouched && !newKeyName.trim()} />
                </label>
                <input
                  type="text"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  onBlur={() => setNewKeyNameTouched(true)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 dark:border-white/10 dark:bg-slate-800 dark:text-slate-100"
                  placeholder="ex: Production API Key"
                  required
                />
                {newKeyNameTouched && !newKeyName.trim() && (
                  <p className="mt-1.5 text-xs text-rose-600 dark:text-rose-400">Ce champ est requis</p>
                )}
              </div>

              {twoFactorEnabled && (
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Code 2FA (Google Authenticator)
                    <RequiredAsterisk hasError={twoFactorCodeTouched && !/^\d{6}$/.test(twoFactorCode)} />
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={twoFactorCode}
                    onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    onBlur={() => setTwoFactorCodeTouched(true)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-center font-mono text-2xl tracking-[0.5em] outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 dark:border-white/10 dark:bg-slate-800 dark:text-slate-100"
                    placeholder="000000"
                    maxLength={6}
                    required
                  />
                  {twoFactorCodeTouched && !/^\d{6}$/.test(twoFactorCode) && (
                    <p className="mt-1.5 text-xs text-rose-600 dark:text-rose-400">Code à 6 chiffres requis</p>
                  )}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setNewKeyName('');
                    setNewKeyNameTouched(false);
                    setTwoFactorCode('');
                    setShow2FAModal(false);
                    (document.getElementById('generateModal') as HTMLDialogElement | null)?.close();
                  }}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? 'Génération...' : 'Générer la clé'}
                </button>
              </div>
            </form>
          </div>
        </dialog>

        {/* Modal: Clé générée */}
        {showGeneratedModal && generatedKey && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-white/10 dark:bg-slate-900">
              <div className="relative bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 p-6 text-white">
                <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
                <div className="relative flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Clé API générée</h3>
                    <p className="text-xs text-white/90">Conservez-la en lieu sûr</p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="mb-4 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                  <p className="text-xs">
                    Cette clé ne sera plus jamais affichée. Copiez-la maintenant et stockez-la dans un endroit
                    sécurisé.
                  </p>
                </div>

                <div className="mb-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-slate-800/50">
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Nom
                  </p>
                  <p className="mb-3 font-semibold text-slate-900 dark:text-white">{generatedKey.name}</p>
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Préfixe
                  </p>
                  <p className="mb-3 font-mono text-xs text-slate-700 dark:text-slate-300">{generatedKey.prefix}</p>
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Clé secrète
                  </p>
                  <p className="break-all rounded-lg bg-white p-2 font-mono text-xs text-slate-900 dark:bg-slate-900 dark:text-cyan-300">
                    {generatedKey.apiKey}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => copyToClipboard(generatedKey.apiKey)}
                    className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                  >
                    {copiedKey ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                    {copiedKey ? 'Copiée !' : 'Copier'}
                  </button>
                  <button
                    onClick={() => {
                      setShowGeneratedModal(false);
                      setGeneratedKey(null);
                      setCopiedKey(false);
                    }}
                    className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-3 py-2.5 text-sm font-semibold text-white shadow-md transition hover:shadow-lg"
                  >
                    Compris
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const OverviewSection = ({
  stats,
  apiKeys,
  transactions,
  loadingKeys,
  loadingTx,
  affiliation,
  onGenerateClick,
}: {
  stats: { totalKeys: number; activeKeys: number; totalTx: number; completedTx: number };
  apiKeys: ApiKeyListResponse[];
  transactions: Transaction[];
  loadingKeys: boolean;
  loadingTx: boolean;
  affiliation: MerchantAffiliationRequestDTO | null;
  onGenerateClick: () => void;
}) => {
  const recentKeys = apiKeys.slice(0, 3);
  const recentTx = transactions.slice(0, 5);

  return (
    <div className="space-y-5">
      {/* Cartes de stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Clés API"
          value={stats.totalKeys}
          subtitle={`${stats.activeKeys} actives`}
          gradient="from-cyan-500 to-blue-600"
        />
        <StatCard
          label="Transactions"
          value={stats.totalTx}
          subtitle={`${stats.completedTx} réussies`}
          gradient="from-emerald-500 to-teal-600"
        />
        <StatCard
          label="Taux de réussite"
          value={`${stats.totalTx > 0 ? Math.round((stats.completedTx / stats.totalTx) * 100) : 0}%`}
          subtitle="sur toutes les transactions"
          gradient="from-violet-500 to-purple-600"
        />
        <StatCard
          label="Statut du profil"
          value={affiliation?.status === 'APPROVED' ? 'Actif' : affiliation?.status ?? 'Aucun'}
          subtitle={affiliation?.status === 'APPROVED' ? 'Validé par un admin' : 'Configuration requise'}
          gradient="from-amber-500 to-orange-600"
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Clés récentes */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900/60">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="flex items-center gap-2 text-base font-semibold">
                <KeyRound className="h-4 w-4 text-cyan-500" />
                Clés API récentes
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Vos dernières clés d'accès</p>
            </div>
            <button
              type="button"
              onClick={onGenerateClick}
              disabled={affiliation?.status === 'PENDING'}
              className="inline-flex items-center gap-1.5 rounded-xl bg-cyan-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-cyan-400 disabled:opacity-50"
            >
              <Plus className="h-3.5 w-3.5" />
              Nouvelle
            </button>
          </div>
          {loadingKeys ? (
            <div className="flex items-center justify-center py-8 text-sm text-slate-500">
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Chargement...
            </div>
          ) : recentKeys.length === 0 ? (
            <p className="rounded-xl bg-slate-50 py-6 text-center text-sm text-slate-500 dark:bg-slate-800/50">
              Aucune clé API pour le moment
            </p>
          ) : (
            <div className="space-y-2">
              {recentKeys.map((key) => (
                <div
                  key={key.keyId}
                  className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-white/5 dark:bg-slate-800/40"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{key.name}</p>
                    <p className="font-mono text-xs text-slate-500">{key.prefix}••••••••</p>
                  </div>
                  <span
                    className={`flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${
                      key.active
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300'
                        : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {key.active ? 'Active' : 'Révoquée'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Transactions récentes */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900/60">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="flex items-center gap-2 text-base font-semibold">
                <Activity className="h-4 w-4 text-emerald-500" />
                Activité récente
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Dernières transactions</p>
            </div>
            <Link
              to="/merchant/dashboard"
              className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-600 hover:underline dark:text-cyan-400"
            >
              Voir tout
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          {loadingTx ? (
            <div className="flex items-center justify-center py-8 text-sm text-slate-500">
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Chargement...
            </div>
          ) : recentTx.length === 0 ? (
            <p className="rounded-xl bg-slate-50 py-6 text-center text-sm text-slate-500 dark:bg-slate-800/50">
              Aucune transaction pour le moment
            </p>
          ) : (
            <div className="space-y-2">
              {recentTx.map((tx) => {
                const statusColors: Record<string, string> = {
                  COMPLETED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
                  PENDING: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
                  FAILED: 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300',
                  CANCELLED: 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
                };
                return (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-white/5 dark:bg-slate-800/40"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">
                        {tx.amount} {tx.currency}
                      </p>
                      <p className="truncate font-mono text-xs text-slate-500">{tx.reference}</p>
                    </div>
                    <span
                      className={`flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${
                        statusColors[tx.status] || statusColors.PENDING
                      }`}
                    >
                      {tx.status}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({
  label,
  value,
  subtitle,
  gradient,
}: {
  label: string;
  value: string | number;
  subtitle: string;
  gradient: string;
}) => (
  <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900/60">
    <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${gradient}`} />
    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{label}</p>
    <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{value}</p>
    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
  </div>
);

const KeysSection = ({
  apiKeys,
  loadingKeys,
  affiliation,
  revealKeyId,
  onToggleReveal,
  onRevoke,
  onCopy,
  onGenerateClick,
}: {
  apiKeys: ApiKeyListResponse[];
  loadingKeys: boolean;
  affiliation: MerchantAffiliationRequestDTO | null;
  revealKeyId: string | null;
  onToggleReveal: (id: string | null) => void;
  onRevoke: (id: string) => void;
  onCopy: (text: string) => void;
  onGenerateClick: () => void;
}) => (
  <div className="space-y-5">
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-xl font-semibold">Clés API</h2>
        <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
          Créez et gérez vos clés d'accès à l'API de paiement
        </p>
      </div>
      <button
        type="button"
        onClick={onGenerateClick}
        disabled={affiliation?.status === 'PENDING'}
        className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Plus className="h-4 w-4" />
        Générer une clé
      </button>
    </div>

    {loadingKeys ? (
      <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white p-12 dark:border-white/10 dark:bg-slate-900/60">
        <RefreshCw className="mr-2 h-5 w-5 animate-spin text-cyan-500" />
        <span className="text-sm text-slate-500">Chargement des clés...</span>
      </div>
    ) : !affiliation ? (
      <AlertCard
        type="error"
        title="Aucun profil marchand trouvé"
        description="Veuillez d'abord créer un profil marchand pour accéder à ce portail."
        action={
          <Link
            to="/merchant/request"
            className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-400"
          >
            <Plus className="h-4 w-4" />
            Créer un profil marchand
          </Link>
        }
      />
    ) : affiliation.status === 'PENDING' ? (
      <AlertCard
        type="warning"
        title="Demande en cours de validation"
        description={
          affiliation.kycStatus
            ? `Statut KYC: ${affiliation.kycStatus}. Votre profil marchand a été soumis et est en cours d'examen.`
            : 'Votre profil marchand a été soumis et est en cours d\'examen par notre équipe. Les clés API seront disponibles une fois approuvé.'
        }
      />
    ) : affiliation.status !== 'APPROVED' ? (
      <AlertCard type="error" title="Profil refusé" description="Votre profil marchand a été rejeté." />
    ) : apiKeys.length === 0 ? (
      <AlertCard
        type="warning"
        title="Aucune clé API"
        description="Votre profil est approuvé mais aucune clé n'a été générée. Cliquez sur 'Générer une clé' pour commencer."
      />
    ) : (
      <div className="grid gap-3 sm:grid-cols-2">
        {apiKeys.map((key) => (
          <div
            key={key.keyId}
            className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-cyan-300 hover:shadow-md dark:border-white/10 dark:bg-slate-900/60 dark:hover:border-cyan-500/30"
          >
            <div className="absolute right-0 top-0 h-24 w-24 -translate-y-4 translate-x-4 rounded-full bg-gradient-to-br from-cyan-500/10 to-blue-500/10 blur-2xl" />
            <div className="relative">
              <div className="mb-3 flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-base font-semibold">{key.name}</h3>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    Créée le {new Date(key.createdAt).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <span
                  className={`flex-shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    key.active
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300'
                      : 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300'
                  }`}
                >
                  {key.active ? 'Active' : 'Révoquée'}
                </span>
              </div>

              <div className="mb-4 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2.5 dark:border-white/5 dark:bg-slate-800/50">
                <code className="flex-1 truncate font-mono text-xs text-slate-700 dark:text-slate-300">
                  {revealKeyId === key.keyId ? `${key.prefix}${'•'.repeat(20)}` : `${key.prefix}••••••••••••`}
                </code>
                <button
                  type="button"
                  onClick={() => onToggleReveal(revealKeyId === key.keyId ? null : key.keyId)}
                  className="rounded-md p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-slate-700"
                  aria-label={revealKeyId === key.keyId ? 'Masquer' : 'Afficher'}
                >
                  {revealKeyId === key.keyId ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={() => onCopy(`${key.prefix}••••••••`)}
                  className="rounded-md p-1 text-slate-400 hover:bg-slate-200 hover:text-cyan-600 dark:hover:bg-slate-700"
                  aria-label="Copier le préfixe"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
              </div>

              {key.lastUsedAt && (
                <p className="mb-3 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <Calendar className="h-3 w-3" />
                  Dernière utilisation: {new Date(key.lastUsedAt).toLocaleDateString('fr-FR')}
                </p>
              )}

              {key.active && (
                <button
                  type="button"
                  onClick={() => onRevoke(key.keyId)}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-rose-300 bg-white px-3 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 dark:border-rose-700/50 dark:bg-slate-900 dark:text-rose-300 dark:hover:bg-rose-500/10"
                >
                  <Power className="h-3.5 w-3.5" /> Révoquer la clé
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

const TransactionsSection = ({
  transactions,
  loadingTx,
  affiliation,
  txPage,
  searchQuery,
  setSearchQuery,
  onRefresh,
  onNextPage,
  onPrevPage,
}: {
  transactions: Transaction[];
  loadingTx: boolean;
  affiliation: MerchantAffiliationRequestDTO | null;
  txPage: number;
  searchQuery: string;
  setSearchQuery: (s: string) => void;
  onRefresh: () => void;
  onNextPage: () => void;
  onPrevPage: () => void;
}) => {
  const filtered = transactions.filter(
    (tx) =>
      tx.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.amount.toString().includes(searchQuery) ||
      tx.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Transactions</h2>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
            Historique complet de vos paiements
          </p>
        </div>
        <button
          onClick={onRefresh}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          <RefreshCw className="h-4 w-4" />
          Actualiser
        </button>
      </div>

      {affiliation?.status !== 'APPROVED' && (
        <AlertCard
          type="warning"
          title="Profil non approuvé"
          description="Vos transactions seront disponibles dès que votre profil marchand sera approuvé par un administrateur."
        />
      )}

      {/* Recherche */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Rechercher par référence, montant ou statut..."
          className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-10 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 dark:border-white/10 dark:bg-slate-800 dark:text-slate-100"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:text-slate-600"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Tableau */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-slate-900/60">
        {loadingTx ? (
          <div className="flex items-center justify-center p-12 text-sm text-slate-500">
            <RefreshCw className="mr-2 h-5 w-5 animate-spin text-cyan-500" /> Chargement...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-sm text-slate-500">
            {searchQuery ? 'Aucun résultat pour cette recherche.' : 'Aucune transaction pour le moment.'}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/50 dark:border-white/5 dark:bg-slate-800/30">
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Date
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Montant
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Statut
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Référence
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {filtered.map((tx) => {
                    const statusColors: Record<string, string> = {
                      COMPLETED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
                      PENDING: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
                      FAILED: 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300',
                      CANCELLED: 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
                    };
                    return (
                      <tr key={tx.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                        <td className="whitespace-nowrap px-4 py-3 text-slate-900 dark:text-slate-100">
                          {new Date(tx.createdAt).toLocaleString('fr-FR', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 font-semibold">
                          {tx.amount} {tx.currency}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                              statusColors[tx.status] || statusColors.PENDING
                            }`}
                          >
                            {tx.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-slate-500 dark:text-slate-400">
                          {tx.reference}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 dark:border-white/5">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Page {txPage + 1} · {filtered.length} transaction{filtered.length > 1 ? 's' : ''}
              </p>
              <div className="flex gap-1">
                <button
                  onClick={onPrevPage}
                  disabled={txPage === 0}
                  className="rounded-lg border border-slate-300 bg-white p-1.5 text-slate-700 transition hover:bg-slate-50 disabled:opacity-30 dark:border-white/10 dark:bg-slate-800 dark:text-slate-200"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={onNextPage}
                  className="rounded-lg border border-slate-300 bg-white p-1.5 text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:bg-slate-800 dark:text-slate-200"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const ProfileSection = ({
  profile,
  user,
  loadingKeys,
  twoFactorEnabled,
}: {
  profile: MerchantProfileDTO | null;
  user: ReturnType<typeof useAuth>['user'];
  loadingKeys: boolean;
  twoFactorEnabled: boolean | null;
}) => (
  <div className="space-y-5">
    <div>
      <h2 className="text-xl font-semibold">Informations de la boutique</h2>
      <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
        Détails de votre profil marchand
      </p>
    </div>

    <div className="grid gap-3 sm:grid-cols-2">
      <InfoLine
        icon={Store}
        label="Nom de la boutique"
        value={profile?.shopName ?? user?.shopName ?? 'Non renseigné'}
      />
      <InfoLine
        icon={Activity}
        label="Compte"
        value={user?.accountNumber ?? (loadingKeys ? 'Chargement...' : 'Non attribué')}
      />
      <InfoLine
        icon={Shield}
        label="Rôle"
        value={user?.roles?.join(', ') ?? 'USER'}
      />
      <InfoLine
        icon={Lock}
        label="Authentification 2FA"
        value={twoFactorEnabled === null ? 'Vérification...' : twoFactorEnabled ? 'Activée ✓' : 'Désactivée ✗'}
        tone={twoFactorEnabled ? 'success' : 'muted'}
        action={twoFactorEnabled === false ? { to: '/settings/two-factor', label: 'Activer' } : undefined}
      />
    </div>

    {profile?.description && (
      <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-slate-900/60">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Description
        </p>
        <p className="text-sm text-slate-700 dark:text-slate-200">{profile.description}</p>
      </div>
    )}
  </div>
);

const AlertCard = ({
  type,
  title,
  description,
  action,
}: {
  type: 'error' | 'warning';
  title: string;
  description: string;
  action?: React.ReactNode;
}) => {
  const styles =
    type === 'error'
      ? 'border-rose-200 bg-rose-50 dark:border-rose-500/30 dark:bg-rose-500/5'
      : 'border-amber-200 bg-amber-50 dark:border-amber-500/30 dark:bg-amber-500/5';
  const textStyles =
    type === 'error'
      ? 'text-rose-700 dark:text-rose-300'
      : 'text-amber-700 dark:text-amber-300';

  return (
    <div className={`rounded-2xl border p-5 ${styles}`}>
      <div className="flex items-start gap-3">
        <AlertCircle className={`h-5 w-5 flex-shrink-0 ${textStyles}`} />
        <div className="flex-1">
          <p className={`font-semibold ${textStyles}`}>{title}</p>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{description}</p>
          {action && <div className="mt-3">{action}</div>}
        </div>
      </div>
    </div>
  );
};

const InfoLine = ({
  icon: Icon,
  label,
  value,
  tone = 'default',
  action,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string;
  tone?: 'default' | 'success' | 'muted';
  action?: { to: string; label: string };
}) => {
  const valueColor =
    tone === 'success'
      ? 'text-emerald-600 dark:text-emerald-300'
      : tone === 'muted'
      ? 'text-slate-500 dark:text-slate-400'
      : 'text-slate-900 dark:text-white';

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-slate-900/60">
      <div className="mb-2 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800/80">
          <Icon className="h-4 w-4 text-slate-500 dark:text-slate-400" />
        </div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {label}
        </p>
      </div>
      <div className="flex items-center justify-between">
        <p className={`text-sm font-semibold ${valueColor}`}>{value}</p>
        {action && (
          <Link
            to={action.to}
            className="text-xs font-semibold text-cyan-600 hover:underline dark:text-cyan-400"
          >
            {action.label} →
          </Link>
        )}
      </div>
    </div>
  );
};

export default MerchantPortal;

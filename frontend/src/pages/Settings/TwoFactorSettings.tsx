import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, ChevronLeft, CheckCircle2, Copy, KeyRound, Loader2, AlertTriangle } from 'lucide-react';
import merchantService, { type TwoFactorSetupResponse, type TwoFactorStatusResponse } from '../../services/merchantService';
import { useToast } from '../../components/common/Toast/useToast';

const TwoFactorSettings = () => {
  const toast = useToast();
  const [status, setStatus] = useState<TwoFactorStatusResponse | null>(null);
  const [setup, setSetup] = useState<TwoFactorSetupResponse | null>(null);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [setupStep, setSetupStep] = useState<'idle' | 'qrcode' | 'verify' | 'recovery'>('idle');
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const loadStatus = useCallback(async () => {
    try {
      const data = await merchantService.get2faStatus();
      setStatus(data);
    } catch {
      toast.addToast({ type: 'error', title: 'Erreur', message: 'Impossible de charger le statut 2FA.', duration: 6000 });
    }
  }, [toast]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadStatus();
  }, [loadStatus]);

  const handleSetup = async () => {
    setLoading(true);
    try {
      const data = await merchantService.setup2fa();
      setSetup(data);
      setSetupStep('qrcode');
    } catch {
      toast.addToast({ type: 'error', title: 'Erreur', message: 'Impossible de démarrer la configuration 2FA.', duration: 6000 });
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!setup || !code || code.length !== 6) {
      toast.addToast({ type: 'error', title: 'Erreur', message: 'Veuillez entrer un code à 6 chiffres.', duration: 6000 });
      return;
    }
    setLoading(true);
    try {
      await merchantService.enable2fa(setup.secret, code);
      const codes = await merchantService.getRecoveryCodes();
      setRecoveryCodes(codes);
      setSetupStep('recovery');
      await loadStatus();
      toast.addToast({ type: 'success', title: '2FA activée', message: 'Authentification à deux facteurs activée avec succès.', duration: 6000 });
    } catch (err) {
      const axiosError = err as { response?: { data?: { message?: string } } } | null | undefined;
      toast.addToast({ type: 'error', title: 'Erreur', message: axiosError?.response?.data?.message || 'Code invalide.', duration: 6000 });
    } finally {
      setLoading(false);
    }
  };

  const copyRecoveryCodes = () => {
    navigator.clipboard.writeText(recoveryCodes.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900 sm:px-6 lg:px-8 dark:bg-slate-950 dark:text-slate-50">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 flex items-center gap-3">
          <Link to="/profile" className="rounded-full p-2 hover:bg-slate-200 dark:hover:bg-slate-800">
            <ChevronLeft size={20} />
          </Link>
          <Shield className="h-8 w-8 text-cyan-600 dark:text-cyan-300" />
          <div>
            <h1 className="text-3xl font-semibold">Authentification à deux facteurs</h1>
            <p className="mt-2 text-slate-500 dark:text-slate-400">
              Sécurisez votre compte avec un code TOTP
            </p>
          </div>
        </div>

        {setupStep === 'idle' && (
          <div className="rounded-3xl border border-slate-200 bg-white/80 p-8 shadow-xl backdrop-blur dark:border-white/10 dark:bg-slate-900/70">
            <div className="mb-6 flex items-center gap-4">
              {status?.twoFactorEnabled ? (
                <CheckCircle2 className="h-12 w-12 text-emerald-500" />
              ) : (
                <Shield className="h-12 w-12 text-slate-400" />
              )}
              <div>
                <h2 className="text-xl font-semibold">
                  {status?.twoFactorEnabled ? '2FA activée' : '2FA désactivée'}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {status?.twoFactorEnabled
                    ? 'Votre compte est protégé par l\'authentification à deux facteurs.'
                    : 'Activez la 2FA pour ajouter une couche de sécurité supplémentaire.'}
                </p>
              </div>
            </div>

            {!status?.twoFactorEnabled && (
              <button
                onClick={handleSetup}
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-500 px-4 py-3 font-semibold text-white transition hover:bg-cyan-400 disabled:opacity-50"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Shield size={18} />}
                {loading ? 'Chargement...' : 'Activer la 2FA'}
              </button>
            )}
          </div>
        )}

        {setupStep === 'qrcode' && setup && (
          <div className="rounded-3xl border border-slate-200 bg-white/80 p-8 shadow-xl backdrop-blur dark:border-white/10 dark:bg-slate-900/70">
            <h2 className="mb-2 text-xl font-semibold">Étape 1 : Scanner le QR Code</h2>
            <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
              Scannez ce QR code avec Google Authenticator, Authy, ou une application TOTP compatible.
            </p>

            <div className="mb-6 flex justify-center rounded-2xl border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-slate-800">
              <p className="text-center text-sm text-slate-700 dark:text-slate-200">
                Scannez ce QR code avec Google Authenticator, Authy, ou une application TOTP compatible :<br />
                <code className="mt-2 inline-block break-all rounded bg-slate-100 p-2 text-xs dark:bg-slate-900">
                  {setup.qrCodeUrl}
                </code>
              </p>
            </div>

            <details className="mb-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm dark:border-white/10 dark:bg-slate-800/50">
              <summary className="cursor-pointer font-medium text-slate-700 dark:text-slate-200">
                Saisir le code manuellement
              </summary>
              <div className="mt-2 break-all rounded-xl bg-white p-3 font-mono text-xs dark:bg-slate-900">
                {setup.secret}
              </div>
            </details>

            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">Étape 2 : Entrer le code à 6 chiffres</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-center font-mono text-2xl tracking-widest outline-none focus:border-cyan-500 dark:border-white/10 dark:bg-slate-800/80 dark:text-slate-100"
                  placeholder="000000"
                  maxLength={6}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading || code.length !== 6}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-500 px-4 py-3 font-semibold text-white transition hover:bg-cyan-400 disabled:opacity-50"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <KeyRound size={18} />}
                {loading ? 'Vérification...' : 'Vérifier et activer'}
              </button>
            </form>
          </div>
        )}

        {setupStep === 'recovery' && (
          <div className="rounded-3xl border border-slate-200 bg-white/80 p-8 shadow-xl backdrop-blur dark:border-white/10 dark:bg-slate-900/70">
            <h2 className="mb-2 text-xl font-semibold text-emerald-600 dark:text-emerald-300">
              ✓ 2FA activée avec succès
            </h2>
            <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
              Conservez ces codes de récupération en lieu sûr. Ils vous permettront de vous connecter si vous perdez l'accès à votre application TOTP.
            </p>

            <div className="mb-4 grid grid-cols-2 gap-2 rounded-2xl border border-amber-300/30 bg-amber-500/10 p-4 font-mono text-sm sm:grid-cols-4">
              {recoveryCodes.map((c, i) => (
                <div key={i} className="rounded-lg bg-white p-2 text-center font-bold dark:bg-slate-800">
                  {c}
                </div>
              ))}
            </div>

            <div className="mb-4 flex items-start gap-2 rounded-2xl border border-rose-300/30 bg-rose-500/10 p-3 text-sm text-rose-800 dark:text-rose-200">
              <AlertTriangle className="h-5 w-5 flex-shrink-0" />
              <p>Ces codes ne seront plus affichés. Copiez-les maintenant.</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={copyRecoveryCodes}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:bg-slate-800/80 dark:text-slate-200"
              >
                {copied ? <CheckCircle2 size={18} /> : <Copy size={18} />}
                {copied ? 'Copié !' : 'Copier les codes'}
              </button>
              <Link
                to="/profile"
                className="flex-1 rounded-2xl bg-cyan-500 py-3 text-center font-semibold text-white transition hover:bg-cyan-400"
              >
                Terminé
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TwoFactorSettings;






import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import twoFactorService, { type TwoFactorSetupResponse } from '../../services/twoFactorService';
import { useAuth } from '../../hooks/useAuth';
import RequiredAsterisk from '../../components/common/RequiredAsterisk/RequiredAsterisk';
import { ShieldCheck, KeyRound, Camera, Copy, Check, RefreshCw } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';

const TwoFactorSetup = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [setup, setSetup] = useState<TwoFactorSetupResponse | null>(null);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [codeTouched, setCodeTouched] = useState(false);
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [showRecoveryCodes, setShowRecoveryCodes] = useState(false);
  const [copied, setCopied] = useState(false);
  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await twoFactorService.status();
        if (data.twoFactorEnabled) {
          navigate('/profile');
        }
      } catch {
        // ignore
      }
    };
    load();
  }, [navigate]);

  const handleSetup = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const data = await twoFactorService.setup();
      setSetup(data);
    } catch (err) {
      const axiosError = err as { response?: { data?: { message?: string } }; message?: string };
      console.error('2FA setup error:', axiosError?.response?.data ?? err);
      const msg = axiosError?.response?.data?.message ?? axiosError?.message ?? 'Impossible de générer la configuration 2FA.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleEnable = async (e: React.FormEvent) => {
    e.preventDefault();
    setCodeTouched(true);
    if (!code.trim()) {
      setError('Veuillez saisir le code de vérification.');
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      if (!setup?.secret) throw new Error('Secret manquant');
      await twoFactorService.enable(setup.secret, parseInt(code, 10));
      const recovery = await twoFactorService.recoveryCodes();
      setRecoveryCodes(recovery.recoveryCodes);
      setShowRecoveryCodes(true);
      setSuccess('Authentification à deux facteurs activée avec succès.');
      setCode('');
      setCodeTouched(false);
    } catch {
      setError('Code incorrect. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const handleScanSuccess = async (decodedText: string) => {
    setScanning(false);
    try {
      const url = new URL(decodedText);
      const secret = url.searchParams.get('secret');
      if (secret) {
        setSetup(prev => prev ? { ...prev, secret } : null);
      }
    } catch {
      setError('QR Code invalide. Veuillez saisir le secret manuellement.');
    }
  };

  const startScanner = () => {
    setScanning(true);
    setTimeout(() => {
      if (scannerRef.current) {
        scannerRef.current.clear();
      }
      scannerRef.current = new Html5QrcodeScanner('qr-reader', {
        qrbox: { width: 250, height: 250 },
        fps: 5,
      });
      scannerRef.current.render(handleScanSuccess, (errorMessage) => {
        console.warn('QR scan error:', errorMessage);
      });
    }, 100);
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      try {
        scannerRef.current.clear();
      } catch {
        // ignore
      }
      scannerRef.current = null;
    }
    setScanning(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenerateRecoveryCodes = async () => {
    setLoading(true);
    setError(null);
    try {
      const recovery = await twoFactorService.regenerateRecoveryCodes();
      setRecoveryCodes(recovery.recoveryCodes);
      setSuccess('Codes de secours régénérés.');
    } catch {
      setError('Échec de la régénération des codes de secours.');
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = () => {
    navigate('/profile');
  };

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900 dark:bg-slate-950 dark:text-slate-50 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        <div className="rounded-4xl border border-slate-200 bg-white/80 p-8 shadow-xl backdrop-blur dark:border-white/10 dark:bg-slate-900/70">
          <div className="mb-6 flex items-center gap-3">
            <ShieldCheck className="h-8 w-8 text-cyan-600 dark:text-cyan-300" />
            <div>
              <h1 className="text-3xl font-semibold">Authentification à deux facteurs</h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Sécurisez votre compte avec un code de vérification.
              </p>
            </div>
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

          {!setup ? (
            <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-6 dark:border-white/10 dark:bg-slate-800/50">
              <p className="text-sm text-slate-600 dark:text-slate-300">
                L’authentification à deux facteurs ajoute une couche de sécurité supplémentaire à votre compte. Vous devrez saisir un code généré par votre application d’authentification mobile à chaque connexion.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={handleSetup}
                  disabled={loading}
                  className="flex-1 rounded-2xl bg-cyan-500 px-4 py-3 font-semibold text-white transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? 'Génération...' : 'Générer la configuration'}
                </button>
                <button
                  type="button"
                  onClick={startScanner}
                  disabled={loading || scanning}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:bg-slate-800/80 dark:text-slate-200 dark:hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Camera size={18} aria-hidden="true" />
                  Scanner un QR Code
                </button>
              </div>
              {scanning && (
                <div className="mt-6">
                  <div id="qr-reader" className="rounded-2xl overflow-hidden" />
                  <button
                    type="button"
                    onClick={stopScanner}
                    className="mt-4 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:bg-slate-800/80 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    Arrêter le scan
                  </button>
                </div>
              )}
            </div>
          ) : showRecoveryCodes ? (
            <div className="mt-6 space-y-6">
              <div className="rounded-3xl border border-emerald-400/30 bg-emerald-500/10 p-4 text-sm text-emerald-700 dark:text-emerald-200">
                L’authentification à deux facteurs est activée. Conservez ces codes de secours en lieu sûr. Vous pouvez les utiliser pour vous connecter si vous perdez votre téléphone.
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 dark:border-white/10 dark:bg-slate-800/50">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-slate-900 dark:text-white">Codes de secours</h3>
                  <button
                    type="button"
                    onClick={handleRegenerateRecoveryCodes}
                    disabled={loading}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:bg-slate-800/80 dark:text-slate-200 dark:hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <RefreshCw size={14} aria-hidden="true" />
                    Régénérer
                  </button>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
                  {recoveryCodes.map((recoveryCode, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-xl border border-slate-300 bg-white px-3 py-2 font-mono text-sm dark:border-white/10 dark:bg-slate-900 dark:text-slate-100"
                    >
                      <span>{recoveryCode}</span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(recoveryCode)}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                        title="Copier"
                      >
                        {copied ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <button
                type="button"
                onClick={handleFinish}
                className="w-full rounded-2xl bg-cyan-500 px-4 py-3 font-semibold text-white transition hover:bg-cyan-400"
              >
                Terminer
              </button>
            </div>
          ) : (
            <form className="mt-6 space-y-6" onSubmit={handleEnable}>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 dark:border-white/10 dark:bg-slate-800/50">
               <div className="flex flex-col items-center gap-4">
                   <p className="text-sm text-slate-600 dark:text-slate-300">
                      Scannez ce QR code TOTP avec votre application d'authentification (Google Authenticator, Authy, etc.) ou saisissez la clé secrète manuellement.
                   </p>
                   {setup.qrDataUrl ? (
                     <div className="rounded-2xl border border-slate-200 bg-white p-2 dark:border-white/10 dark:bg-slate-900">
                       <img
                         src={setup.qrDataUrl}
                         alt="QR Code TOTP pour l'authentification à deux facteurs"
                         className="h-56 w-56 object-contain"
                       />
                     </div>
                   ) : (
                     <div className="flex h-56 w-56 items-center justify-center rounded-2xl border border-slate-200 bg-slate-100 text-xs text-slate-400">
                       Génération du QR Code...
                     </div>
                   )}
                   <div className="flex w-full items-center justify-between rounded-2xl border border-slate-300 bg-white px-4 py-3 font-mono text-sm dark:border-white/10 dark:bg-slate-900">
                     <span className="break-all text-slate-900 dark:text-slate-100">{setup.secret}</span>
                     <button
                       type="button"
                       onClick={() => copyToClipboard(setup.secret)}
                       className="ml-2 shrink-0 text-cyan-600 hover:text-cyan-700 dark:text-cyan-300"
                       aria-label="Copier la clé secrète"
                       title="Copier la clé secrète"
                     >
                       {copied ? <Check size={16} /> : <Copy size={16} />}
                     </button>
                   </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Issuer : <span className="font-semibold">WebPaysh</span> | Compte : <span className="font-semibold">{user?.email}</span>
                    </p>
                  </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Code de vérification<RequiredAsterisk hasError={codeTouched && !code.trim()} />
                </label>
                <div className="flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-3 dark:border-white/10 dark:bg-slate-800/80">
                  <KeyRound size={18} className="text-slate-400" aria-hidden="true" />
                  <input
                    type="text"
                    inputMode="numeric"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    onBlur={() => setCodeTouched(true)}
                    className="w-full bg-transparent text-slate-900 outline-none dark:text-slate-100"
                    placeholder="123456"
                    required
                  />
                </div>
                {codeTouched && !code.trim() && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-300">Ce champ est requis</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-cyan-500 px-4 py-3 font-semibold text-white transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Activation...' : 'Activer la 2FA'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default TwoFactorSetup;


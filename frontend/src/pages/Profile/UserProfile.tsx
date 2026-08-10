import { useRef, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Mail, Camera, Trash2, ShieldCheck, Lightbulb, Route } from 'lucide-react';
import userService from '../../services/userService';
import aiService from '../../services/aiService';
import type { RecommendationResponse } from '../../types/recommendation.types';
import type { RoutingResponse } from '../../types/routing.types';
import Modal from '../../components/common/Modal/Modal';

const resizeImage = (file: File, maxSize = 256): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas indisponible'));
          return;
        }
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.onerror = () => reject(new Error('Image invalide'));
      img.src = reader.result as string;
    };
    reader.onerror = () => reject(new Error('Lecture impossible'));
    reader.readAsDataURL(file);
  });
};

const UserProfile = () => {
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [email, setEmail] = useState(user?.email ?? '');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [recommendations, setRecommendations] = useState<RecommendationResponse | null>(null);
  const [routing, setRouting] = useState<RoutingResponse | null>(null);
  const [loadingRec, setLoadingRec] = useState(false);
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [showKycModal, setShowKycModal] = useState(false);

  const handlePhotoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await resizeImage(file);
      updateUser({ avatar: dataUrl });
      setMessage({ type: 'success', text: 'Photo de profil mise à jour.' });
    } catch {
      setMessage({ type: 'error', text: 'Impossible de charger cette image.' });
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = () => {
    updateUser({ avatar: undefined });
    setMessage({ type: 'success', text: 'Photo de profil supprimée.' });
  };

  const handleSaveEmail = async () => {
    const next = email.trim();
    if (!next || next === user?.email) {
      setMessage({ type: 'error', text: 'Saisissez une adresse email différente de la actuelle.' });
      return;
    }
    setSaving(true);
    updateUser({ email: next });
    try {
      if (user?.sub != null) {
        await userService.update(String(user.sub), { email: next });
      }
      setMessage({ type: 'success', text: 'Email mis à jour avec succès.' });
    } catch {
      setMessage({
        type: 'error',
        text: 'Email mis à jour localement, mais la synchronisation avec le serveur a échoué.',
      });
    } finally {
      setSaving(false);
    }
  };

  const loadRecommendations = async () => {
    setLoadingRec(true);
    try {
      const result = await aiService.getRecommendations({ user_id: user?.sub ?? 'current', current_balance: 1000 });
      setRecommendations(result);
    } catch {
      setMessage({ type: 'error', text: 'Impossible de charger les recommandations.' });
    } finally {
      setLoadingRec(false);
    }
  };

  const loadRouting = async () => {
    setLoadingRoute(true);
    try {
      const result = await aiService.getBestPaymentChannel({ amount: 100, currency: 'EUR', sender_country: 'FR', receiver_country: 'SN' });
      setRouting(result);
    } catch {
      setMessage({ type: 'error', text: 'Impossible de charger le routage.' });
    } finally {
      setLoadingRoute(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900 sm:px-6 lg:px-8 dark:bg-slate-950 dark:text-slate-50">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Profil</h1>
            <p className="mt-2 text-slate-500 dark:text-slate-400">Gérez votre photo, votre email et vos préférences</p>
          </div>
        </div>

        {message && (
          <div
            className={`mb-6 rounded-2xl border px-4 py-3 text-sm ${
              message.type === 'success'
                ? 'border-emerald-400/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-200'
                : 'border-rose-400/30 bg-rose-500/10 text-rose-600 dark:text-rose-200'
            }`}
            role="alert"
            aria-live="assertive"
          >
            {message.text}
          </div>
        )}

        <div className="rounded-4xl border border-slate-200 bg-white/80 p-8 shadow-xl backdrop-blur dark:border-white/10 dark:bg-slate-900/70">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt="Profil"
                className="h-20 w-20 rounded-full object-cover border border-slate-200 dark:border-slate-700"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-cyan-500/20 text-3xl font-bold text-cyan-700 dark:text-cyan-200" aria-label="Initiales utilisateur">
                {user?.firstName?.[0]?.toUpperCase() ?? 'U'}
              </div>
            )}

            <div>
              <p className="text-lg font-semibold text-slate-900 dark:text-white">
                {user?.firstName} {user?.lastName}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-cyan-400"
                >
                  <Camera size={16} aria-hidden="true" />
                  Changer la photo
                </button>
                {user?.avatar && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 dark:border-white/10 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    <Trash2 size={16} aria-hidden="true" />
                    Supprimer
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoChange}
                  aria-label="Télécharger une photo de profil"
                />
              </div>
            </div>
          </div>

          <div className="mt-8">
            <label className="mb-2 block text-sm font-medium text-slate-600 dark:text-slate-300" htmlFor="email">
              Email
            </label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="flex flex-1 items-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-3 dark:border-white/10 dark:bg-slate-800/80">
                <Mail size={18} className="text-slate-400" aria-hidden="true" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent text-slate-900 outline-none dark:text-slate-100"
                  placeholder="vous@exemple.com"
                  aria-describedby="email-help"
                />
              </div>
              <button
                type="button"
                onClick={handleSaveEmail}
                disabled={saving}
                className="rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-400 disabled:opacity-60"
              >
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
            <p id="email-help" className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Nous ne partageons jamais votre email avec des tiers.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <button
              type="button"
              onClick={loadRecommendations}
              disabled={loadingRec}
              className="flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:bg-slate-800/80 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <Lightbulb size={18} aria-hidden="true" />
              {loadingRec ? 'Analyse...' : 'Recommandations'}
            </button>
            <button
              type="button"
              onClick={loadRouting}
              disabled={loadingRoute}
              className="flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:bg-slate-800/80 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <Route size={18} aria-hidden="true" />
              {loadingRoute ? 'Calcul...' : 'Routage optimal'}
            </button>
          </div>

          {recommendations && (
            <div className="mt-6 rounded-2xl border border-cyan-400/30 bg-cyan-500/10 p-4">
              <h3 className="font-semibold text-cyan-700 dark:text-cyan-300">Recommandations</h3>
              <p className="mt-2 text-sm text-cyan-800 dark:text-cyan-200">{recommendations.savings_tip}</p>
              {recommendations.spending_alert && (
                <p className="mt-2 text-sm text-amber-700 dark:text-amber-300">{recommendations.spending_alert}</p>
              )}
            </div>
          )}

          {routing && (
            <div className="mt-4 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4">
              <h3 className="font-semibold text-emerald-700 dark:text-emerald-300">Canal recommandé</h3>
              <p className="mt-1 text-sm text-emerald-800 dark:text-emerald-200">{routing.reason}</p>
              <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">
                Frais estimés: {routing.estimated_fee.toFixed(2)}€ | Délai: {routing.estimated_arrival_seconds}s
              </p>
            </div>
          )}

          <button
            onClick={() => setShowKycModal(true)}
            className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:bg-slate-800/80 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <ShieldCheck size={18} aria-hidden="true" />
            Vérification KYC
          </button>

          
        </div>
      </div>

      <Modal isOpen={showKycModal} onClose={() => setShowKycModal(false)} title="Vérification KYC">
        <p className="text-sm text-slate-300">
          La vérification KYC permet de sécuriser votre compte. Veuillez vous rendre sur la page dédiée.
        </p>
        <a
          href="/kyc"
          className="mt-4 block w-full rounded-2xl bg-cyan-500 py-3 text-center text-sm font-semibold text-white transition hover:bg-cyan-400"
        >
          Accéder à la vérification KYC
        </a>
      </Modal>
    </div>
  );
};

export default UserProfile;

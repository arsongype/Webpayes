import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  Mail, Camera, Trash2, ShieldCheck, Lightbulb, Route, User, Lock, Smartphone,
  Phone, Calendar, Globe, IdCard, Wallet, TrendingUp, Activity, Bell, MapPin,
  KeyRound, Eye, EyeOff, Check, Copy, Clock, Languages, ChevronRight,
  AlertTriangle, Settings, LogIn, FileText, Download, RefreshCw, X, ArrowUpRight
} from 'lucide-react';
import userService from '../../services/userService';
import aiService from '../../services/aiService';
import twoFactorService from '../../services/twoFactorService';
import type { RecommendationResponse } from '../../types/recommendation.types';
import type { RoutingResponse } from '../../types/routing.types';
import type { ProfileResponse, LoginHistoryEntry } from '../../types/user.types';
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

type TabKey = 'personal' | 'security' | 'account' | 'preferences' | 'activity';

const LANGUAGES = [
  { code: 'fr', label: 'Français' },
  { code: 'en', label: 'English' },
  { code: 'mg', label: 'Malagasy' },
];

const TIMEZONES = [
  'Indian/Antananarivo',
  'Africa/Nairobi',
  'Africa/Dakar',
  'Africa/Casablanca',
  'Europe/Paris',
  'Europe/London',
  'Indian/Mauritius',
  'Indian/Reunion',
  'America/New_York',
  'America/Los_Angeles',
  'Asia/Dubai',
  'Asia/Singapore',
];

const TABS: { key: TabKey; label: string; icon: React.ComponentType<{ size?: number }> }[] = [
  { key: 'personal', label: 'Informations', icon: User },
  { key: 'security', label: 'Sécurité', icon: ShieldCheck },
  { key: 'account', label: 'Compte', icon: Wallet },
  { key: 'preferences', label: 'Préférences', icon: Settings },
  { key: 'activity', label: 'Activité', icon: Activity },
];

const UserProfile = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('personal');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [recommendations, setRecommendations] = useState<RecommendationResponse | null>(null);
  const [routing, setRouting] = useState<RoutingResponse | null>(null);
  const [loadingRec, setLoadingRec] = useState(false);
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [showKycModal, setShowKycModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState<boolean | null>(null);
  const [showTwoFactorDisableModal, setShowTwoFactorDisableModal] = useState(false);
  const [showRecoveryCodesModal, setShowRecoveryCodesModal] = useState(false);
  const [twoFactorDisableCode, setTwoFactorDisableCode] = useState('');
  const [twoFactorDisableCodeTouched, setTwoFactorDisableCodeTouched] = useState(false);
  const [twoFactorDisableMode, setTwoFactorDisableMode] = useState<'code' | 'recovery'>('code');
  const [profileRecoveryCodes, setProfileRecoveryCodes] = useState<string[]>([]);
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [loginHistory, setLoginHistory] = useState<LoginHistoryEntry[]>([]);
  const [showAccountNumber, setShowAccountNumber] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName, setLastName] = useState(user?.lastName ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [cin, setCin] = useState('');
  const [nationality, setNationality] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [language, setLanguage] = useState('fr');
  const [timezone, setTimezone] = useState('Africa/Nairobi');
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifySms, setNotifySms] = useState(false);
  const [notifyPush, setNotifyPush] = useState(true);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const messageTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showMessage = (msg: { type: 'success' | 'error'; text: string }) => {
    setMessage(msg);
    if (messageTimeoutRef.current) {
      clearTimeout(messageTimeoutRef.current);
    }
    messageTimeoutRef.current = setTimeout(() => {
      setMessage(null);
      messageTimeoutRef.current = null;
    }, 4000);
  };

  useEffect(() => {
    return () => {
      if (messageTimeoutRef.current) {
        clearTimeout(messageTimeoutRef.current);
      }
    };
  }, []);

  const copy = (value: string, field: string) => {
    navigator.clipboard.writeText(value);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFirstName(user?.firstName ?? '');
    setLastName(user?.lastName ?? '');
    setEmail(user?.email ?? '');
  }, [user?.firstName, user?.lastName, user?.email]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const data = await userService.getMyProfile();
        if (cancelled) return;
        if (!data || !data.user) {
          return;
        }
        setProfile(data);
        if (data.user.phoneNumber) setPhoneNumber(data.user.phoneNumber);
        if (data.user.cin) setCin(data.user.cin);
        if (data.user.nationality) setNationality(data.user.nationality);
        if (data.user.dateOfBirth) setDateOfBirth(data.user.dateOfBirth.substring(0, 10));
        if (data.user.preferredLanguage) setLanguage(data.user.preferredLanguage);
        if (data.user.timezone) setTimezone(data.user.timezone);
        if (data.user.notificationEmail !== undefined) setNotifyEmail(data.user.notificationEmail);
        if (data.user.notificationSms !== undefined) setNotifySms(data.user.notificationSms);
        if (data.user.notificationPush !== undefined) setNotifyPush(data.user.notificationPush);
        if (data.user.twoFactorEnabled !== undefined && data.user.twoFactorEnabled !== null) {
          setTwoFactorEnabled(data.user.twoFactorEnabled);
        }
      } catch {
        // Silently fail - token may be invalid, interceptor will handle redirect
      }

      try {
        const history = await userService.getLoginHistory();
        if (!cancelled) setLoginHistory(history);
      } catch {
        if (!cancelled) setLoginHistory([]);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const timeout = setTimeout(() => {
      if (!cancelled && twoFactorEnabled === null) {
        setTwoFactorEnabled(false);
      }
    }, 5000);

    const load = async () => {
      try {
        const data = await twoFactorService.status();
        if (!cancelled && twoFactorEnabled === null) {
          setTwoFactorEnabled(data.twoFactorEnabled === true);
        }
      } catch {
        if (!cancelled && twoFactorEnabled === null) {
          setTwoFactorEnabled(false);
        }
      } finally {
        clearTimeout(timeout);
      }
    };
    load();
    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [twoFactorEnabled]);

  const handlePhotoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await resizeImage(file);
      updateUser({ avatar: dataUrl });
      try {
        const updated = await userService.updateAvatar(dataUrl);
        setProfile((prev) => prev ? { ...prev, user: updated } : prev);
      } catch {
        // Local optimistic update still applied
      }
      showMessage({ type: 'success', text: 'Photo de profil mise à jour.' });
    } catch {
      showMessage({ type: 'error', text: 'Impossible de charger cette image.' });
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = async () => {
    updateUser({ avatar: undefined });
    try {
      const updated = await userService.updateAvatar(null);
      setProfile((prev) => prev ? { ...prev, user: updated } : prev);
    } catch {
      // ignore
    }
    showMessage({ type: 'success', text: 'Photo de profil supprimée.' });
  };

  const handleSaveProfile = async () => {
    setMessage(null);
    setSaving(true);
    try {
      const updated = await userService.updateMe({
        firstName: firstName !== user?.firstName ? firstName : undefined,
        lastName: lastName !== user?.lastName ? lastName : undefined,
        email: email !== user?.email ? email : undefined,
        phoneNumber: phoneNumber,
        cin: cin,
        nationality: nationality,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth).toISOString() : undefined,
      });
      updateUser({
        firstName: updated.firstName,
        lastName: updated.lastName,
        email: updated.email,
      });
      setProfile((prev) => prev ? { ...prev, user: updated } : prev);
      showMessage({ type: 'success', text: 'Profil mis à jour avec succès.' });
    } catch {
      showMessage({ type: 'error', text: 'Échec de la mise à jour du profil.' });
    } finally {
      setSaving(false);
    }
  };

  const handleSavePreferences = async () => {
    setSaving(true);
    setMessage(null);
    try {
      await userService.updatePreferences({ language, timezone });
      await userService.updateNotifications({
        email: notifyEmail,
        sms: notifySms,
        push: notifyPush,
      });
      showMessage({ type: 'success', text: 'Préférences enregistrées.' });
    } catch {
      showMessage({ type: 'error', text: "Échec de l'enregistrement des préférences." });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    setMessage(null);
    if (!currentPassword || !newPassword || !confirmPassword) {
      showMessage({ type: 'error', text: 'Veuillez remplir tous les champs.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      showMessage({ type: 'error', text: 'Les nouveaux mots de passe ne correspondent pas.' });
      return;
    }
    if (newPassword.length < 8) {
      showMessage({ type: 'error', text: 'Le mot de passe doit contenir au moins 8 caractères.' });
      return;
    }
    if (newPassword === currentPassword) {
      showMessage({ type: 'error', text: "Le nouveau mot de passe doit être différent de l'ancien." });
      return;
    }
    setSaving(true);
    try {
      await userService.updateMe({ password: newPassword });
      showMessage({ type: 'success', text: 'Mot de passe modifié avec succès.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordModal(false);
    } catch {
      showMessage({ type: 'error', text: 'Échec du changement de mot de passe.' });
    } finally {
      setSaving(false);
    }
  };

  const passwordStrength = (() => {
    let score = 0;
    if (newPassword.length >= 8) score++;
    if (/[A-Z]/.test(newPassword)) score++;
    if (/[0-9]/.test(newPassword)) score++;
    if (/[^A-Za-z0-9]/.test(newPassword)) score++;
    if (newPassword.length >= 12) score++;
    return score;
  })();

  const passwordStrengthLabel = ['Très faible', 'Faible', 'Moyen', 'Bon', 'Très bon', 'Excellent'][passwordStrength];
  const passwordStrengthColor = ['bg-rose-500', 'bg-rose-500', 'bg-amber-500', 'bg-amber-400', 'bg-emerald-400', 'bg-emerald-500'][passwordStrength];

  const handleDisableTwoFactor = async (e: React.FormEvent) => {
    e.preventDefault();
    setTwoFactorDisableCodeTouched(true);
    if (!twoFactorDisableCode.trim()) {
      showMessage({ type: 'error', text: 'Veuillez saisir le code de vérification ou un code de secours.' });
      return;
    }
    setSaving(true);
    try {
      if (twoFactorDisableMode === 'code') {
        await twoFactorService.disable(parseInt(twoFactorDisableCode, 10), undefined);
      } else {
        await twoFactorService.disable(undefined, twoFactorDisableCode);
      }
      setTwoFactorEnabled(false);
      showMessage({ type: 'success', text: 'Authentification à deux facteurs désactivée.' });
      setShowTwoFactorDisableModal(false);
      setTwoFactorDisableCode('');
      setTwoFactorDisableCodeTouched(false);
    } catch {
      showMessage({ type: 'error', text: 'Code incorrect.' });
    } finally {
      setSaving(false);
    }
  };

  const handleShowRecoveryCodes = async () => {
    try {
      const data = await twoFactorService.recoveryCodes();
      setProfileRecoveryCodes(data.recoveryCodes);
      setShowRecoveryCodesModal(true);
    } catch {
      showMessage({ type: 'error', text: 'Impossible de charger les codes de secours.' });
    }
  };

  const handleVerifyEmail = async () => {
    try {
      await userService.verifyEmail();
      setProfile((prev) => prev ? {
        ...prev,
        user: { ...prev.user, emailVerified: true },
        security: { ...prev.security, emailVerified: true },
      } : prev);
      showMessage({ type: 'success', text: 'Email vérifié avec succès.' });
    } catch {
      showMessage({ type: 'error', text: 'Impossible de vérifier l\'email.' });
    }
  };

  const loadRecommendations = async () => {
    setLoadingRec(true);
    try {
      const accountCurrency = profile?.account?.currency ?? 'MGA';
      const accountBalance = profile?.account?.balance ?? 0;
      const result = await aiService.getRecommendations({
        user_id: user?.sub ?? profile?.user.id ?? 'current',
        current_balance: accountBalance,
        currency: accountCurrency,
      });
      setRecommendations(result);
    } catch {
      showMessage({ type: 'error', text: 'Impossible de charger les recommandations.' });
    } finally {
      setLoadingRec(false);
    }
  };

  const loadRouting = async () => {
    setLoadingRoute(true);
    try {
      const accountCurrency = profile?.account?.currency ?? 'MGA';
      const accountBalance = profile?.account?.balance ?? 0;
      const amount = accountBalance > 0 ? Math.min(100, Number(accountBalance)) : 100;
      const userCountry = profile?.user.timezone?.startsWith('Europe/') ? 'FR'
        : profile?.user.timezone?.startsWith('Indian/') ? 'MG'
        : profile?.user.timezone?.startsWith('Africa/') ? 'KE'
        : 'MG';
      const result = await aiService.getBestPaymentChannel({
        amount,
        currency: accountCurrency,
        sender_country: userCountry,
        receiver_country: userCountry,
      });
      setRouting(result);
    } catch {
      showMessage({ type: 'error', text: 'Impossible de charger le routage.' });
    } finally {
      setLoadingRoute(false);
    }
  };

  const formatDate = (iso?: string | null) => {
    if (!iso) return '—';
    try {
      return new Date(iso).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' });
    } catch {
      return iso;
    }
  };

  const exportData = () => {
    if (!profile) return;
    const blob = new Blob([JSON.stringify(profile, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `profil-${profile.user.email}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showMessage({ type: 'success', text: 'Données exportées avec succès.' });
  };

  return (
    <div className="bg-slate-100 px-4 py-6 text-slate-900 sm:px-6 lg:px-8 dark:bg-slate-950 dark:text-slate-50">
      <div className="mx-auto max-w-6xl">
        {/* Hero header */}
        <div className="relative mb-6 overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900/60 sm:p-8">
          <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-gradient-to-br from-cyan-500/10 to-blue-500/10 blur-2xl" />
          <div className="relative flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-600 dark:text-cyan-400">
                Mon espace
              </p>
              <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Mon profil</h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Gérez vos informations personnelles, la sécurité et vos préférences
              </p>
            </div>
            <button
              type="button"
              onClick={exportData}
              disabled={!profile}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-slate-800/80 dark:text-slate-200 dark:hover:bg-slate-800"
              title="Exporter mes données (RGPD)"
            >
              <Download size={16} aria-hidden="true" />
              Exporter mes données
            </button>
          </div>
        </div>

        {message && (
          <div
            className={`mb-5 flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm shadow-sm ${
              message.type === 'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300'
                : 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300'
            }`}
            role="alert"
            aria-live="assertive"
          >
            {message.type === 'success' ? <Check className="h-4 w-4 flex-shrink-0" /> : <X className="h-4 w-4 flex-shrink-0" />}
            <span>{message.text}</span>
          </div>
        )}

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-slate-900/60">
          <div className="grid gap-0 lg:grid-cols-[300px_1fr]">
            <aside className="border-b border-slate-200 bg-slate-50/50 p-6 lg:border-b-0 lg:border-r dark:border-white/10 dark:bg-slate-900/50">
              <div className="flex flex-col items-center text-center">
                <div className="relative">
                  {user?.avatar || profile?.user.avatarUrl ? (
                    <img
                      src={user?.avatar ?? profile?.user.avatarUrl}
                      alt="Photo de profil"
                      className="h-24 w-24 rounded-full object-cover border-4 border-white shadow-md dark:border-slate-800"
                    />
                  ) : (
                    <div
                      className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 text-3xl font-bold text-white shadow-md"
                      aria-label="Initiales utilisateur"
                    >
                      {(user?.firstName?.[0] ?? profile?.user.firstName?.[0] ?? 'U').toUpperCase()}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 rounded-full bg-cyan-500 p-2 text-white shadow-lg transition hover:bg-cyan-400"
                    title="Changer la photo"
                    aria-label="Changer la photo de profil"
                  >
                    <Camera size={14} aria-hidden="true" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoChange}
                    aria-label="Télécharger une photo de profil"
                  />
                </div>
                <h2 className="mt-3 text-base font-semibold text-slate-900 dark:text-white">
                  {user?.firstName ?? profile?.user.firstName} {user?.lastName ?? profile?.user.lastName}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {user?.email ?? profile?.user.email}
                </p>
                <div className="mt-3 flex flex-wrap justify-center gap-2">
                  <span className="rounded-full bg-cyan-100 px-2.5 py-0.5 text-xs font-semibold text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-200">
                    {user?.role ?? profile?.user.role}
                  </span>
                  {twoFactorEnabled && (
                    <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200">
                      2FA actif
                    </span>
                  )}
                  {profile?.kyc.status === 'VERIFIED' && (
                    <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-500/20 dark:text-blue-200">
                      KYC validé
                    </span>
                  )}
                </div>
                {user?.avatar && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="mt-3 inline-flex items-center gap-1 text-xs text-slate-500 hover:text-rose-500 dark:text-slate-400"
                  >
                    <Trash2 size={12} aria-hidden="true" />
                    Supprimer la photo
                  </button>
                )}
              </div>

              <nav className="mt-6 space-y-1" aria-label="Sections du profil">
                {TABS.map((t) => {
                  const Icon = t.icon;
                  const active = activeTab === t.key;
                  return (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() => setActiveTab(t.key)}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                        active
                          ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                          : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/50'
                      }`}
                      aria-current={active ? 'page' : undefined}
                    >
                      <span className="flex items-center gap-2">
                        <Icon size={16} aria-hidden="true" />
                        {t.label}
                      </span>
                      {active && <ChevronRight size={14} aria-hidden="true" />}
                    </button>
                  );
                })}
              </nav>
            </aside>
            <main className="p-6 sm:p-8">
              {activeTab === 'personal' && (
                <PersonalTab
                  firstName={firstName} setFirstName={setFirstName}
                  lastName={lastName} setLastName={setLastName}
                  email={email} setEmail={setEmail}
                  phoneNumber={phoneNumber} setPhoneNumber={setPhoneNumber}
                  cin={cin} setCin={setCin}
                  nationality={nationality} setNationality={setNationality}
                  dateOfBirth={dateOfBirth} setDateOfBirth={setDateOfBirth}
                  saving={saving}
                  onSave={handleSaveProfile}
                  onChangePassword={() => setShowPasswordModal(true)}
                />
              )}

              {activeTab === 'security' && (
                <SecurityTab
                  twoFactorEnabled={twoFactorEnabled}
                  recoveryCodesRemaining={profile?.security.recoveryCodesRemaining ?? 0}
                  lastLoginAt={profile?.security.lastLoginAt ?? null}
                  lastLoginIp={profile?.security.lastLoginIp ?? null}
                  failedLoginCount={profile?.security.failedLoginCount ?? 0}
                  emailVerified={profile?.security.emailVerified ?? false}
                  onEnable2FA={() => navigate('/two-factor-setup')}
                  onDisable2FA={() => setShowTwoFactorDisableModal(true)}
                  onShowRecoveryCodes={handleShowRecoveryCodes}
                  onChangePassword={() => setShowPasswordModal(true)}
                  onVerifyEmail={handleVerifyEmail}
                />
              )}

              {activeTab === 'account' && (
                <AccountTab
                  profile={profile}
                  showAccountNumber={showAccountNumber}
                  onToggleAccountNumber={() => setShowAccountNumber((v) => !v)}
                  onCopy={copy}
                  copiedField={copiedField}
                  onKyc={() => setShowKycModal(true)}
                  recommendations={recommendations}
                  routing={routing}
                  loadingRec={loadingRec}
                  loadingRoute={loadingRoute}
                  onLoadRecommendations={loadRecommendations}
                  onLoadRouting={loadRouting}
                />
              )}

              {activeTab === 'preferences' && (
                <PreferencesTab
                  language={language} setLanguage={setLanguage}
                  timezone={timezone} setTimezone={setTimezone}
                  notifyEmail={notifyEmail} setNotifyEmail={setNotifyEmail}
                  notifySms={notifySms} setNotifySms={setNotifySms}
                  notifyPush={notifyPush} setNotifyPush={setNotifyPush}
                  saving={saving}
                  onSave={handleSavePreferences}
                />
              )}

              {activeTab === 'activity' && (
                <ActivityTab
                  loginHistory={loginHistory}
                  formatDate={formatDate}
                  memberSince={profile?.stats.memberSince ?? null}
                  transactionsCount={profile?.stats.transactionsCount ?? 0}
                  apiKeysCount={profile?.stats.apiKeysCount ?? 0}
                />
              )}
            </main>
          </div>
        </div>
      </div>

      <Modal isOpen={showKycModal} onClose={() => setShowKycModal(false)} title="Vérification KYC">
        <p className="text-sm text-slate-300">
          La vérification KYC permet de sécuriser votre compte et d'augmenter vos plafonds de paiement. Veuillez vous rendre sur la page dédiée.
        </p>
        <a
          href="/kyc"
          className="mt-4 block w-full rounded-2xl bg-cyan-500 py-3 text-center text-sm font-semibold text-white transition hover:bg-cyan-400"
        >
          Accéder à la vérification KYC
        </a>
      </Modal>

      <Modal isOpen={showPasswordModal} onClose={() => setShowPasswordModal(false)} title="Changer le mot de passe">
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">Mot de passe actuel</label>
            <div className="flex items-center gap-2 rounded-2xl border border-slate-600 bg-slate-800 px-4 py-3">
              <Lock size={18} className="text-slate-400" aria-hidden="true" />
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full bg-transparent text-white outline-none"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword((v) => !v)}
                className="text-slate-400 hover:text-slate-200"
                aria-label={showCurrentPassword ? 'Masquer' : 'Afficher'}
              >
                {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">Nouveau mot de passe</label>
            <div className="flex items-center gap-2 rounded-2xl border border-slate-600 bg-slate-800 px-4 py-3">
              <KeyRound size={18} className="text-slate-400" aria-hidden="true" />
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-transparent text-white outline-none"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword((v) => !v)}
                className="text-slate-400 hover:text-slate-200"
                aria-label={showNewPassword ? 'Masquer' : 'Afficher'}
              >
                {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {newPassword && (
              <div className="mt-2">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span>Force du mot de passe :</span>
                  <span className="font-semibold">{passwordStrengthLabel}</span>
                </div>
                <div className="mt-1 flex gap-1">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={`h-1.5 flex-1 rounded-full ${i < passwordStrength ? passwordStrengthColor : 'bg-slate-700'}`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">Confirmer le nouveau mot de passe</label>
            <div className="flex items-center gap-2 rounded-2xl border border-slate-600 bg-slate-800 px-4 py-3">
              <Lock size={18} className="text-slate-400" aria-hidden="true" />
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-transparent text-white outline-none"
                placeholder="••••••••"
              />
              {confirmPassword && (
                newPassword === confirmPassword ? (
                  <Check size={16} className="text-emerald-400" />
                ) : (
                  <X size={16} className="text-rose-400" />
                )
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={handleChangePassword}
            disabled={saving}
            className="w-full rounded-2xl bg-cyan-500 py-3 font-semibold text-white transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? 'Modification...' : 'Modifier le mot de passe'}
          </button>
        </div>
      </Modal>

      <Modal isOpen={showTwoFactorDisableModal} onClose={() => setShowTwoFactorDisableModal(false)} title="Désactiver la 2FA">
        <form className="space-y-4" onSubmit={handleDisableTwoFactor}>
          <div className="flex rounded-2xl border border-slate-600 bg-slate-800 p-1">
            <button
              type="button"
              onClick={() => setTwoFactorDisableMode('code')}
              className={`flex-1 rounded-xl py-2 text-sm font-semibold transition ${
                twoFactorDisableMode === 'code' ? 'bg-cyan-500 text-white' : 'text-slate-300 hover:text-white'
              }`}
            >
              Code d'authentification
            </button>
            <button
              type="button"
              onClick={() => setTwoFactorDisableMode('recovery')}
              className={`flex-1 rounded-xl py-2 text-sm font-semibold transition ${
                twoFactorDisableMode === 'recovery' ? 'bg-cyan-500 text-white' : 'text-slate-300 hover:text-white'
              }`}
            >
              Code de secours
            </button>
          </div>
          <p className="text-sm text-slate-300">
            {twoFactorDisableMode === 'code'
              ? "Entrez le code généré par votre application d'authentification pour désactiver la 2FA."
              : "Entrez un code de secours pour désactiver la 2FA. Les codes de secours sont à usage unique."}
          </p>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              {twoFactorDisableMode === 'code' ? 'Code de vérification' : 'Code de secours'}
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={twoFactorDisableCode}
              onChange={(e) => setTwoFactorDisableCode(e.target.value)}
              onBlur={() => setTwoFactorDisableCodeTouched(true)}
              className="w-full rounded-2xl border border-slate-600 bg-slate-800 px-4 py-3 text-white outline-none focus:border-cyan-500"
              placeholder="123456"
              required
            />
            {twoFactorDisableCodeTouched && !twoFactorDisableCode.trim() && (
              <p className="mt-2 text-sm text-red-400">Ce champ est requis</p>
            )}
          </div>
          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-2xl bg-cyan-500 py-3 font-semibold text-white transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? 'Désactivation...' : 'Désactiver la 2FA'}
          </button>
        </form>
      </Modal>

      <Modal isOpen={showRecoveryCodesModal} onClose={() => setShowRecoveryCodesModal(false)} title="Codes de secours">
        <div className="space-y-4">
          <p className="text-sm text-slate-300">
            Conservez ces codes en lieu sûr. Vous pouvez les utiliser pour vous connecter si vous perdez votre téléphone.
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {profileRecoveryCodes.map((code, index) => (
              <button
                key={index}
                type="button"
                onClick={() => copy(code, `recovery-${index}`)}
                className="flex items-center justify-between rounded-xl border border-slate-600 bg-slate-800 px-3 py-2 font-mono text-sm text-white hover:border-cyan-500"
                title="Cliquer pour copier"
              >
                <span>{code}</span>
                {copiedField === `recovery-${index}` ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} className="text-slate-400" />}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setShowRecoveryCodesModal(false)}
            className="w-full rounded-2xl bg-cyan-500 py-3 font-semibold text-white transition hover:bg-cyan-400"
          >
            Fermer
          </button>
        </div>
      </Modal>
    </div>
  );
};

// =================== Tab: Personal ===================

interface PersonalTabProps {
  firstName: string; setFirstName: (v: string) => void;
  lastName: string; setLastName: (v: string) => void;
  email: string; setEmail: (v: string) => void;
  phoneNumber: string; setPhoneNumber: (v: string) => void;
  cin: string; setCin: (v: string) => void;
  nationality: string; setNationality: (v: string) => void;
  dateOfBirth: string; setDateOfBirth: (v: string) => void;
  saving: boolean;
  onSave: () => void;
  onChangePassword: () => void;
}

type FieldProps = {
  id: string;
  label: string;
  icon: React.ElementType;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
};

const Field = ({ id, label, icon: Icon, value, onChange, placeholder, type = 'text' }: FieldProps) => (
  <div>
    <label className="mb-2 block text-sm font-medium text-slate-600 dark:text-slate-300" htmlFor={id}>
      {label}
    </label>
    <div className="flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-3 dark:border-white/10 dark:bg-slate-800/80">
      <Icon size={18} className="text-slate-400" aria-hidden="true" />
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full bg-transparent text-slate-900 outline-none dark:text-slate-100"
      />
    </div>
  </div>
);

const PersonalTab = (p: PersonalTabProps) => {

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Informations personnelles</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Mettez à jour vos informations d'identité. Les champs marqués sont requis pour la conformité KYC.
        </p>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-slate-800/40">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          <User size={14} /> Identité
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="firstName" label="Prénom" icon={User} type="text" value={p.firstName} onChange={(e) => p.setFirstName(e.target.value)} placeholder="Prénom" />
          <Field id="lastName" label="Nom" icon={User} type="text" value={p.lastName} onChange={(e) => p.setLastName(e.target.value)} placeholder="Nom" />
          <Field id="email" label="Adresse email" icon={Mail} type="email" value={p.email} onChange={(e) => p.setEmail(e.target.value)} placeholder="vous@exemple.com" />
          <Field id="phone" label="Téléphone" icon={Phone} type="tel" value={p.phoneNumber} onChange={(e) => p.setPhoneNumber(e.target.value)} placeholder="+261 34 00 000 00" />
          <Field id="dob" label="Date de naissance" icon={Calendar} type="date" value={p.dateOfBirth} onChange={(e) => p.setDateOfBirth(e.target.value)} />
          <Field id="nationality" label="Nationalité" icon={Globe} type="text" value={p.nationality} onChange={(e) => p.setNationality(e.target.value)} placeholder="Française, Malgache..." />
          <div className="sm:col-span-2">
            <Field id="cin" label="Numéro d'identité (CIN / Passeport)" icon={IdCard} type="text" value={p.cin} onChange={(e) => p.setCin(e.target.value)} placeholder="N° de carte d'identité ou passeport" />
          </div>
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={p.onSave}
          disabled={p.saving}
          className="rounded-2xl bg-cyan-500 px-6 py-3 font-semibold text-white transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {p.saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
        </button>
        <button
          type="button"
          onClick={p.onChangePassword}
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:bg-slate-800/80 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          <Lock size={18} aria-hidden="true" />
          Changer le mot de passe
        </button>
      </div>
    </div>
  );
};

// =================== Tab: Security ===================

interface SecurityTabProps {
  twoFactorEnabled: boolean | null;
  recoveryCodesRemaining: number;
  lastLoginAt?: string | null;
  lastLoginIp?: string | null;
  failedLoginCount: number;
  emailVerified: boolean;
  onEnable2FA: () => void;
  onDisable2FA: () => void;
  onShowRecoveryCodes: () => void;
  onChangePassword: () => void;
  onVerifyEmail: () => void;
}

const ScoreItem = ({ label, ok, detail }: { label: string; ok: boolean; detail?: string }) => (
  <li className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 dark:border-white/10 dark:bg-slate-800/40">
    <div>
      <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{label}</p>
      {detail && <p className="text-xs text-slate-500 dark:text-slate-400">{detail}</p>}
    </div>
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
      ok ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200' : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200'
    }`}>
      {ok ? <Check size={12} /> : <AlertTriangle size={12} />}
      {ok ? 'OK' : 'À améliorer'}
    </span>
  </li>
);

const SecurityTab = (p: SecurityTabProps) => {

  const formatDate = (iso?: string | null) => {
    if (!iso) return '—';
    try {
      return new Date(iso).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' });
    } catch {
      return iso;
    }
  };

  const securityScore = (p.twoFactorEnabled ? 1 : 0) + (p.emailVerified ? 1 : 0) + (p.failedLoginCount === 0 ? 1 : 0);
  const scoreColor = securityScore === 3 ? 'text-emerald-500' : securityScore >= 2 ? 'text-amber-500' : 'text-rose-500';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Sécurité du compte</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Renforcez la sécurité de votre compte en activant les options ci-dessous.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center dark:border-white/10 dark:bg-slate-800/40">
          <ShieldCheck className={`mx-auto h-8 w-8 ${scoreColor}`} />
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Score de sécurité</p>
          <p className={`text-2xl font-bold ${scoreColor}`}>{securityScore}/3</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center dark:border-white/10 dark:bg-slate-800/40">
          <KeyRound className="mx-auto h-8 w-8 text-cyan-500" />
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Codes de secours</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{p.recoveryCodesRemaining}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center dark:border-white/10 dark:bg-slate-800/40">
          <AlertTriangle className="mx-auto h-8 w-8 text-amber-500" />
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Tentatives échouées</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{p.failedLoginCount}</p>
        </div>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-slate-800/40">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Recommandations
        </h3>
        <ul className="space-y-2">
          <ScoreItem label="Authentification à deux facteurs" ok={p.twoFactorEnabled === true} detail="Activez la 2FA TOTP pour sécuriser votre compte" />
          <li className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 dark:border-white/10 dark:bg-slate-800/40">
            <div>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-100">Email vérifié</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {p.emailVerified ? 'Votre adresse email est confirmée' : 'Confirmez votre adresse email'}
              </p>
            </div>
            {p.emailVerified ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200">
                <Check size={12} /> OK
              </span>
            ) : (
              <button
                type="button"
                onClick={p.onVerifyEmail}
                className="rounded-xl border border-cyan-300 bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold text-cyan-700 transition hover:bg-cyan-500/20 dark:border-cyan-700 dark:text-cyan-200"
              >
                Vérifier
              </button>
            )}
          </li>
          <ScoreItem label="Aucune connexion suspecte" ok={p.failedLoginCount === 0} detail={`${p.failedLoginCount} tentative(s) échouée(s)`} />
        </ul>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-slate-800/40">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Actions</h3>
        <div className="space-y-3">
          <ActionRow
            icon={Lock}
            title="Mot de passe"
            description="Modifiez votre mot de passe régulièrement"
            actionLabel="Modifier"
            onAction={p.onChangePassword}
          />
          <ActionRow
            icon={Smartphone}
            title="Authentification à deux facteurs"
            description={p.twoFactorEnabled ? 'Activée — votre compte est protégé' : 'Désactivée — activez-la pour sécuriser votre compte'}
            actionLabel={p.twoFactorEnabled ? 'Désactiver' : 'Activer'}
            onAction={p.twoFactorEnabled ? p.onDisable2FA : p.onEnable2FA}
            variant={p.twoFactorEnabled ? 'danger' : 'primary'}
          />
          {p.twoFactorEnabled && (
            <ActionRow
              icon={RefreshCw}
              title="Codes de secours"
              description={`${p.recoveryCodesRemaining} code(s) de secours restants`}
              actionLabel="Voir les codes"
              onAction={p.onShowRecoveryCodes}
            />
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-slate-800/40">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Dernière connexion</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-white/10 dark:bg-slate-900/40">
            <Clock className="h-5 w-5 text-cyan-500" />
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Date et heure</p>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{formatDate(p.lastLoginAt)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-white/10 dark:bg-slate-900/40">
            <MapPin className="h-5 w-5 text-cyan-500" />
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Adresse IP</p>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-100 font-mono">{p.lastLoginIp ?? '—'}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

interface ActionRowProps {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
  variant?: 'primary' | 'danger';
}

const ActionRow = ({ icon: Icon, title, description, actionLabel, onAction, variant = 'primary' }: ActionRowProps) => (
  <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:flex-row sm:items-center sm:justify-between dark:border-white/10 dark:bg-slate-900/40">
    <div className="flex items-start gap-3">
      <div className="rounded-lg bg-cyan-100 p-2 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-200">
        <Icon size={18} />
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-900 dark:text-white">{title}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>
      </div>
    </div>
    <button
      type="button"
      onClick={onAction}
      className={`inline-flex items-center gap-1 rounded-xl px-3 py-2 text-sm font-semibold transition ${
        variant === 'danger'
          ? 'border border-rose-300 bg-white text-rose-700 hover:bg-rose-50 dark:border-rose-700 dark:bg-slate-900 dark:text-rose-300 dark:hover:bg-slate-800'
          : 'bg-cyan-500 text-white hover:bg-cyan-400'
      }`}
    >
      {actionLabel}
      <ArrowUpRight size={14} />
    </button>
  </div>
);

// =================== Tab: Account ===================

interface AccountTabProps {
  profile: ProfileResponse | null;
  showAccountNumber: boolean;
  onToggleAccountNumber: () => void;
  onCopy: (value: string, field: string) => void;
  copiedField: string | null;
  onKyc: () => void;
  recommendations: RecommendationResponse | null;
  routing: RoutingResponse | null;
  loadingRec: boolean;
  loadingRoute: boolean;
  onLoadRecommendations: () => void;
  onLoadRouting: () => void;
}

const AccountTab = (p: AccountTabProps) => {
  const account = p.profile?.account;
  const kyc = p.profile?.kyc;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Compte & portefeuille</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Votre compte, votre KYC et les insights IA.
        </p>
      </div>

      {account ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-slate-800/40">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            <Wallet size={14} /> Mon compte
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 p-4 dark:border-white/10">
              <p className="text-xs text-slate-500 dark:text-slate-400">Numéro de compte</p>
              <div className="mt-1 flex items-center gap-2">
                <p className="font-mono text-lg font-semibold text-slate-900 dark:text-white">
                  {p.showAccountNumber ? account.accountNumber : '••••••••' + (account.accountNumber?.slice(-4) ?? '')}
                </p>
                <button
                  type="button"
                  onClick={p.onToggleAccountNumber}
                  className="text-slate-400 hover:text-slate-600"
                  aria-label={p.showAccountNumber ? 'Masquer' : 'Afficher'}
                >
                  {p.showAccountNumber ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                <button
                  type="button"
                  onClick={() => p.onCopy(account.accountNumber ?? '', 'accountNumber')}
                  className="text-slate-400 hover:text-cyan-500"
                  aria-label="Copier le numéro de compte"
                >
                  {p.copiedField === 'accountNumber' ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                </button>
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 p-4 dark:border-white/10">
              <p className="text-xs text-slate-500 dark:text-slate-400">Solde disponible</p>
              <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                {new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(account.balance ?? 0)}{' '}
                <span className="text-sm font-medium text-slate-500">{account.currency}</span>
              </p>
            </div>
          </div>
        </section>
      ) : (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-5 dark:border-amber-700 dark:bg-amber-900/20">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-300" />
            <div>
              <p className="font-semibold text-amber-800 dark:text-amber-200">Aucun compte associé</p>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                Vous n'avez pas encore de compte. Contactez le support pour en créer un.
              </p>
            </div>
          </div>
        </div>
      )}

      {kyc && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-slate-800/40">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            <ShieldCheck size={14} /> Vérification KYC
          </h3>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1">
              <p className="font-semibold text-slate-900 dark:text-white">
                {kyc.status === 'VERIFIED' ? 'Identité vérifiée' : kyc.status === 'REJECTED' ? 'Vérification rejetée' : 'Vérification en attente'}
              </p>
              {kyc.confidence && (
                <p className="text-sm text-slate-500 dark:text-slate-400">Confiance : {Math.round(kyc.confidence * 100)}%</p>
              )}
              {kyc.locked && (
                <p className="mt-1 text-sm text-rose-600 dark:text-rose-300">
                  Verrouillé jusqu'à {kyc.lockedUntil ? new Date(kyc.lockedUntil).toLocaleString('fr-FR') : '—'}
                </p>
              )}
              {!kyc.locked && kyc.remainingAttempts < 3 && (
                <p className="mt-1 text-sm text-amber-600 dark:text-amber-300">
                  {kyc.remainingAttempts} tentative(s) restante(s) sur {kyc.maxAttempts}
                </p>
              )}
            </div>
            {kyc.status !== 'VERIFIED' && !kyc.locked && (
              <button
                type="button"
                onClick={p.onKyc}
                className="rounded-2xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-400"
              >
                {kyc.attempts > 0 ? 'Réessayer' : 'Commencer la vérification'}
              </button>
            )}
          </div>
        </section>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-slate-800/40">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          <TrendingUp size={14} /> Insights IA
        </h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={p.onLoadRecommendations}
            disabled={p.loadingRec}
            className="flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60 dark:border-white/10 dark:bg-slate-800/80 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <Lightbulb size={18} aria-hidden="true" />
            {p.loadingRec ? 'Analyse...' : 'Recommandations personnalisées'}
          </button>
          <button
            type="button"
            onClick={p.onLoadRouting}
            disabled={p.loadingRoute}
            className="flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60 dark:border-white/10 dark:bg-slate-800/80 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <Route size={18} aria-hidden="true" />
            {p.loadingRoute ? 'Calcul...' : 'Routage optimal'}
          </button>
        </div>

        {p.recommendations && (
          <div className="mt-4 rounded-2xl border border-cyan-400/30 bg-cyan-500/10 p-4">
            <h4 className="font-semibold text-cyan-700 dark:text-cyan-300">Recommandations</h4>
            <p className="mt-2 text-sm text-cyan-800 dark:text-cyan-200">{p.recommendations.savings_tip}</p>
            {p.recommendations.spending_alert && (
              <p className="mt-2 text-sm text-amber-700 dark:text-amber-300">{p.recommendations.spending_alert}</p>
            )}
          </div>
        )}

        {p.routing && (
          <div className="mt-4 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4">
            <h4 className="font-semibold text-emerald-700 dark:text-emerald-300">Canal recommandé</h4>
            <p className="mt-1 text-sm text-emerald-800 dark:text-emerald-200">{p.routing.reason}</p>
            <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">
              Frais estimés: {p.routing.estimated_fee.toFixed(2)}€ | Délai: {p.routing.estimated_arrival_seconds}s
            </p>
          </div>
        )}
      </section>
    </div>
  );
};

// =================== Tab: Preferences ===================

interface PreferencesTabProps {
  language: string; setLanguage: (v: string) => void;
  timezone: string; setTimezone: (v: string) => void;
  notifyEmail: boolean; setNotifyEmail: (v: boolean) => void;
  notifySms: boolean; setNotifySms: (v: boolean) => void;
  notifyPush: boolean; setNotifyPush: (v: boolean) => void;
  saving: boolean;
  onSave: () => void;
}

const PreferencesTab = (p: PreferencesTabProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Préférences</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Personnalisez votre langue, votre fuseau horaire et vos notifications.
        </p>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-slate-800/40">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          <Languages size={14} /> Langue et région
        </h3>
        <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">
          La langue sélectionnée sera utilisée pour vos emails, SMS et relevés. L'interface reste en français pour cette version.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-600 dark:text-slate-300" htmlFor="language">
              Langue de l'interface
            </label>
            <div className="flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-3 dark:border-white/10 dark:bg-slate-800/80">
              <Globe size={18} className="text-slate-400" aria-hidden="true" />
              <select
                id="language"
                value={p.language}
                onChange={(e) => p.setLanguage(e.target.value)}
                className="w-full bg-transparent text-slate-900 outline-none dark:text-slate-100"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code} className="text-slate-900">
                    {l.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-600 dark:text-slate-300" htmlFor="timezone">
              Fuseau horaire
            </label>
            <div className="flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-3 dark:border-white/10 dark:bg-slate-800/80">
              <Clock size={18} className="text-slate-400" aria-hidden="true" />
              <select
                id="timezone"
                value={p.timezone}
                onChange={(e) => p.setTimezone(e.target.value)}
                className="w-full bg-transparent text-slate-900 outline-none dark:text-slate-100"
              >
                {TIMEZONES.map((tz) => (
                  <option key={tz} value={tz} className="text-slate-900">
                    {tz}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-slate-800/40">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          <Bell size={14} /> Notifications
        </h3>
        <div className="space-y-3">
          <ToggleRow
            icon={Mail}
            title="Notifications par email"
            description="Recevez les confirmations de paiement et alertes par email"
            checked={p.notifyEmail}
            onChange={p.setNotifyEmail}
          />
          <ToggleRow
            icon={Smartphone}
            title="Notifications par SMS"
            description="Recevez un SMS pour les transactions importantes"
            checked={p.notifySms}
            onChange={p.setNotifySms}
          />
          <ToggleRow
            icon={Bell}
            title="Notifications push"
            description="Recevez des alertes en temps réel sur cet appareil"
            checked={p.notifyPush}
            onChange={p.setNotifyPush}
          />
        </div>
      </section>

      <button
        type="button"
        onClick={p.onSave}
        disabled={p.saving}
        className="rounded-2xl bg-cyan-500 px-6 py-3 font-semibold text-white transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {p.saving ? 'Enregistrement...' : 'Enregistrer les préférences'}
      </button>
    </div>
  );
};

interface ToggleRowProps {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

const ToggleRow = ({ icon: Icon, title, description, checked, onChange }: ToggleRowProps) => (
  <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-white/10 dark:bg-slate-900/40">
    <div className="flex items-start gap-3">
      <div className="rounded-lg bg-cyan-100 p-2 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-200">
        <Icon size={18} />
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-900 dark:text-white">{title}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>
      </div>
    </div>
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition ${
        checked ? 'bg-cyan-500' : 'bg-slate-300 dark:bg-slate-600'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  </div>
);

// =================== Tab: Activity ===================

interface ActivityTabProps {
  loginHistory: LoginHistoryEntry[];
  formatDate: (iso?: string | null) => string;
  memberSince?: string | null;
  transactionsCount: number;
  apiKeysCount: number;
}

const ActivityTab = (p: ActivityTabProps) => (
  <div className="space-y-6">
    <div>
      <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Activité du compte</h2>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Historique de vos connexions et statistiques d'utilisation.
      </p>
    </div>

    <div className="grid gap-4 sm:grid-cols-3">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-slate-800/40">
        <FileText className="h-6 w-6 text-cyan-500" />
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Transactions</p>
        <p className="text-2xl font-bold text-slate-900 dark:text-white">{p.transactionsCount}</p>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-slate-800/40">
        <KeyRound className="h-6 w-6 text-cyan-500" />
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Clés API actives</p>
        <p className="text-2xl font-bold text-slate-900 dark:text-white">{p.apiKeysCount}</p>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-slate-800/40">
        <Clock className="h-6 w-6 text-cyan-500" />
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Membre depuis</p>
        <p className="text-sm font-semibold text-slate-900 dark:text-white">{p.formatDate(p.memberSince)}</p>
      </div>
    </div>

    <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-slate-800/40">
      <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        <LogIn size={14} /> Historique des connexions
      </h3>
      {p.loginHistory.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">Aucune connexion enregistrée pour le moment.</p>
      ) : (
        <ul className="space-y-2">
          {p.loginHistory.map((entry, i) => (
            <li
              key={i}
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-white/10 dark:bg-slate-900/40"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-cyan-100 p-2 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-200">
                  <LogIn size={16} />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                    Connexion {entry.success ? 'réussie' : 'échouée'}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">IP : <span className="font-mono">{entry.ip || '—'}</span></p>
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">{p.formatDate(entry.loginAt)}</p>
            </li>
          ))}
        </ul>
      )}
    </section>

    <section className="rounded-2xl border border-rose-300 bg-rose-50 p-5 dark:border-rose-700 dark:bg-rose-900/20">
      <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-rose-700 dark:text-rose-200">
        <AlertTriangle size={14} /> Zone dangereuse
      </h3>
      <p className="text-sm text-rose-700 dark:text-rose-300">
        La suppression de votre compte est définitive. Toutes vos données seront effacées conformément au RGPD.
      </p>
      <button
        type="button"
        disabled
        className="mt-3 inline-flex items-center gap-2 rounded-2xl border border-rose-300 bg-white px-4 py-2 text-sm font-semibold text-rose-700 opacity-60 dark:border-rose-700 dark:bg-slate-900 dark:text-rose-300"
        title="Contacter le support pour supprimer le compte"
      >
        Supprimer mon compte
      </button>
    </section>
  </div>
);

export default UserProfile;





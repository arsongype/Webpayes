import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../hooks/useAuth';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import axios from 'axios';
import { Shield, CheckCircle2, Loader2, Lock, Mail, Eye, EyeOff, ArrowRight } from 'lucide-react';
import type { LoginPayload } from '../../services/authService';

const schema = z.object({
  email: z.string().min(1, 'Email invalide').refine(
    (val) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const localhostRegex = /^[^\s@]+@[^\s@]+$/;
      return emailRegex.test(val) || localhostRegex.test(val);
    },
    'Email invalide'
  ),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
  twoFactorCode: z.string().optional(),
});

type LoginForm = z.infer<typeof schema>;

const inputClass =
  'w-full rounded-2xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-white outline-none transition placeholder:text-slate-400 focus:border-cyan-500/50 focus:bg-white/10 focus:ring-2 focus:ring-cyan-500/20 dark:placeholder:text-slate-500 sm:py-3';

const formatDate = (date: Date) =>
  date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

const Login = () => {
  const { login, loginWithGoogle } = useAuth();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [requiresTwoFactor, setRequiresTwoFactor] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: LoginForm) => {
    setSubmitError(null);
    setIsLoading(true);
    try {
      const payload: LoginPayload = {
        email: data.email,
        password: data.password,
        twoFactorCode: data.twoFactorCode,
      };
      await login(payload);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const serverMessage = error.response?.data?.message;
        if (typeof serverMessage === 'string') {
          setSubmitError(serverMessage);
          return;
        }
        if (Array.isArray(serverMessage) && serverMessage.length > 0) {
          setSubmitError(serverMessage.join(' '));
          return;
        }
        if (error.code === 'ERR_NETWORK' || !error.response) {
          setSubmitError('Impossible de se connecter au serveur. Vérifiez que le backend est démarré.');
          return;
        }
      }
      if (error instanceof Error) {
        if (error.message === 'TWO_FACTOR_REQUIRED') {
          setRequiresTwoFactor(true);
          return;
        }
        setSubmitError(error.message);
        return;
      }
      setSubmitError('Email ou mot de passe incorrect.');
    } finally {
      setIsLoading(false);
    }
  };

  const today = new Date();

  return (
    <div className="flex min-h-screen items-center justify-center bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-50">
      <div className="w-full max-w-md px-6 py-10">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 via-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25">
            <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 7.5C3 5.567 4.567 4 6.5 4H17.5C19.433 4 21 5.567 21 7.5V11H3V7.5Z" fill="currentColor" opacity="0.9" />
              <path d="M3 13H21V16.5C21 18.433 19.433 20 17.5 20H6.5C4.567 20 3 18.433 3 16.5V13Z" fill="currentColor" opacity="0.5" />
              <circle cx="12" cy="12" r="1.5" fill="currentColor" />
            </svg>
          </div>
          <h1 className="mt-4 text-xl font-bold tracking-tight text-slate-900 dark:text-white">WebPaysh</h1>
          <span className="mt-1 inline-flex items-center gap-1.5 rounded-full border border-cyan-200 bg-cyan-50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-cyan-700 dark:border-cyan-500/30 dark:bg-cyan-500/10 dark:text-cyan-300">
            Paiement nouvelle génération
          </span>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-slate-900 dark:shadow-none">
          <div className="border-b border-slate-200 px-6 py-5 dark:border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Connexion</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Entrez vos identifiants pour accéder à votre compte</p>
              </div>
              <span className="text-right text-[11px] text-slate-400 dark:text-slate-500">{formatDate(today)}</span>
            </div>
          </div>
          <div className="px-6 py-5">
            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              {requiresTwoFactor && (
                <div className="rounded-2xl border border-cyan-400/30 bg-cyan-500/10 p-3 text-sm text-cyan-800 dark:border-cyan-500/30 dark:bg-cyan-500/10 dark:text-cyan-200">
                  <div className="flex items-center gap-2">
                    <Shield size={16} className="flex-shrink-0" />
                    <p className="font-medium">Authentification à deux facteurs obligatoire</p>
                  </div>
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                    Après votre mot de passe, vous devrez saisir un code à 6 chiffres de votre application d'authentification.
                  </p>
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="email">
                  Email
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    {...register('email')}
                    className={inputClass}
                    placeholder="vous@exemple.com"
                  />
                </div>
                {errors.email && <p className="mt-1.5 text-sm text-rose-600">{errors.email.message}</p>}
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="password">
                    Mot de passe
                  </label>
                  <Link to="/forgot-password" className="text-xs font-medium text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300">
                    Oublié ?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    {...register('password')}
                    className={inputClass}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                    aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="mt-1.5 text-sm text-rose-600">{errors.password.message}</p>}
              </div>

              {requiresTwoFactor && (
                <div>
                  <div className="mb-2 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-3 text-sm text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="flex-shrink-0" />
                      <p className="font-medium">Identifiants vérifiés</p>
                    </div>
                    <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                      Ouvrez votre application d'authentification et saisissez le code à 6 chiffres.
                    </p>
                  </div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="twoFactorCode">
                    Code de vérification (2FA)
                  </label>
                  <input
                    id="twoFactorCode"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    pattern="[0-9]{6}"
                    {...register('twoFactorCode', { required: true, pattern: /^\d{6}$/ })}
                    className={inputClass.replace('pl-10', 'px-4') + ' text-center font-mono text-2xl tracking-[0.5em]'}
                    placeholder="000000"
                    autoFocus
                  />
                  {errors.twoFactorCode && (
                    <p className="mt-1.5 text-sm text-rose-600">
                      Code à 6 chiffres requis
                    </p>
                  )}
                </div>
              )}

              {submitError && (
                <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-600 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200" role="alert">
                  {submitError}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-3 font-semibold text-white shadow-md transition hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    {requiresTwoFactor ? 'Vérification du code...' : 'Connexion...'}
                  </span>
                ) : (
                  <>
                    {requiresTwoFactor ? 'Vérifier le code 2FA' : 'Se connecter'}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-5 w-full">
              <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">
                <span className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
                <span>ou</span>
                <span className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
              </div>

              <button
                onClick={loginWithGoogle}
                className="flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-300 bg-white px-4 py-2.5 font-medium text-slate-900 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2 sm:py-3 dark:border-white/10 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
                type="button"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.03 2.53-2.18 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                Continuer avec Google
              </button>
            </div>

            <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
              Pas encore de compte ?{' '}
              <Link to="/register" className="font-semibold text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300">
                Créer un compte
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../hooks/useAuth';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import axios from 'axios';
import { Shield, CheckCircle2, Loader2, Lock, Mail, Eye, EyeOff, ArrowRight } from 'lucide-react';
import AuthShell from './AuthShell';
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

  return (
    <AuthShell title="Connexion" subtitle="Entrez vos identifiants pour accéder à votre compte">
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        {requiresTwoFactor && (
          <div className="rounded-xl border border-cyan-400/30 bg-cyan-500/10 p-3 text-sm text-cyan-800 dark:text-cyan-200">
            <div className="flex items-center gap-2">
              <Shield size={16} className="flex-shrink-0" />
              <p className="font-medium">Authentification à deux facteurs obligatoire</p>
            </div>
            <p className="mt-1 text-xs">
              Après votre mot de passe, vous devrez saisir un code à 6 chiffres de votre application d'authentification.
            </p>
          </div>
        )}

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="email">
            Email
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="email"
              type="email"
              autoComplete="email"
              {...register('email')}
              className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 dark:border-white/10 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-cyan-400 sm:py-3"
              placeholder="vous@exemple.com"
            />
          </div>
          {errors.email && <p className="mt-1.5 text-sm text-rose-600 dark:text-rose-300">{errors.email.message}</p>}
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="password">
              Mot de passe
            </label>
            <Link to="/forgot-password" className="text-xs font-medium text-cyan-600 hover:text-cyan-700 dark:text-cyan-400">
              Oublié ?
            </Link>
          </div>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              {...register('password')}
              className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-10 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 dark:border-white/10 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-cyan-400 sm:py-3"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && <p className="mt-1.5 text-sm text-rose-600 dark:text-rose-300">{errors.password.message}</p>}
        </div>

        {requiresTwoFactor && (
          <div>
            <div className="mb-2 rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-3 text-sm text-emerald-800 dark:text-emerald-200">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="flex-shrink-0" />
                <p className="font-medium">Identifiants vérifiés</p>
              </div>
              <p className="mt-1 text-xs">
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
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-center font-mono text-2xl tracking-[0.5em] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 dark:border-white/10 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-cyan-400"
              placeholder="000000"
              autoFocus
            />
            {errors.twoFactorCode && (
              <p className="mt-1.5 text-sm text-rose-600 dark:text-rose-300">
                Code à 6 chiffres requis
              </p>
            )}
          </div>
        )}

        {submitError && (
          <div className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-600 dark:text-rose-200" role="alert">
            {submitError}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-3 font-semibold text-white shadow-md transition hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
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
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-300 bg-white px-4 py-2.5 font-medium text-slate-900 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2 dark:border-white/10 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-800 dark:focus:ring-offset-slate-900 sm:py-3"
          type="button"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.03 2.53-2.18 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          Continuer avec Google
        </button>
      </div>

      <p className="text-center text-sm text-slate-500 dark:text-slate-400">
        Pas encore de compte ?{' '}
        <Link to="/register" className="font-semibold text-cyan-600 hover:text-cyan-700 dark:text-cyan-400">
          Créer un compte
        </Link>
      </p>
    </AuthShell>
  );
};

export default Login;

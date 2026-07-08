import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../hooks/useAuth';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import axios from 'axios';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
});

type LoginForm = z.infer<typeof schema>;

const Login = () => {
  const { login, loginWithGoogle } = useAuth();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: LoginForm) => {
    setSubmitError(null);
    try {
      await login(data);
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
      }

      setSubmitError('Email ou mot de passe incorrect.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 dark:bg-[radial-gradient(circle_at_top,rgba(243,232,255,0.35),transparent_35%),linear-gradient(135deg,#081120_0%,#0f172a_48%,#111827_100%)] dark:text-slate-50">
      <div className="mx-auto flex min-h-screen max-w-6xl items-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid w-full gap-8 rounded-4xl border border-slate-200 bg-white/80 p-4 shadow-xl backdrop-blur xl:grid-cols-[1.05fr_0.95fr] xl:p-6 dark:border-white/10 dark:bg-slate-900/70">
          <section className="rounded-3xl bg-white/60 p-8 md:p-10 dark:bg-white/5">
            <p className="text-sm uppercase tracking-[0.32em] text-cyan-600/80 dark:text-cyan-200/80">Payment Platform</p>
            <h1 className="mt-4 max-w-md text-4xl font-semibold leading-tight md:text-5xl">Connexion sécurisée pour les payment</h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-slate-500 dark:text-slate-300 md:text-base">
              Accédez à votre tableau de bord avec un compte local ou via Google, avec validation côté formulaire et jeton stocké localement.
            </p>

            <div className="mt-8 grid gap-3 text-sm text-slate-700 dark:text-slate-200 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-slate-800/50">
                <div className="text-cyan-600 dark:text-cyan-200">JWT sécurisé</div>
                <div className="mt-1 text-slate-500 dark:text-slate-300">Authentification et navigation protégée.</div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-slate-800/50">
                <div className="text-cyan-600 dark:text-cyan-200">OAuth Google</div>
                <div className="mt-1 text-slate-500 dark:text-slate-300">Connexion sociale avec redirection propre.</div>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white/80 p-8 shadow-xl md:p-10 dark:border-white/10 dark:bg-slate-900/70">
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Se connecter</h2>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Utilisez votre email et votre mot de passe, ou passez par Google.</p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-600 dark:text-slate-300" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  {...register('email')}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:bg-white dark:border-white/10 dark:bg-slate-800/80 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-cyan-400 dark:focus:bg-slate-800"
                  placeholder="....@exemple.com"
                />
                {errors.email && <p className="mt-2 text-sm text-rose-600 dark:text-rose-300">{errors.email.message}</p>}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-600 dark:text-slate-300" htmlFor="password">
                  Mot de passe
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  {...register('password')}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:bg-white dark:border-white/10 dark:bg-slate-800/80 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-cyan-400 dark:focus:bg-slate-800"
                  placeholder="••••••••"
                />
                {errors.password && <p className="mt-2 text-sm text-rose-600 dark:text-rose-300">{errors.password.message}</p>}
              </div>

              {submitError && (
                <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-600 dark:text-rose-200">
                  {submitError}
                </div>
              )}

              <button
                type="submit"
                className="w-full rounded-2xl bg-cyan-500 px-4 py-3 font-semibold text-white transition hover:bg-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-950"
              >
                Connexion
              </button>
            </form>

            <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">
              <span className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
              ou
              <span className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
            </div>

            <button
              onClick={loginWithGoogle}
              className="flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-300 bg-white px-4 py-3 font-medium text-slate-900 transition hover:bg-slate-50 dark:border-white/10 dark:bg-slate-800/80 dark:text-white dark:hover:bg-slate-800"
              type="button"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white dark:bg-white dark:text-slate-900">G</span>
              Continuer avec Google
            </button>

            <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">
              Pas encore de compte ?{' '}
              <Link to="/register" className="font-medium text-cyan-600 hover:text-cyan-700 dark:text-cyan-300 dark:hover:text-cyan-200">
                Créer un compte
              </Link>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
export default Login;
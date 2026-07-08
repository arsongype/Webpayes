import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../hooks/useAuth';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import axios from 'axios';

const schema = z.object({
  firstName: z.string().min(2, 'Le prénom est requis'),
  lastName: z.string().min(2, 'Le nom est requis'),
  email: z.string().email(),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
});

type RegisterForm = z.infer<typeof schema>;

const Register = () => {
  const { register: registerUser } = useAuth();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: RegisterForm) => {
    setSubmitError(null);
    try {
      await registerUser(data);
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

      setSubmitError('Impossible de créer le compte. Vérifiez les champs saisis ou si cet email existe déjà.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 dark:bg-[radial-gradient(circle_at_top,rgba(125,211,252,0.22),transparent_35%),linear-gradient(135deg,#020617_0%,#0f172a_52%,#111827_100%)] dark:text-slate-50">
      <div className="mx-auto flex min-h-screen max-w-6xl items-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid w-full gap-8 rounded-4xl border border-slate-200 bg-white/80 p-4 shadow-xl backdrop-blur xl:grid-cols-[0.95fr_1.05fr] xl:p-6 dark:border-white/10 dark:bg-slate-900/70">
          <section className="rounded-3xl border border-slate-200 bg-white/80 p-8 shadow-xl md:p-10 dark:border-white/10 dark:bg-slate-900/70">
            <div className="mb-8">
              <p className="text-sm uppercase tracking-[0.32em] text-cyan-600/80 dark:text-cyan-200/80">Créer un compte</p>
              <p className="mt-4 text-sm leading-6 text-slate-500 dark:text-slate-300 md:text-base">
                Renseignez votre identité et choisissez un mot de passe avant d’accéder au tableau de bord.
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-600 dark:text-slate-300" htmlFor="firstName">
                    Prénom
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    autoComplete="given-name"
                    {...register('firstName')}
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:bg-white dark:border-white/10 dark:bg-slate-800/80 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-cyan-400 dark:focus:bg-slate-800"
                  />
                  {errors.firstName && <p className="mt-2 text-sm text-rose-600 dark:text-rose-300">{errors.firstName.message}</p>}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-600 dark:text-slate-300" htmlFor="lastName">
                    Nom
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    autoComplete="family-name"
                    {...register('lastName')}
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:bg-white dark:border-white/10 dark:bg-slate-800/80 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-cyan-400 dark:focus:bg-slate-800"
                  />
                  {errors.lastName && <p className="mt-2 text-sm text-rose-600 dark:text-rose-300">{errors.lastName.message}</p>}
                </div>
              </div>

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
                  autoComplete="new-password"
                  {...register('password')}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:bg-white dark:border-white/10 dark:bg-slate-800/80 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-cyan-400 dark:focus:bg-slate-800"
                  placeholder="Au moins 6 caractères"
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
                Créer mon compte
              </button>
            </form>

            <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">
              Déjà inscrit ?{' '}
              <Link to="/login" className="font-medium text-cyan-600 hover:text-cyan-700 dark:text-cyan-300 dark:hover:text-cyan-200">
                Se connecter
              </Link>
            </p>
          </section>

          <section className="rounded-3xl bg-gradient-to-br from-cyan-50 to-slate-100 p-8 md:p-10 dark:bg-[linear-gradient(160deg,rgba(34,211,238,0.18),rgba(15,23,42,0.4))]">
            <div className="flex h-full flex-col justify-between rounded-[1.35rem] border border-slate-200 bg-white/60 p-6 dark:border-white/10 dark:bg-slate-800/40">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-cyan-600/80 dark:text-cyan-100/80">Sécurité et confiance</p>
                <h2 className="mt-4 text-3xl font-semibold">Un espace bancaire prêt pour la suite</h2>
                <p className="mt-4 max-w-lg text-sm leading-6 text-slate-500 dark:text-slate-300">
                  Le flux d’inscription prépare un jeton JWT immédiatement exploitable par le dashboard et les appels API sécurisés.
                </p>
              </div>

              <div className="mt-10 grid gap-3 text-sm text-slate-700 dark:text-slate-200 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white/70 p-4 dark:border-white/10 dark:bg-white/5">
                  <div className="text-cyan-600 dark:text-cyan-200">Validation côté client</div>
                  <div className="mt-1 text-slate-500 dark:text-slate-300">Zod et react-hook-form.</div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white/70 p-4 dark:border-white/10 dark:bg-white/5">
                  <div className="text-cyan-600 dark:text-cyan-200">Retour immédiat</div>
                  <div className="mt-1 text-slate-500 dark:text-slate-300">Connexion automatique après création.</div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
export default Register;
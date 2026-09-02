import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../hooks/useAuth';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import axios from 'axios';
import { ADMIN, USER } from '../../constants/roles.constants';
import RequiredAsterisk from '../../components/common/RequiredAsterisk/RequiredAsterisk';

const schema = z.object({
  firstName: z.string().min(2, 'Le prénom est requis'),
  lastName: z.string().min(2, 'Le nom est requis'),
  email: z.string().min(1, 'Email invalide').refine(
    (val) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const localhostRegex = /^[^\s@]+@[^\s@]+$/;
      return emailRegex.test(val) || localhostRegex.test(val);
    },
    'Email invalide'
  ),
  phoneNumber: z.string().min(8, 'Le numéro de téléphone est requis'),
  cin: z.string().min(1, 'Le CIN est requis'),
  dateOfBirth: z.string().optional(),
  nationality: z.string().optional(),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  confirmPassword: z.string(),
  role: z.enum([USER, ADMIN]),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});

type RegisterForm = z.infer<typeof schema>;

const Register = () => {
  const { register: registerUser } = useAuth();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(schema),
    defaultValues: { role: USER },
  });

  const onSubmit = async (data: RegisterForm) => {
    setSubmitError(null);
    setSuccess(null);
    setIsLoading(true);
    try {
      await registerUser(data);
      setSuccess('Compte créé avec succès ! Redirection vers la page de connexion...');
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
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50">
      <div className="flex min-h-screen items-center justify-center px-4 py-8">
        <div className="w-full max-w-lg">
          <div className="rounded-[1.5rem] border border-slate-200 bg-white/80 p-6 shadow-xl backdrop-blur dark:border-white/10 dark:bg-slate-900/70 sm:p-8">
            <div className="mb-6 text-center sm:mb-8">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">Créer un compte</h2>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Renseignez vos informations pour commencer
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="firstName">
                    Prénom
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    autoComplete="given-name"
                    {...register('firstName')}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 dark:border-white/10 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-cyan-400 sm:py-3"
                    placeholder="Jean"
                  />
                  {errors.firstName && <p className="mt-1 text-sm text-rose-600 dark:text-rose-300">{errors.firstName.message}</p>}
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="lastName">
                    Nom
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    autoComplete="family-name"
                    {...register('lastName')}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 dark:border-white/10 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-cyan-400 sm:py-3"
                    placeholder="Dupont"
                  />
                  {errors.lastName && <p className="mt-1 text-sm text-rose-600 dark:text-rose-300">{errors.lastName.message}</p>}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  {...register('email')}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 dark:border-white/10 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-cyan-400 sm:py-3"
                  placeholder="vous@exemple.com"
                />
                {errors.email && <p className="mt-1 text-sm text-rose-600 dark:text-rose-300">{errors.email.message}</p>}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="phoneNumber">
                    Téléphone
                  </label>
                  <input
                    id="phoneNumber"
                    type="tel"
                    {...register('phoneNumber')}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 dark:border-white/10 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-cyan-400 sm:py-3"
                    placeholder="+261 34 00 00 00"
                  />
                  {errors.phoneNumber && <p className="mt-1 text-sm text-rose-600 dark:text-rose-300">{errors.phoneNumber.message}</p>}
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="cin">
                    CIN / Pièce
                  </label>
                  <input
                    id="cin"
                    type="text"
                    {...register('cin')}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 dark:border-white/10 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-cyan-400 sm:py-3"
                    placeholder="123456789012"
                  />
                  {errors.cin && <p className="mt-1 text-sm text-rose-600 dark:text-rose-300">{errors.cin.message}</p>}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="dateOfBirth">
                    Date de naissance
                  </label>
                  <input
                    id="dateOfBirth"
                    type="date"
                    {...register('dateOfBirth')}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 outline-none transition focus:border-cyan-500 dark:border-white/10 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-cyan-400 sm:py-3"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="nationality">
                    Nationalité
                  </label>
                  <input
                    id="nationality"
                    type="text"
                    {...register('nationality')}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 dark:border-white/10 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-cyan-400 sm:py-3"
                    placeholder="Malagasy"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="password">
                    Mot de passe
                  </label>
                  <input
                    id="password"
                    type="password"
                    autoComplete="new-password"
                    {...register('password')}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 dark:border-white/10 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-cyan-400 sm:py-3"
                    placeholder="••••••••"
                  />
                  {errors.password && <p className="mt-1 text-sm text-rose-600 dark:text-rose-300">{errors.password.message}</p>}
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="confirmPassword">
                    Confirmer
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    {...register('confirmPassword')}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 dark:border-white/10 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-cyan-400 sm:py-3"
                    placeholder="••••••••"
                  />
                  {errors.confirmPassword && <p className="mt-1 text-sm text-rose-600 dark:text-rose-300">{errors.confirmPassword.message}</p>}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="role">
                  Type de compte
                </label>
                <select
                  id="role"
                  {...register('role')}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 outline-none transition focus:border-cyan-500 dark:border-white/10 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-cyan-400 sm:py-3"
                >
                  <option value={USER}>Utilisateur</option>
                  <option value={ADMIN}>Administrateur</option>
                </select>
              </div>

              {submitError && (
                <div className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-600 dark:text-rose-200" role="alert">
                  {submitError}
                </div>
              )}
              {success && (
                <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-600 dark:text-emerald-200" role="status">
                  {success}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-xl bg-cyan-500 px-4 py-2.5 font-semibold text-white transition hover:bg-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:ring-offset-2 focus:ring-offset-white disabled:cursor-not-allowed disabled:opacity-60 dark:focus:ring-offset-slate-900 sm:py-3"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                    Création...
                  </span>
                ) : (
                  'Créer mon compte'
                )}
              </button>
            </form>

            <p className="mt-5 text-center text-sm text-slate-500 dark:text-slate-400">
              Déjà inscrit ?{' '}
              <Link to="/login" className="font-medium text-cyan-600 hover:text-cyan-700 dark:text-cyan-300 dark:hover:text-cyan-200">
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;

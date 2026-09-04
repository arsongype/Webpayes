import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../hooks/useAuth';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import axios from 'axios';
import { ADMIN, USER } from '../../constants/roles.constants';
import {
  Loader2,
  Mail,
  Lock,
  User,
  Phone,
  IdCard,
  Globe,
  Calendar,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { LogoMark } from './Login';

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

const inputClass =
  'w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 dark:border-white/10 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-cyan-400 sm:py-3';
const inputClassRight = inputClass.replace('pl-10', 'pl-4 pr-10');

const Register = () => {
  const { register: registerUser } = useAuth();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
    <div className="min-h-full bg-slate-50 px-4 py-8 text-slate-900 sm:px-6 dark:bg-slate-950 dark:text-slate-50">
      <div className="mx-auto flex max-w-2xl flex-col items-center justify-center">
        {/* En-tête avec logo */}
        <div className="mb-6 flex flex-col items-center text-center">
          <LogoMark size="lg" />
          <span className="mt-3 text-xl font-bold tracking-tight">WebPaysh</span>
          <span className="mt-1 inline-flex items-center gap-1.5 rounded-full border border-cyan-200 bg-cyan-50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-cyan-700 dark:border-cyan-500/30 dark:bg-cyan-500/10 dark:text-cyan-300">
            <Sparkles className="h-3 w-3" />
            Rejoignez-nous en 2 minutes
          </span>
        </div>

        {/* Card formulaire */}
        <div className="w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900 sm:p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              Créer un compte
            </h2>
            <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
              Renseignez vos informations pour commencer
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="firstName" label="Prénom" error={errors.firstName?.message}>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="firstName"
                    type="text"
                    autoComplete="given-name"
                    {...register('firstName')}
                    className={inputClass}
                    placeholder="Jean"
                  />
                </div>
              </Field>

              <Field id="lastName" label="Nom" error={errors.lastName?.message}>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="lastName"
                    type="text"
                    autoComplete="family-name"
                    {...register('lastName')}
                    className={inputClass}
                    placeholder="Dupont"
                  />
                </div>
              </Field>
            </div>

            <Field id="email" label="Email" error={errors.email?.message}>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  {...register('email')}
                  className={inputClass}
                  placeholder="vous@exemple.com"
                />
              </div>
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="phoneNumber" label="Téléphone" error={errors.phoneNumber?.message}>
                <div className="relative">
                  <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="phoneNumber"
                    type="tel"
                    {...register('phoneNumber')}
                    className={inputClass}
                    placeholder="+261 34 00 00 00"
                  />
                </div>
              </Field>

              <Field id="cin" label="CIN / Pièce" error={errors.cin?.message}>
                <div className="relative">
                  <IdCard className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="cin"
                    type="text"
                    {...register('cin')}
                    className={inputClass}
                    placeholder="123456789012"
                  />
                </div>
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="dateOfBirth" label="Date de naissance" error={errors.dateOfBirth?.message}>
                <div className="relative">
                  <Calendar className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="dateOfBirth"
                    type="date"
                    {...register('dateOfBirth')}
                    className={inputClass}
                  />
                </div>
              </Field>

              <Field id="nationality" label="Nationalité" error={errors.nationality?.message}>
                <div className="relative">
                  <Globe className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="nationality"
                    type="text"
                    {...register('nationality')}
                    className={inputClass}
                    placeholder="Malagasy"
                  />
                </div>
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="password" label="Mot de passe" error={errors.password?.message}>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    {...register('password')}
                    className={inputClassRight}
                    placeholder="8 caractères min."
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    aria-label={showPassword ? 'Masquer' : 'Afficher'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </Field>

              <Field id="confirmPassword" label="Confirmer" error={errors.confirmPassword?.message}>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    {...register('confirmPassword')}
                    className={inputClassRight}
                    placeholder="Confirmer"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    aria-label={showConfirmPassword ? 'Masquer' : 'Afficher'}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </Field>
            </div>

            <Field id="role" label="Type de compte" error={errors.role?.message}>
              <select
                id="role"
                {...register('role')}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 dark:border-white/10 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-cyan-400 sm:py-3"
              >
                <option value={USER}>Utilisateur</option>
                <option value={ADMIN}>Administrateur</option>
              </select>
            </Field>

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
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-3 font-semibold text-white shadow-md transition hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Création...
                </span>
              ) : (
                <>
                  Créer mon compte
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            Déjà inscrit ?{' '}
            <Link to="/login" className="font-semibold text-cyan-600 hover:text-cyan-700 dark:text-cyan-400">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

const Field = ({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) => (
  <div>
    <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor={id}>
      {label}
    </label>
    {children}
    {error && <p className="mt-1.5 text-sm text-rose-600 dark:text-rose-300">{error}</p>}
  </div>
);

export default Register;

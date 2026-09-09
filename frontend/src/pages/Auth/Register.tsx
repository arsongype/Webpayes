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
} from 'lucide-react';
import newLogo from '../../assets/new-logo-isalosys-610x278.png';

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
  'w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-100 dark:placeholder:text-slate-500 sm:py-3';
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
    <div className="flex min-h-screen">
      {/* Left side - Branding */}
      <div className="relative hidden w-1/2 bg-gradient-to-br from-cyan-500 to-blue-600 lg:flex">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative z-10 flex h-full w-full flex-col items-center justify-center p-12">
          <img src={newLogo} alt="WebPaysh" className="h-40 w-auto object-contain" />
        </div>
        {/* Decorative circles */}
        <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
      </div>

      {/* Right side - Form */}
      <div className="flex w-full items-center justify-center bg-white px-6 py-12 lg:w-1/2 dark:bg-slate-950 dark:text-slate-50">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="mb-8 flex flex-col items-center text-center lg:hidden">
            <img src={newLogo} alt="WebPaysh" className="h-16 w-auto object-contain" />
          </div>

          <div className="hidden lg:mb-8 lg:block">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Créer un compte</h2>
            <p className="mt-2 text-slate-600 dark:text-slate-400">Renseignez vos informations pour commencer</p>
          </div>

          <div className="lg:hidden mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Inscription</h2>
            <p className="mt-1 text-slate-600 dark:text-slate-400">Créez votre compte en quelques étapes</p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="firstName" label="Prénom" error={errors.firstName?.message}>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
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
                  <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
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
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="phoneNumber" label="Téléphone" error={errors.phoneNumber?.message}>
                <div className="relative">
                  <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
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
                  <IdCard className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
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
                  <Calendar className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
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
                  <Globe className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
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
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
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
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                    aria-label={showPassword ? 'Masquer' : 'Afficher'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </Field>

              <Field id="confirmPassword" label="Confirmer" error={errors.confirmPassword?.message}>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
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
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
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
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-100 sm:py-3"
              >
                <option value={USER}>Utilisateur</option>
                <option value={ADMIN}>Administrateur</option>
              </select>
            </Field>

            {submitError && (
              <div className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-600 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200" role="alert">
                {submitError}
              </div>
            )}
            {success && (
              <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200" role="status">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-700 px-4 py-3 font-semibold text-white shadow-lg transition hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Création...
                </span>
              ) : (
                <>
                  Créer mon compte
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-600 dark:text-slate-400">
            Déjà inscrit ?{' '}
            <Link to="/login" className="font-semibold text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300">
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
    {error && <p className="mt-1.5 text-sm text-rose-600">{error}</p>}
  </div>
);

export default Register;

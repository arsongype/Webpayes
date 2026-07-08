import { useLayoutEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const OAuthRedirect = () => {
  const [searchParams] = useSearchParams();
  const { completeOAuthLogin } = useAuth();
  const [message, setMessage] = useState('Connexion Google en cours...');

  useLayoutEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setMessage('Le jeton Google est manquant ou invalide.');
      return;
    }

    try {
      completeOAuthLogin(token);
    } catch {
      setMessage('Impossible de finaliser la connexion Google.');
    }
  }, [completeOAuthLogin, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 text-slate-900 dark:bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.15),transparent_35%),linear-gradient(135deg,#020617_0%,#0f172a_52%,#111827_100%)] dark:text-slate-50">
      <div className="w-full max-w-md rounded-4xl border border-slate-200 bg-white/80 p-8 text-center shadow-xl backdrop-blur dark:border-white/10 dark:bg-slate-900/70">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-cyan-500 text-xl font-bold text-white dark:bg-cyan-400 dark:text-slate-950">
          G
        </div>
        <h1 className="mt-6 text-2xl font-semibold">Finalisation de la session</h1>
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-300">{message}</p>
        <Link
          to="/login"
          className="mt-8 inline-flex rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-cyan-600 transition hover:bg-slate-50 dark:border-white/10 dark:bg-slate-800/80 dark:text-cyan-200 dark:hover:bg-slate-800"
        >
          Retour à la connexion
        </Link>
      </div>
    </div>
  );
};

export default OAuthRedirect;
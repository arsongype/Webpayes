import { Link } from 'react-router-dom';
import { Home, AlertCircle } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 text-slate-900 dark:bg-slate-950 dark:text-slate-50">
      <div className="max-w-md rounded-4xl border border-slate-200 bg-white/80 p-8 text-center shadow-xl backdrop-blur dark:border-white/10 dark:bg-slate-900/70">
        <AlertCircle className="mx-auto h-16 w-16 text-cyan-500 dark:text-cyan-300" />
        <h1 className="mt-6 text-4xl font-semibold">404</h1>
        <p className="mt-2 text-slate-500 dark:text-slate-300">
          La page que vous recherchez n’existe pas ou a été déplacée.
        </p>
        <Link
          to="/dashboard"
          className="mt-6 inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-400"
        >
          <Home size={16} />
          Retour au tableau de bord
        </Link>
      </div>
    </div>
  );
};

export default NotFound;

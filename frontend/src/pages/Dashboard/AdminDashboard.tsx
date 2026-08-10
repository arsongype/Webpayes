import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import accountService from '../../services/accountService';
import userService from '../../services/userService';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Array<{ id: string; accountNumber: string; balance: string; currency: string; userId: string }>>([]);
  const [usersCount, setUsersCount] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const accs = await accountService.list();
        setAccounts(accs);
        const users = await userService.list();
        setUsersCount(users.length);
      } catch {
        // ignore
      }
    };
    load();
  }, []);

  const totalBalance = accounts.reduce((sum, acc) => sum + Number(acc.balance), 0);

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900 sm:px-6 lg:px-8 dark:bg-slate-950 dark:text-slate-50">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-4xl border border-amber-200 bg-white/80 p-8 shadow-xl backdrop-blur dark:border-amber-400/20 dark:bg-slate-900/70">
          <p className="text-sm uppercase tracking-[0.3em] text-amber-600/80 dark:text-amber-300/80">Administration</p>
          <h1 className="mt-4 text-4xl font-semibold">
            Bienvenue, {user?.firstName ?? 'Admin'}
          </h1>
          <p className="mt-4 max-w-2xl text-slate-500 dark:text-slate-300">
            Panneau d'administration — Gérez les utilisateurs, les comptes et surveillez l'activité de la plateforme.
          </p>

          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
            <Link to="/admin/users" className="block rounded-3xl border border-amber-200 bg-amber-500/10 p-6 text-center transition hover:bg-amber-500/20">
              <p className="text-xs uppercase tracking-widest text-amber-600 dark:text-amber-300">Utilisateurs</p>
              <p className="mt-2 text-3xl font-bold text-amber-600 dark:text-amber-300">{usersCount}</p>
            </Link>
            <div className="rounded-3xl border border-cyan-400/30 bg-cyan-500/10 p-6 text-center">
              <p className="text-xs uppercase tracking-widest text-cyan-600 dark:text-cyan-300">Comptes</p>
              <p className="mt-2 text-3xl font-bold text-cyan-600 dark:text-cyan-300">{accounts.length}</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-center dark:border-white/10 dark:bg-slate-800/50">
              <p className="text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400">Solde total</p>
              <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">{totalBalance.toFixed(2)}</p>
            </div>
          </div>

          <div className="mt-8 rounded-4xl border border-slate-200 bg-slate-50 p-6 dark:border-white/10 dark:bg-slate-800/50">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Liste des comptes</h2>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-500 dark:text-slate-400">
                    <th className="pb-3 font-medium">Numéro</th>
                    <th className="pb-3 font-medium">Devise</th>
                    <th className="pb-3 font-medium">Solde</th>
                    <th className="pb-3 font-medium">Utilisateur</th>
                  </tr>
                </thead>
                <tbody>
                  {accounts.map((acc) => (
                    <tr key={acc.id} className="border-t border-slate-200 dark:border-white/10">
                      <td className="py-3 font-mono text-slate-700 dark:text-slate-200">{acc.accountNumber}</td>
                      <td className="py-3 text-slate-700 dark:text-slate-200">{acc.currency}</td>
                      <td className="py-3 font-semibold text-slate-900 dark:text-white">{Number(acc.balance).toFixed(2)}</td>
                      <td className="py-3 text-slate-700 dark:text-slate-200">{acc.userId}</td>
                    </tr>
                  ))}
                  {accounts.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-slate-400 dark:text-slate-500">
                        Aucun compte trouvé
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Link
              to="/dashboard"
              className="inline-flex w-full items-center justify-center rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-400 sm:w-auto"
            >
              Vue utilisateur
            </Link>
           
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

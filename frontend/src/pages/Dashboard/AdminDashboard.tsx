import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useRealtimeBalance } from '../../hooks/useRealtimeBalance';
import accountService from '../../services/accountService';
import userService from '../../services/userService';
import { DollarSign, Users, Wallet, ArrowUpRight, Download } from 'lucide-react';
import { exportTableToPdf } from '../../utils/exportPdf';
import { formatCurrency } from '../../utils/dateFormat';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Array<{ id: string; accountNumber: string; balance: string; currency: string; userId: string }>>([]);
  const [usersCount, setUsersCount] = useState(0);

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

  useEffect(() => {
    load();
  }, []);

  useRealtimeBalance(() => {
    load();
  });

  const totalBalance = accounts.reduce((sum, acc) => sum + Number(acc.balance), 0);

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-6 lg:px-8 dark:bg-slate-950 dark:text-slate-50">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <p className="text-sm font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Administration</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">
            Bienvenue, {user?.firstName ?? 'Admin'}
          </h1>
          <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-300">
            Gérez les utilisateurs, les comptes et surveillez l'activité de la plateforme.
          </p>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Utilisateurs" value={usersCount} icon={Users} accent="cyan" />
          <StatCard label="Comptes" value={accounts.length} icon={Wallet} accent="blue" />
          <StatCard label="Solde total" value={formatCurrency(totalBalance, 'MGA')} icon={DollarSign} accent="emerald" />
          <Link
            to="/dashboard"
            className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center transition hover:border-cyan-400 hover:bg-cyan-50/50 dark:border-white/10 dark:bg-slate-900 dark:hover:border-cyan-500/40"
          >
            <ArrowUpRight className="h-5 w-5 text-slate-400" />
            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Vue utilisateur</span>
          </Link>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5 dark:border-white/5">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Liste des comptes</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Exportez les données au format PDF</p>
            </div>
            <button
              type="button"
              onClick={() =>
                exportTableToPdf({
                  title: 'Liste des comptes',
                  subtitle: `Exporté le ${new Date().toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })}`,
                  columns: [
                    { key: 'accountNumber', label: 'Numéro' },
                    { key: 'currency', label: 'Devise' },
                    { key: 'balance', label: 'Solde' },
                    { key: 'userId', label: 'Utilisateur' },
                  ],
                  rows: accounts.map((acc) => ({
                    accountNumber: acc.accountNumber,
                    currency: acc.currency,
                    balance: `${Number(acc.balance).toFixed(2)}`,
                    userId: acc.userId,
                  })),
                })
              }
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              <Download className="h-4 w-4" />
              Exporter PDF
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 dark:border-white/5 dark:bg-slate-800/40">
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Numéro</th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Devise</th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Solde</th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Utilisateur</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {accounts.map((acc) => (
                  <tr key={acc.id} className="transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/30">
                    <td className="whitespace-nowrap px-6 py-3.5 font-mono text-slate-700 dark:text-slate-200">{acc.accountNumber}</td>
                    <td className="whitespace-nowrap px-6 py-3.5 text-slate-700 dark:text-slate-200">{acc.currency}</td>
                    <td className="whitespace-nowrap px-6 py-3.5 font-semibold tabular-nums text-slate-900 dark:text-white">{formatCurrency(Number(acc.balance), acc.currency)}</td>
                    <td className="whitespace-nowrap px-6 py-3.5 text-slate-700 dark:text-slate-200">{acc.userId}</td>
                  </tr>
                ))}
                {accounts.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-sm text-slate-500 dark:text-slate-400">
                      Aucun compte trouvé
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string | number;
  icon: typeof Users;
  accent: 'cyan' | 'blue' | 'emerald';
}) => {
  const gradients: Record<string, string> = {
    cyan: 'from-cyan-500 to-blue-600',
    blue: 'from-blue-500 to-indigo-600',
    emerald: 'from-emerald-500 to-teal-600',
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-white/10 dark:bg-slate-900">
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${gradients[accent]}`} />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{label}</p>
          <p className="mt-2 text-2xl font-bold tabular-nums tracking-tight text-slate-900 dark:text-white">{value}</p>
        </div>
        <div className={`rounded-xl bg-gradient-to-br ${gradients[accent]} p-2.5 text-white shadow-md`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

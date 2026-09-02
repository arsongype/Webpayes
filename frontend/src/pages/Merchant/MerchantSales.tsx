import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, TrendingUp, DollarSign, Receipt, Calendar } from 'lucide-react';
import api from '../../services/api';

interface SalesData {
  total: number;
  count: number;
  from: string;
  to: string;
}

const MerchantSales = () => {
  const [sales, setSales] = useState<SalesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadSales();
  }, []);

  const loadSales = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/transactions/merchant/sales');
      setSales(response.data);
    } catch {
      setError('Impossible de charger les statistiques de ventes.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'MGA' }).format(value);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900 dark:bg-slate-950 dark:text-slate-50">
      <div className="mx-auto max-w-4xl">
        <Link to="/dashboard" className="mb-6 inline-flex items-center gap-2 text-sm text-cyan-600 hover:text-cyan-700 dark:text-cyan-400">
          <ArrowLeft size={16} /> Retour au tableau de bord
        </Link>

        <div className="rounded-4xl border border-slate-200 bg-white/80 p-8 shadow-xl backdrop-blur dark:border-white/10 dark:bg-slate-900/70">
          <div className="flex items-center gap-3">
            <TrendingUp className="text-cyan-500" size={28} />
            <div>
              <h1 className="text-3xl font-semibold">Mes ventes</h1>
              <p className="text-slate-500 dark:text-slate-300">Suivi de votre chiffre d'affaires</p>
            </div>
          </div>

          {error && (
            <div className="mt-6 rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-600 dark:text-rose-200">
              {error}
            </div>
          )}

          {loading && (
            <div className="mt-8 flex justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />
            </div>
          )}

          {!loading && sales && (
            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 dark:border-white/10 dark:bg-slate-800/50">
                <div className="flex items-center gap-3">
                  <DollarSign className="text-cyan-500" size={24} />
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Chiffre d'affaires</p>
                    <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-white">
                      {formatCurrency(sales.total)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 dark:border-white/10 dark:bg-slate-800/50">
                <div className="flex items-center gap-3">
                  <Receipt className="text-emerald-500" size={24} />
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Nombre de transactions</p>
                    <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-white">
                      {sales.count}
                    </p>
                  </div>
                </div>
              </div>

              <div className="sm:col-span-2 rounded-3xl border border-slate-200 bg-slate-50 p-6 dark:border-white/10 dark:bg-slate-800/50">
                <div className="flex items-center gap-3">
                  <Calendar className="text-amber-500" size={24} />
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Période</p>
                    <p className="mt-1 text-sm font-medium text-slate-900 dark:text-white">
                      Du {formatDate(sales.from)} au {formatDate(sales.to)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-8">
            <button
              onClick={loadSales}
              className="rounded-2xl bg-cyan-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-cyan-400"
            >
              Actualiser
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MerchantSales;

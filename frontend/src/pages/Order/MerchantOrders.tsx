import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import orderService from '../../services/orderService';

const MerchantOrders = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await orderService.listMerchant();
        setOrders(data);
      } catch {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleMarkPaid = async (id: string) => {
    try {
      const updated = await orderService.markAsPaid(id);
      setOrders((prev) => prev.map((o) => o.id === id ? updated : o));
    } catch {
      alert('Erreur.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900 dark:bg-slate-950 dark:text-slate-50">
      <div className="mx-auto max-w-4xl">
        <Link to="/dashboard" className="mb-6 inline-flex items-center gap-2 text-sm text-cyan-600 hover:text-cyan-700 dark:text-cyan-400">
          <ArrowLeft size={16} /> Retour au tableau de bord
        </Link>

        <div className="rounded-4xl border border-slate-200 bg-white/80 p-8 shadow-xl backdrop-blur dark:border-white/10 dark:bg-slate-900/70">
          <h1 className="text-3xl font-semibold">Commandes reçues</h1>
          <p className="mt-2 text-slate-500 dark:text-slate-300">Commandes clients sur vos produits</p>

          {loading && (
            <div className="mt-8 flex justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />
            </div>
          )}

          {!loading && orders.length === 0 && (
            <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center dark:border-white/10 dark:bg-slate-800/50">
              <p className="text-slate-500 dark:text-slate-400">Aucune commande reçue.</p>
            </div>
          )}

          <div className="mt-8 space-y-4">
            {orders.map((o) => (
              <div key={o.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-white/10 dark:bg-slate-800/50">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">{o.productName}</h3>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">Client: {o.buyerName} | Qté: {o.quantity} | Total: {Number(o.totalAmount).toFixed(2)} {o.currency}</p>
                  </div>
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                    o.status === 'PAID' ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300' :
                    o.status === 'CANCELLED' ? 'bg-red-500/15 text-red-600 dark:text-red-300' :
                    'bg-amber-500/15 text-amber-600 dark:text-amber-300'
                  }`}>
                    {o.status}
                  </span>
                </div>
                {o.status === 'PENDING' && (
                  <button
                    onClick={() => handleMarkPaid(o.id)}
                    className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-500/15 px-4 py-2 text-sm font-medium text-emerald-600 transition hover:bg-emerald-500/25"
                  >
                    <CheckCircle size={16} /> Marquer comme payée
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MerchantOrders;

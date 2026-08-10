import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import api from '../services/api';

interface RiskDetail {
  transactionId: string;
  riskScore: number;
  riskLevel: string;
  recommendation: string;
  maxRecommendedAmount: string;
}

const RiskDetail = () => {
  const { transactionId } = useParams<{ transactionId: string }>();
  const [data, setData] = useState<RiskDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!transactionId) return;
      try {
        const response = await api.get(`/ai/risk/score/${transactionId}`);
        setData(response.data);
      } catch {
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [transactionId]);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'HIGH': return 'text-red-600 bg-red-50 dark:text-red-300 dark:bg-red-900/30';
      case 'MEDIUM': return 'text-amber-600 bg-amber-50 dark:text-amber-300 dark:bg-amber-900/30';
      default: return 'text-emerald-600 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-900/30';
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900 sm:px-6 lg:px-8 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-3xl">
        <Link to="/transactions" className="mb-6 inline-flex items-center gap-2 text-sm text-cyan-600 hover:text-cyan-700 dark:text-cyan-400">
          <ArrowLeft size={16} /> Retour aux transactions
        </Link>

        <h1 className="text-3xl font-semibold">Détail du risque</h1>
        <p className="mt-2 text-slate-500 dark:text-slate-300">Transaction : {transactionId}</p>

        {loading && (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-slate-900">
            <p className="text-sm text-slate-500 dark:text-slate-300">Chargement...</p>
          </div>
        )}

        {!loading && !data && (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-12 text-center dark:border-white/10 dark:bg-slate-900">
            <AlertTriangle className="mx-auto text-amber-500" size={40} />
            <p className="mt-4 text-lg font-medium text-slate-900 dark:text-white">Score indisponible</p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">Impossible de récupérer le scoring pour cette transaction.</p>
          </div>
        )}

        {!loading && data && (
          <div className="mt-8 space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield className="text-cyan-500" size={24} />
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-300">Niveau de risque</p>
                    <div className={`mt-1 inline-flex rounded-full px-3 py-1 text-sm font-semibold ${getLevelColor(data.riskLevel)}`}>
                      {data.riskLevel}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-500 dark:text-slate-300">Score</p>
                  <p className="text-2xl font-semibold text-slate-900 dark:text-white">{(data.riskScore * 100).toFixed(0)}%</p>
                </div>
              </div>

              <div className="mt-6">
                <p className="text-sm font-medium text-slate-900 dark:text-white">Recommandation</p>
                <p className="mt-1 flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <CheckCircle className="mt-0.5 text-cyan-500" size={16} />
                  {data.recommendation}
                </p>
              </div>

              <div className="mt-6">
                <p className="text-sm font-medium text-slate-900 dark:text-white">Montant maximum recommandé</p>
                <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">{data.maxRecommendedAmount} MGA</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RiskDetail;

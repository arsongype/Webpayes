import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, Shield, Clock } from 'lucide-react';
import api from '../services/api';

interface FraudAlert {
  transactionId: string;
  isFraudulent: boolean;
  fraudScore: number;
  riskLevel: string;
  recommendation: string;
  details?: Record<string, unknown>;
}

const FraudAlerts = () => {
  const [alerts, setAlerts] = useState<FraudAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAlerts = async () => {
      try {
        const response = await api.get('/ai/fraud/alerts');
        setAlerts(response.data);
      } catch {
        setAlerts([]);
      } finally {
        setLoading(false);
      }
    };
    loadAlerts();
  }, []);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'HIGH': return 'text-red-600 bg-red-50 dark:text-red-300 dark:bg-red-900/30';
      case 'MEDIUM': return 'text-amber-600 bg-amber-50 dark:text-amber-300 dark:bg-amber-900/30';
      default: return 'text-emerald-600 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-900/30';
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900 sm:px-6 lg:px-8 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-4xl">
        <Link to="/dashboard" className="mb-6 inline-flex items-center gap-2 text-sm text-cyan-600 hover:text-cyan-700 dark:text-cyan-400">
          <ArrowLeft size={16} /> Retour au tableau de bord
        </Link>

        <div className="flex items-center gap-3">
          <AlertTriangle className="text-amber-500" size={28} />
          <div>
            <h1 className="text-3xl font-semibold">Alertes fraude</h1>
            <p className="text-slate-500 dark:text-slate-300">Dernières transactions analysées par le moteur de détection.</p>
          </div>
        </div>

        <div className="mt-8 space-y-4">
          {loading && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-slate-900">
              <p className="text-sm text-slate-500 dark:text-slate-300">Chargement...</p>
            </div>
          )}

          {!loading && alerts.length === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center dark:border-white/10 dark:bg-slate-900">
              <Shield className="mx-auto text-cyan-500" size={40} />
              <p className="mt-4 text-lg font-medium text-slate-900 dark:text-white">Aucune alerte pour le moment</p>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">Le système de détection de fraude n'a signalé aucune activité suspecte.</p>
            </div>
          )}

          {alerts.map((alert) => (
            <div key={alert.transactionId} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`rounded-full px-3 py-1 text-xs font-semibold ${getLevelColor(alert.riskLevel)}`}>
                    {alert.riskLevel}
                  </div>
                  <span className="text-sm font-medium text-slate-900 dark:text-white">
                    Transaction {alert.transactionId}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <Clock size={14} />
                  <span>Score: {(alert.fraudScore * 100).toFixed(0)}%</span>
                </div>
              </div>

              <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{alert.recommendation}</p>

              {alert.details && Object.keys(alert.details).length > 0 && (
                <div className="mt-3 rounded-xl bg-slate-50 p-3 text-xs text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
                  <pre className="whitespace-pre-wrap">{JSON.stringify(alert.details, null, 2)}</pre>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FraudAlerts;

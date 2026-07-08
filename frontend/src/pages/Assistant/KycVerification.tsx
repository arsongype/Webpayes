import { useState } from 'react';
import api from '../../services/api';
import type { KycVerificationResponse, KycStatus } from '../../types/kyc.types';

const KycVerification = () => {
  const [form, setForm] = useState({
    full_name: '',
    date_of_birth: '',
    nationality: '',
  });
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<KycVerificationResponse | null>(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      let imageBase64: string | undefined;
      if (file) {
        imageBase64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      }

      const payload = {
        user_id: 'current-user',
        id_document_image: imageBase64,
        ...form,
      };

      const response = await api.post('/ai/kyc/verify', payload);
      setResult(response.data);
    } catch {
      setError('Erreur lors de la vérification KYC. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const statusLabel: Record<KycStatus, string> = {
    en_attente: 'En attente',
    valide: 'Validé',
    rejete: 'Rejeté',
  };

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900 sm:px-6 lg:px-8 dark:bg-slate-950 dark:text-slate-50">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-semibold">Vérification d'identité (KYC)</h1>
        <p className="mt-2 text-slate-500 dark:text-slate-300">
          Téléchargez votre pièce d'identité pour vérifier votre compte.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6 rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-xl backdrop-blur dark:border-white/10 dark:bg-slate-900/70">
          <div>
            <label className="block text-sm font-medium">Nom complet</label>
            <input
              type="text"
              required
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              className="mt-1 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 dark:border-white/10 dark:bg-slate-800/80 dark:text-slate-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Date de naissance</label>
            <input
              type="date"
              required
              value={form.date_of_birth}
              onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })}
              className="mt-1 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 dark:border-white/10 dark:bg-slate-800/80 dark:text-slate-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Nationalité</label>
            <input
              type="text"
              required
              value={form.nationality}
              onChange={(e) => setForm({ ...form, nationality: e.target.value })}
              className="mt-1 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 dark:border-white/10 dark:bg-slate-800/80 dark:text-slate-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Pièce d'identité (image)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="mt-1 block w-full text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-cyan-500 px-6 py-3 font-semibold text-white transition hover:bg-cyan-400 disabled:opacity-50"
          >
            {loading ? 'Vérification en cours...' : 'Soumettre la vérification'}
          </button>
        </form>

        {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

        {result && (
          <div className="mt-8 rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-xl backdrop-blur dark:border-white/10 dark:bg-slate-900/70">
            <h2 className="text-xl font-semibold">Résultat de la vérification</h2>
            <div className="mt-4 space-y-2 text-sm">
              <p><strong>ID:</strong> {result.verification_id}</p>
              <p><strong>Statut:</strong> {statusLabel[result.status]}</p>
              {result.confidence_score !== undefined && (
                <p><strong>Score de confiance:</strong> {(result.confidence_score * 100).toFixed(0)}%</p>
              )}
              {result.extracted_data && (
                <div>
                  <strong>Données extraites:</strong>
                  <pre className="mt-2 overflow-x-auto rounded-xl bg-slate-100 p-3 text-xs dark:bg-slate-800">
                    {JSON.stringify(result.extracted_data, null, 2)}
                  </pre>
                </div>
              )}
              {result.rejection_reason && (
                <p className="text-red-500"><strong>Motif:</strong> {result.rejection_reason}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default KycVerification;

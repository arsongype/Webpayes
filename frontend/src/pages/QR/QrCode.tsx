import { useState } from 'react';
import api from '../../services/api';

interface QrGenerateRequest {
  merchantName: string;
  accountNumber: string;
  amount?: string;
  currency?: string;
  description?: string;
}

const QrCode = () => {
  const [form, setForm] = useState<QrGenerateRequest>({
    merchantName: '',
    accountNumber: '',
    amount: '',
    currency: 'MGA',
    description: '',
  });
  const [qrResult, setQrResult] = useState<{ qrDataUrl: string; paymentReference: string } | null>(null);
  const [scanInput, setScanInput] = useState('');
  const [scanResult, setScanResult] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setQrResult(null);
    try {
      const response = await api.post('/qr/generate', {
        merchantName: form.merchantName,
        accountNumber: form.accountNumber,
        amount: form.amount ? parseFloat(form.amount) : undefined,
        currency: form.currency || 'MGA',
        description: form.description,
      });
      setQrResult({
        qrDataUrl: response.data.qrDataUrl,
        paymentReference: response.data.paymentReference,
      });
    } catch {
      setError('Impossible de générer le QR Code.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!qrResult) return;
    try {
      const response = await api.post('/qr/generate/pdf', {
        merchantName: form.merchantName,
        accountNumber: form.accountNumber,
        amount: form.amount ? parseFloat(form.amount) : undefined,
        currency: form.currency || 'MGA',
        description: form.description,
      }, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'qr-payment.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      setError('Impossible de télécharger le PDF.');
    }
  };

  const handleValidate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setScanResult(null);
    try {
      const response = await api.post('/qr/validate', {
        qrData: scanInput,
        senderAccountId: '',
      });
      setScanResult(response.data);
    } catch {
      setError('QR Code invalide ou erreur lors de la validation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900 sm:px-6 lg:px-8 dark:bg-slate-950 dark:text-slate-50">
      <div className="mx-auto max-w-4xl space-y-8">
        <div>
          <h1 className="text-3xl font-semibold">Paiement par QR Code</h1>
          <p className="mt-2 text-slate-500 dark:text-slate-300">Générez un QR Code de paiement ou scannez-en un pour effectuer un paiement.</p>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-600 dark:text-red-200">
            {error}
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-4xl border border-slate-200 bg-white/80 p-6 shadow-xl backdrop-blur dark:border-white/10 dark:bg-slate-900/70">
            <h2 className="text-xl font-semibold">Générer un QR Code</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">Pour les commerçants</p>
            <form onSubmit={handleGenerate} className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium">Nom du commerçant</label>
                <input
                  type="text"
                  required
                  value={form.merchantName}
                  onChange={(e) => setForm({ ...form, merchantName: e.target.value })}
                  className="mt-1 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 dark:border-white/10 dark:bg-slate-800/80 dark:text-slate-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Numéro de compte</label>
                <input
                  type="text"
                  required
                  value={form.accountNumber}
                  onChange={(e) => setForm({ ...form, accountNumber: e.target.value })}
                  className="mt-1 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 dark:border-white/10 dark:bg-slate-800/80 dark:text-slate-100"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium">Montant (optionnel)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    className="mt-1 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 dark:border-white/10 dark:bg-slate-800/80 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Devise</label>
                  <input
                    type="text"
                    value={form.currency}
                    onChange={(e) => setForm({ ...form, currency: e.target.value })}
                    className="mt-1 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 dark:border-white/10 dark:bg-slate-800/80 dark:text-slate-100"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium">Description</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="mt-1 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 dark:border-white/10 dark:bg-slate-800/80 dark:text-slate-100"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-cyan-500 px-6 py-3 font-semibold text-white transition hover:bg-cyan-400 disabled:opacity-50"
              >
                {loading ? 'Génération...' : 'Générer le QR Code'}
              </button>
            </form>

            {qrResult && (
              <div className="mt-6 flex flex-col items-center space-y-3">
                <img src={qrResult.qrDataUrl} alt="QR Code" className="rounded-2xl border border-slate-200 p-2 dark:border-white/10" />
                <p className="text-xs text-slate-500 dark:text-slate-400">Référence: {qrResult.paymentReference}</p>
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  className="rounded-2xl bg-emerald-500 px-6 py-3 font-semibold text-white transition hover:bg-emerald-400"
                >
                  Télécharger le PDF
                </button>
              </div>
            )}
          </div>

          <div className="rounded-4xl border border-slate-200 bg-white/80 p-6 shadow-xl backdrop-blur dark:border-white/10 dark:bg-slate-900/70">
            <h2 className="text-xl font-semibold">Scanner / Valider un QR Code</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">Pour les clients</p>
            <form onSubmit={handleValidate} className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium">Données du QR Code</label>
                <textarea
                  required
                  rows={4}
                  value={scanInput}
                  onChange={(e) => setScanInput(e.target.value)}
                  placeholder="Collez ici les données du QR Code scanné..."
                  className="mt-1 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 dark:border-white/10 dark:bg-slate-800/80 dark:text-slate-100"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-cyan-500 px-6 py-3 font-semibold text-white transition hover:bg-cyan-400 disabled:opacity-50"
              >
                {loading ? 'Validation...' : 'Valider le QR Code'}
              </button>
            </form>

            {scanResult && (
              <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm dark:border-white/10 dark:bg-slate-800/50">
                <h3 className="font-semibold">Détails du paiement</h3>
                <div className="mt-2 space-y-1">
                  <p><strong>Référence:</strong> {String(scanResult.reference)}</p>
                  <p><strong>Commerçant:</strong> {String(scanResult.merchantName)}</p>
                  <p><strong>Compte:</strong> {String(scanResult.accountNumber)}</p>
                  <p><strong>Montant:</strong> {String(scanResult.amount)} {String(scanResult.currency)}</p>
                  <p><strong>Description:</strong> {String(scanResult.description)}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QrCode;

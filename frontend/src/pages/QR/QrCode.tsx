import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
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
  const [scanning, setScanning] = useState(false);
  const [scanMode, setScanMode] = useState<'camera' | 'file' | 'manual'>('manual');
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

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

  const startCameraScan = async () => {
    setError('');
    setScanResult(null);
    setScanning(true);
    try {
      const html5QrCode = new Html5Qrcode('qr-reader');
      scannerRef.current = html5QrCode;
      await html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          setScanInput(decodedText);
          handleScanValidate(decodedText);
          html5QrCode.stop().catch(() => {});
          setScanning(false);
        },
        () => {}
      );
    } catch {
      setError('Impossible d\'accéder à la caméra. Vérifiez les permissions.');
      setScanning(false);
    }
  };

  const stopCameraScan = async () => {
    if (scannerRef.current) {
      await scannerRef.current.stop().catch(() => {});
      scannerRef.current = null;
    }
    setScanning(false);
  };

  const handleFileScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    setScanResult(null);
    try {
      const html5QrCode = new Html5Qrcode('qr-reader');
      scannerRef.current = html5QrCode;
      const decodedText = await html5QrCode.scanFile(file, true);
      setScanInput(decodedText);
      handleScanValidate(decodedText);
    } catch {
      setError('Impossible de lire le QR Code depuis l\'image.');
    } finally {
      if (scannerRef.current) {
        scannerRef.current.clear();
        scannerRef.current = null;
      }
    }
  };

  const handleScanValidate = async (qrData: string) => {
    setLoading(true);
    setError('');
    setScanResult(null);
    try {
      const response = await api.post('/qr/validate', {
        qrData,
        senderAccountId: '',
      });
      setScanResult(response.data);
    } catch {
      setError('QR Code invalide ou erreur lors de la validation.');
    } finally {
      setLoading(false);
    }
  };

  const handleManualValidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scanInput.trim()) return;
    await handleScanValidate(scanInput);
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

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setScanMode('camera')}
                className={`rounded-2xl px-4 py-2 text-sm font-medium transition ${scanMode === 'camera' ? 'bg-cyan-500 text-white' : 'border border-slate-300 text-slate-700 dark:border-white/10 dark:text-slate-300'}`}
              >
                Caméra
              </button>
              <button
                type="button"
                onClick={() => setScanMode('file')}
                className={`rounded-2xl px-4 py-2 text-sm font-medium transition ${scanMode === 'file' ? 'bg-cyan-500 text-white' : 'border border-slate-300 text-slate-700 dark:border-white/10 dark:text-slate-300'}`}
              >
                Image
              </button>
              <button
                type="button"
                onClick={() => setScanMode('manual')}
                className={`rounded-2xl px-4 py-2 text-sm font-medium transition ${scanMode === 'manual' ? 'bg-cyan-500 text-white' : 'border border-slate-300 text-slate-700 dark:border-white/10 dark:text-slate-300'}`}
              >
                Manuel
              </button>
            </div>

            <div className="mt-4">
              {scanMode === 'camera' && (
                <div>
                  <div id="qr-reader" className="rounded-2xl overflow-hidden" />
                  {!scanning ? (
                    <button
                      type="button"
                      onClick={startCameraScan}
                      className="mt-4 w-full rounded-2xl bg-cyan-500 px-6 py-3 font-semibold text-white transition hover:bg-cyan-400"
                    >
                      Activer la caméra
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={stopCameraScan}
                      className="mt-4 w-full rounded-2xl bg-rose-500 px-6 py-3 font-semibold text-white transition hover:bg-rose-400"
                    >
                      Arrêter le scan
                    </button>
                  )}
                </div>
              )}

              {scanMode === 'file' && (
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileScan}
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 dark:border-white/10 dark:bg-slate-800/80 dark:text-slate-100"
                  />
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Sélectionnez une image contenant un QR Code.</p>
                </div>
              )}

              {scanMode === 'manual' && (
                <form onSubmit={handleManualValidate} className="space-y-4">
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
              )}
            </div>

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

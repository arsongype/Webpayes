import { useState } from 'react';
import { CreditCard, Smartphone, Landmark, ShieldCheck, RefreshCw, Check, ArrowLeftRight } from 'lucide-react';
import paymentService, { type PaymentMethodType, type PaymentProvider, type PaymentResponse, PROVIDER_LABELS } from '../../services/paymentService';
import { useAuth } from '../../hooks/useAuth';

const PaymentPage = () => {
  const { user } = useAuth();
  const [activeMethod, setActiveMethod] = useState<PaymentMethodType>('CARD');
  const [paymentResult, setPaymentResult] = useState<PaymentResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [pan, setPan] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cardHolderName, setCardHolderName] = useState('');
  const [panTouched, setPanTouched] = useState(false);

  const [mmPhone, setMmPhone] = useState('');
  const [mmOperator, setMmOperator] = useState<string>('ORANGE_MONEY_CI');
  const [mmPhoneTouched, setMmPhoneTouched] = useState(false);

  const [destAccount, setDestAccount] = useState('');
  const [destTouched, setDestTouched] = useState(false);

  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('EUR');
  const [amountTouched, setAmountTouched] = useState(false);

  const [token, setToken] = useState<string | null>(null);

  const formatCardNumber = (value: string) => {
    return value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim();
  };

  const handleTokenizeCard = async () => {
    setMessage(null);
    setPanTouched(true);
    if (!pan.replace(/\s/g, '').trim() || !expiry || !cardHolderName) {
      setMessage({ type: 'error', text: 'Veuillez remplir tous les champs de la carte.' });
      return;
    }
    const [yearStr, monthStr] = expiry.split('-');
    const expiryMonth = monthStr;
    const expiryYear = yearStr.slice(-2);
    setLoading(true);
    try {
      const data = await paymentService.tokenizeCard({
        pan: pan.replace(/\s/g, ''),
        expiryMonth,
        expiryYear,
        cardHolderName,
      });
      setToken(data.token);
      setMessage({ type: 'success', text: data.message });
    } catch {
      setMessage({ type: 'error', text: 'Échec de la tokenisation de la carte.' });
    } finally {
      setLoading(false);
    }
  };

  const handleProcessPayment = async () => {
    setMessage(null);
    setAmountTouched(true);
    if (!amount || parseFloat(amount) <= 0) {
      setMessage({ type: 'error', text: 'Veuillez saisir un montant valide.' });
      return;
    }

    if (activeMethod === 'CARD' && !token) {
      setMessage({ type: 'error', text: 'Veuillez d\'abord tokeniser votre carte.' });
      return;
    }

    if (activeMethod === 'MOBILE_MONEY') {
      setMmPhoneTouched(true);
      if (!mmPhone || !mmPhone.trim()) {
        setMessage({ type: 'error', text: 'Veuillez saisir votre numéro de téléphone.' });
        return;
      }
    }

    if (activeMethod === 'BANK_TRANSFER') {
      setDestTouched(true);
      if (!destAccount || !destAccount.trim()) {
        setMessage({ type: 'error', text: 'Veuillez saisir le compte de destination.' });
        return;
      }
    }

    setLoading(true);
    try {
      const result = await paymentService.processPayment({
        token: token ?? '',
        paymentMethod: activeMethod,
        amount: parseFloat(amount),
        currency,
        cardHolderName: cardHolderName || undefined,
        mobileMoneyPhone: mmPhone || undefined,
        mobileMoneyOperator: mmOperator || undefined,
        destinationAccount: destAccount || undefined,
      });
      setPaymentResult(result);
      setMessage({ type: result.success ? 'success' : 'error', text: result.message });
    } catch {
      setMessage({ type: 'error', text: 'Échec du paiement.' });
    } finally {
      setLoading(false);
    }
  };

  const resetPayment = () => {
    setPaymentResult(null);
    setMessage(null);
    setPan('');
    setExpiry('');
    setCardHolderName('');
    setMmPhone('');
    setDestAccount('');
    setAmount('');
    setToken(null);
    setPanTouched(false);
    setMmPhoneTouched(false);
    setDestTouched(false);
    setAmountTouched(false);
    setActiveMethod('CARD');
  };

  const getProviderLabel = (p?: PaymentProvider) => {
    if (!p) return '';
    return PROVIDER_LABELS[p] || p;
  };

  const tabs = [
    { key: 'CARD', label: 'Carte', icon: CreditCard },
    { key: 'MOBILE_MONEY', label: 'Mobile Money', icon: Smartphone },
    { key: 'BANK_TRANSFER', label: 'Virement', icon: Landmark },
  ];

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 dark:bg-slate-950 dark:text-slate-50 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-lg">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">Paiement sécurisé</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {user ? `${user.firstName} ${user.lastName}` : 'Client'} — Payez en toute sécurité.
            </p>
          </div>
          <div className="rounded-full bg-emerald-100 p-2 dark:bg-emerald-900/30">
            <ShieldCheck className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
          </div>
        </div>

        {message && (
          <div
            className={`mb-4 rounded-xl border px-4 py-3 text-sm ${
              message.type === 'success'
                ? 'border-emerald-400/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-200'
                : 'border-rose-400/30 bg-rose-500/10 text-rose-600 dark:text-rose-200'
            }`}
            role="alert"
          >
            {message.text}
          </div>
        )}

        {!paymentResult ? (
          <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow dark:border-white/10 dark:bg-slate-900 sm:p-6">
            <div className="flex items-center gap-1.5 rounded-xl bg-slate-100 p-1.5 dark:bg-slate-800/50">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => { setActiveMethod(tab.key as PaymentMethodType); setMessage(null); }}
                    className={`relative flex-1 rounded-lg px-2 py-1.5 text-xs font-semibold transition-all ${
                      activeMethod === tab.key
                        ? 'bg-cyan-500 text-white shadow'
                        : 'text-slate-600 hover:text-slate-800 dark:text-slate-300 dark:hover:text-slate-100'
                    }`}
                  >
                    <Icon size={14} className="mb-0.5 mr-0.5 inline" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-600 dark:text-slate-300">
                  Montant
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    onBlur={() => setAmountTouched(true)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 outline-none focus:border-cyan-500 dark:border-white/10 dark:bg-slate-800 dark:text-slate-100 sm:py-3"
                    placeholder="0.00"
                    required
                  />
                  {amountTouched && (parseFloat(amount) <= 0 || !amount) && (
                    <p className="mt-1 text-sm text-red-500">Montant requis</p>
                  )}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-600 dark:text-slate-300">Devise</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 outline-none focus:border-cyan-500 dark:border-white/10 dark:bg-slate-800 dark:text-slate-100 sm:py-3"
                >
                  <option value="EUR">EUR - Euro</option>
                  <option value="USD">USD - Dollar US</option>
                  <option value="XOF">XOF - Franc CFA</option>
                  <option value="XAF">XAF - Franc CFA (Cameroun)</option>
                </select>
              </div>

              {activeMethod === 'CARD' && (
                <>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-600 dark:text-slate-300">
                      Numéro de carte
                    </label>
                    <input
                      type="text"
                      value={pan}
                      onChange={(e) => setPan(formatCardNumber(e.target.value))}
                      onBlur={() => setPanTouched(true)}
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 font-mono text-slate-900 outline-none focus:border-cyan-500 dark:border-white/10 dark:bg-slate-800 dark:text-slate-100 sm:py-3"
                      placeholder="4111 1111 1111 1111"
                      maxLength={19}
                      required
                    />
                    {panTouched && !pan.trim() && (
                      <p className="mt-1 text-sm text-red-500">Champ requis</p>
                    )}
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-600 dark:text-slate-300">
                      Date d'expiration
                    </label>
                    <input
                      type="date"
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                      onBlur={() => setPanTouched(true)}
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 outline-none focus:border-cyan-500 dark:border-white/10 dark:bg-slate-800 dark:text-slate-100 sm:py-3"
                      required
                    />
                    {panTouched && !expiry && (
                      <p className="mt-1 text-sm text-red-500">Champ requis</p>
                    )}
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-600 dark:text-slate-300">Titulaire</label>
                    <input
                      type="text"
                      value={cardHolderName}
                      onChange={(e) => setCardHolderName(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 outline-none focus:border-cyan-500 dark:border-white/10 dark:bg-slate-800 dark:text-slate-100 sm:py-3"
                      placeholder="Nom Prénom"
                      required
                    />
                  </div>

                  {token && (
                    <div className="flex items-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-200">
                      <Check className="h-4 w-4 flex-shrink-0" />
                      <span>Carte tokenisée (PCI-DSS Vault).</span>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleTokenizeCard}
                    disabled={loading}
                    className="w-full rounded-xl bg-cyan-500 px-4 py-2.5 font-semibold text-white transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60 sm:py-3"
                  >
                    {loading ? 'Tokenisation...' : 'Tokeniser la carte (PCI-DSS Vault)'}
                  </button>
                </>
              )}

              {activeMethod === 'MOBILE_MONEY' && (
                <>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-600 dark:text-slate-300">
                      Numéro de téléphone
                    </label>
                    <input
                      type="tel"
                      value={mmPhone}
                      onChange={(e) => setMmPhone(e.target.value)}
                      onBlur={() => setMmPhoneTouched(true)}
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 font-mono text-slate-900 outline-none focus:border-cyan-500 dark:border-white/10 dark:bg-slate-800 dark:text-slate-100 sm:py-3"
                      placeholder="+225 07 01 02 03"
                      required
                    />
                    {mmPhoneTouched && !mmPhone.trim() && (
                      <p className="mt-1 text-sm text-red-500">Champ requis</p>
                    )}
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-600 dark:text-slate-300">Opérateur</label>
                    <select
                      value={mmOperator}
                      onChange={(e) => setMmOperator(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 outline-none focus:border-cyan-500 dark:border-white/10 dark:bg-slate-800 dark:text-slate-100 sm:py-3"
                    >
                      <option value="ORANGE_MONEY_CI">Orange Money</option>
                      <option value="MTN_MOBILE_MONEY">MTN Mobile Money</option>
                      <option value="MPESA_KENYA">M-Pesa Kenya</option>
                      <option value="MPESA_TANZANIA">M-Pesa Tanzanie</option>
                    </select>
                  </div>
                </>
              )}

              {activeMethod === 'BANK_TRANSFER' && (
                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-300">
                    <ArrowLeftRight className="h-4 w-4" />
                    Compte de destination
                  </label>
                  <input
                    type="text"
                    value={destAccount}
                    onChange={(e) => setDestAccount(e.target.value)}
                    onBlur={() => setDestTouched(true)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 font-mono text-slate-900 outline-none focus:border-cyan-500 dark:border-white/10 dark:bg-slate-800 dark:text-slate-100 sm:py-3"
                    placeholder="FR76 1234 5678 9012 3456 7890 123"
                    required
                  />
                  {destTouched && !destAccount.trim() && (
                    <p className="mt-1 text-sm text-red-500">Champ requis</p>
                  )}
                </div>
              )}

              <button
                type="button"
                onClick={handleProcessPayment}
                disabled={loading}
                className="w-full rounded-xl bg-cyan-500 px-4 py-2.5 font-semibold text-white transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60 sm:py-3"
              >
                {loading ? 'Traitement...' : 'Procéder au paiement'}
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow dark:border-white/10 dark:bg-slate-900 sm:p-8">
            <div className="text-center">
              <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${
                paymentResult?.success
                  ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300'
                  : 'bg-rose-500/20 text-rose-600 dark:text-rose-300'
              }`}>
                {paymentResult?.success ? <ShieldCheck className="h-8 w-8" /> : <RefreshCw className="h-8 w-8" />}
              </div>
              <h2 className={`mb-2 text-2xl font-bold ${
                paymentResult?.success ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'
              }`}>
                {paymentResult?.success ? 'Paiement réussi' : 'Paiement échoué'}
              </h2>
              <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">{paymentResult?.message}</p>
              <div className="mb-6 grid grid-cols-2 gap-3 text-left text-sm">
                <div><span className="font-medium text-slate-500 dark:text-slate-400">Référence :</span> {paymentResult?.transactionReference}</div>
                <div><span className="font-medium text-slate-500 dark:text-slate-400">Statut :</span> {paymentResult?.status}</div>
                <div><span className="font-medium text-slate-500 dark:text-slate-400">Montant :</span> {paymentResult?.amount} {paymentResult?.currency}</div>
                <div><span className="font-medium text-slate-500 dark:text-slate-400">Provider :</span> {getProviderLabel(paymentResult?.provider)}</div>
                {paymentResult?.externalTransactionId && (
                  <div className="col-span-2">
                    <span className="font-medium text-slate-500 dark:text-slate-400">ID externe :</span> <span className="font-mono text-xs">{paymentResult.externalTransactionId}</span>
                  </div>
                )}
                {paymentResult?.riskScore !== undefined && (
                  <div className="col-span-2">
                    <span className="font-medium text-slate-500 dark:text-slate-400">Score IA fraude :</span>
                    <span className={`font-bold ${
                      (paymentResult.riskScore ?? 0) >= 0.8 ? 'text-rose-600' :
                      (paymentResult.riskScore ?? 0) >= 0.5 ? 'text-amber-600' : 'text-emerald-600'
                    }`}>{(paymentResult.riskScore * 100).toFixed(1)}%</span>
                    <span className={`ml-2 text-xs uppercase ${
                      paymentResult.riskLevel === 'HIGH' ? 'text-rose-600' :
                      paymentResult.riskLevel === 'MEDIUM' ? 'text-amber-600' : 'text-emerald-600'
                    }`}>[{paymentResult.riskLevel}]</span>
                  </div>
                )}
                {paymentResult?.threeDsRequired && (
                  <div className="col-span-2">
                    <span className="font-medium text-slate-500 dark:text-slate-400">3DS2 :</span>
                    <span className="text-amber-600">Challenge requis</span>
                  </div>
                )}
                {paymentResult?.fraudRecommendation && (
                  <div className="col-span-2">
                    <span className="font-medium text-slate-500 dark:text-slate-400">Recommandation IA :</span>
                    <span className="text-xs">{paymentResult.fraudRecommendation}</span>
                  </div>
                )}
              </div>
              <button
                onClick={resetPayment}
                className="w-full rounded-xl bg-slate-200 px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
              >
                Nouveau paiement
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentPage;

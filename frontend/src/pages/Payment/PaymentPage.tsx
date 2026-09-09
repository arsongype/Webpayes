import { useState, useMemo, type ReactNode } from 'react';
import {
  CreditCard,
  Smartphone,
  Landmark,
  ShieldCheck,
  RefreshCw,
  ArrowLeftRight,
  Lock,
  Check,
  X,
  Sparkles,
  Copy,
  AlertCircle,
  Info,
} from 'lucide-react';
import paymentService, {
  type PaymentMethodType,
  type PaymentProvider,
  type PaymentResponse,
  PROVIDER_LABELS,
} from '../../services/paymentService';
import { useAuth } from '../../hooks/useAuth';

const PaymentPage = () => {
  const { user } = useAuth();
  const [activeMethod, setActiveMethod] = useState<PaymentMethodType>('CARD');
  const [paymentResult, setPaymentResult] = useState<PaymentResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copied, setCopied] = useState(false);

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
      setMessage({ type: 'error', text: "Veuillez d'abord tokeniser votre carte." });
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
    } catch (error) {
      const text = error instanceof Error ? error.message : 'Échec du paiement.';
      setMessage({ type: 'error', text });
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
    setCopied(false);
  };

  const getProviderLabel = (p?: PaymentProvider) => {
    if (!p) return '';
    return PROVIDER_LABELS[p] || p;
  };

  const copyReference = () => {
    if (paymentResult?.transactionReference) {
      navigator.clipboard.writeText(paymentResult.transactionReference);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const tabs = [
    { key: 'CARD', label: 'Carte bancaire', icon: CreditCard, description: 'Visa, Mastercard, CB' },
    { key: 'MOBILE_MONEY', label: 'Mobile Money', icon: Smartphone, description: 'Orange, MTN, M-Pesa' },
    { key: 'BANK_TRANSFER', label: 'Virement', icon: Landmark, description: 'SEPA, IBAN' },
  ];

  // Détection du type de carte pour l'aperçu
  const cardBrand = useMemo(() => {
    const clean = pan.replace(/\s/g, '');
    if (clean.startsWith('4')) return 'VISA';
    if (clean.startsWith('5') || clean.startsWith('2')) return 'MASTERCARD';
    if (clean.startsWith('3')) return 'AMEX';
    return 'CARTE';
  }, [pan]);

  const formattedAmount = useMemo(() => {
    const n = parseFloat(amount);
    if (isNaN(n) || n <= 0) return '0.00';
    return new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
  }, [amount]);

  const cardGradient = useMemo(() => {
    switch (cardBrand) {
      case 'VISA':
        return 'from-indigo-700 via-blue-700 to-cyan-600';
      case 'MASTERCARD':
        return 'from-rose-600 via-orange-500 to-amber-500';
      case 'AMEX':
        return 'from-emerald-600 via-teal-600 to-cyan-700';
      default:
        return 'from-slate-800 via-slate-900 to-slate-950';
    }
  }, [cardBrand]);

  return (
    <div className="bg-slate-100 px-4 py-8 text-slate-900 dark:bg-slate-950 dark:text-slate-50 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* En-tête moderne */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 opacity-30 blur-xl" />
              <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg">
                <Lock className="h-6 w-6" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Paiement sécurisé</h1>
                <Sparkles className="h-5 w-5 text-amber-500" />
              </div>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {user ? `${user.firstName} ${user.lastName}` : 'Client'} · Transactions chiffrées 3D-Secure
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-start rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300 sm:self-auto">
            <ShieldCheck className="h-4 w-4" />
            <span>Connexion sécurisée TLS 1.3</span>
          </div>
        </div>

        {message && !paymentResult && (
          <div
            className={`mb-6 flex items-center gap-3 rounded-xl border px-4 py-3 text-sm shadow-sm ${
              message.type === 'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300'
                : 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300'
            }`}
            role="alert"
          >
            {message.type === 'success' ? (
              <Check className="h-5 w-5 flex-shrink-0" />
            ) : (
              <X className="h-5 w-5 flex-shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {!paymentResult ? (
          <div className="grid gap-6 lg:grid-cols-5">
            {/* COLONNE GAUCHE — Aperçu carte + récapitulatif */}
            <div className="space-y-4 lg:col-span-2">
              {/* Aperçu carte bancaire 3D */}
              <div
                className={`relative h-56 w-full overflow-hidden rounded-3xl bg-gradient-to-br ${cardGradient} p-6 text-white shadow-2xl transition-all duration-500`}
              >
                {/* Effets décoratifs */}
                <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
                <div className="absolute -bottom-12 -left-8 h-32 w-32 rounded-full bg-white/5 blur-xl" />
                <div
                  className="absolute inset-0 opacity-30"
                  style={{
                    backgroundImage:
                      'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,.03) 10px, rgba(255,255,255,.03) 20px)',
                  }}
                />

                <div className="relative flex h-full flex-col justify-between">
                  <div className="flex items-start justify-between">
                    <div className="text-xs font-medium uppercase tracking-widest opacity-80">
                      {activeMethod === 'CARD' ? cardBrand : activeMethod === 'MOBILE_MONEY' ? 'Mobile Money' : 'Virement'}
                    </div>
                    <div className="rounded-md bg-white/20 px-2 py-1 text-[10px] font-semibold backdrop-blur">
                      {activeMethod === 'CARD' ? 'CRYPTE' : 'SÉCURISÉ'}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="font-mono text-lg tracking-widest sm:text-xl">
                      {activeMethod === 'CARD'
                        ? pan || '•••• •••• •••• ••••'
                        : activeMethod === 'MOBILE_MONEY'
                        ? (mmPhone || '+••• •••• ••••')
                        : (destAccount.slice(0, 22) || 'IBAN ••••')}
                    </div>
                    <div className="flex items-end justify-between">
                      <div>
                        <div className="text-[10px] uppercase tracking-wider opacity-70">Titulaire</div>
                        <div className="text-sm font-medium tracking-wide">
                          {cardHolderName || (user ? `${user.firstName} ${user.lastName}`.toUpperCase() : 'VOTRE NOM')}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase tracking-wider opacity-70">Expire</div>
                        <div className="font-mono text-sm">
                          {expiry ? expiry.slice(5, 7) + '/' + expiry.slice(2, 4) : 'MM/AA'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Récapitulatif */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900/60">
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Récapitulatif
                </h3>
                <div className="space-y-2.5 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Méthode</span>
                    <span className="font-semibold">
                      {tabs.find((t) => t.key === activeMethod)?.label}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Devise</span>
                    <span className="font-mono font-semibold">{currency}</span>
                  </div>
                  <div className="my-2 h-px bg-slate-200 dark:bg-slate-700" />
                  <div className="flex items-baseline justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Total à payer</span>
                    <span className="text-2xl font-bold tracking-tight text-cyan-600 dark:text-cyan-400">
                      {formattedAmount} <span className="text-sm font-medium text-slate-500">{currency}</span>
                    </span>
                  </div>
                </div>
                <div className="mt-4 flex items-start gap-2 rounded-lg bg-cyan-50 p-3 text-xs text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-300">
                  <Info className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  <p>
                    Aucun débit ne sera effectué tant que vous n'aurez pas confirmé le paiement final. Les données
                    sont tokenisées via notre coffre-fort PCI-DSS.
                  </p>
                </div>
              </div>

              {/* Badges de confiance */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'SSL 256 bits', icon: Lock },
                  { label: '3D-Secure', icon: ShieldCheck },
                  { label: 'PCI-DSS', icon: ShieldCheck },
                ].map((badge) => (
                  <div
                    key={badge.label}
                    className="flex flex-col items-center gap-1 rounded-xl border border-slate-200 bg-white p-3 text-center dark:border-white/10 dark:bg-slate-900/60"
                  >
                    <badge.icon className="h-4 w-4 text-emerald-500" />
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                      {badge.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* COLONNE DROITE — Formulaire */}
            <div className="space-y-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-lg dark:border-white/10 dark:bg-slate-900/60 sm:p-8 lg:col-span-3">
              {/* Onglets de méthode */}
              <div>
                <label className="mb-2.5 block text-sm font-medium text-slate-600 dark:text-slate-300">
                  Choisir une méthode de paiement
                </label>
                <div className="grid grid-cols-3 gap-2 rounded-2xl bg-slate-100 p-1.5 dark:bg-slate-800/50">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeMethod === tab.key;
                    return (
                      <button
                        key={tab.key}
                        type="button"
                        onClick={() => {
                          setActiveMethod(tab.key as PaymentMethodType);
                          setMessage(null);
                        }}
                        className={`flex flex-col items-center gap-1 rounded-xl px-2 py-3 text-xs font-semibold transition-all ${
                          isActive
                            ? 'bg-white text-cyan-700 shadow-md dark:bg-slate-900 dark:text-cyan-300'
                            : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
                <p className="mt-2 text-center text-[11px] text-slate-500 dark:text-slate-400">
                  {tabs.find((t) => t.key === activeMethod)?.description}
                </p>
              </div>

              <div className="h-px bg-slate-200 dark:bg-slate-700" />

              <div className="space-y-5">
                {/* Montant + devise */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-600 dark:text-slate-300">
                      Montant
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        onBlur={() => setAmountTouched(true)}
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-lg font-semibold text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 dark:border-white/10 dark:bg-slate-800 dark:text-slate-100"
                        placeholder="0.00"
                        required
                      />
                    </div>
                    {amountTouched && (parseFloat(amount) <= 0 || !amount) && (
                      <p className="mt-1.5 flex items-center gap-1 text-xs text-rose-600 dark:text-rose-400">
                        <AlertCircle className="h-3 w-3" /> Montant requis
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-600 dark:text-slate-300">
                      Devise
                    </label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 dark:border-white/10 dark:bg-slate-800 dark:text-slate-100"
                    >
                      <option value="EUR">EUR - Euro</option>
                      <option value="USD">USD - Dollar US</option>
                      <option value="MGA">MGA - Ariary</option>
                      <option value="XOF">XOF - Franc CFA (UEMOA)</option>
                      <option value="XAF">XAF - Franc CFA (CEMAC)</option>
                    </select>
                  </div>
                </div>

                {activeMethod === 'CARD' && (
                  <>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-600 dark:text-slate-300">
                        Numéro de carte
                      </label>
                      <div className="relative">
                        <CreditCard className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          value={pan}
                          onChange={(e) => setPan(formatCardNumber(e.target.value))}
                          onBlur={() => setPanTouched(true)}
                          className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-20 font-mono tracking-wider text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 dark:border-white/10 dark:bg-slate-800 dark:text-slate-100"
                          placeholder="4111 1111 1111 1111"
                          maxLength={19}
                          required
                        />
                        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500 dark:bg-slate-700 dark:text-slate-300">
                          {cardBrand}
                        </span>
                      </div>
                      {panTouched && !pan.trim() && (
                        <p className="mt-1.5 flex items-center gap-1 text-xs text-rose-600 dark:text-rose-400">
                          <AlertCircle className="h-3 w-3" /> Numéro de carte requis
                        </p>
                      )}
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-600 dark:text-slate-300">
                          Date d'expiration
                        </label>
                        <input
                          type="date"
                          value={expiry}
                          onChange={(e) => setExpiry(e.target.value)}
                          onBlur={() => setPanTouched(true)}
                          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 dark:border-white/10 dark:bg-slate-800 dark:text-slate-100"
                          required
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-600 dark:text-slate-300">
                          Titulaire de la carte
                        </label>
                        <input
                          type="text"
                          value={cardHolderName}
                          onChange={(e) => setCardHolderName(e.target.value.toUpperCase())}
                          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 uppercase text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 dark:border-white/10 dark:bg-slate-800 dark:text-slate-100"
                          placeholder="Nom Prénom"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleTokenizeCard}
                      disabled={loading}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-cyan-500 bg-white px-4 py-3 font-semibold text-cyan-600 transition hover:bg-cyan-50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-900 dark:text-cyan-300 dark:hover:bg-cyan-500/10"
                    >
                      <Lock className="h-4 w-4" />
                      {loading ? 'Tokenisation sécurisée...' : 'Sécuriser la carte (PCI-DSS)'}
                    </button>
                  </>
                )}

                {activeMethod === 'MOBILE_MONEY' && (
                  <>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-600 dark:text-slate-300">
                        Numéro de téléphone
                      </label>
                      <div className="relative">
                        <Smartphone className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                        <input
                          type="tel"
                          value={mmPhone}
                          onChange={(e) => setMmPhone(e.target.value)}
                          onBlur={() => setMmPhoneTouched(true)}
                          className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 font-mono text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 dark:border-white/10 dark:bg-slate-800 dark:text-slate-100"
                          placeholder="+225 07 01 02 03"
                          required
                        />
                      </div>
                      {mmPhoneTouched && !mmPhone.trim() && (
                        <p className="mt-1.5 flex items-center gap-1 text-xs text-rose-600 dark:text-rose-400">
                          <AlertCircle className="h-3 w-3" /> Numéro de téléphone requis
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-600 dark:text-slate-300">
                        Opérateur
                      </label>
                      <select
                        value={mmOperator}
                        onChange={(e) => setMmOperator(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 dark:border-white/10 dark:bg-slate-800 dark:text-slate-100"
                      >
                        <option value="ORANGE_MONEY_CI">🟠 Orange Money</option>
                        <option value="MTN_MOBILE_MONEY">🟡 MTN Mobile Money</option>
                        <option value="MPESA_KENYA">🔴 M-Pesa Kenya</option>
                        <option value="MPESA_TANZANIA">🔴 M-Pesa Tanzanie</option>
                      </select>
                    </div>
                  </>
                )}

                {activeMethod === 'BANK_TRANSFER' && (
                  <div>
                    <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-300">
                      <ArrowLeftRight className="h-4 w-4" /> Compte de destination (IBAN)
                    </label>
                    <input
                      type="text"
                      value={destAccount}
                      onChange={(e) => setDestAccount(e.target.value)}
                      onBlur={() => setDestTouched(true)}
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-mono text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 dark:border-white/10 dark:bg-slate-800 dark:text-slate-100"
                      placeholder="FR76 1234 5678 9012 3456 7890 123"
                      required
                    />
                    {destTouched && !destAccount.trim() && (
                      <p className="mt-1.5 flex items-center gap-1 text-xs text-rose-600 dark:text-rose-400">
                        <AlertCircle className="h-3 w-3" /> Compte de destination requis
                      </p>
                    )}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleProcessPayment}
                  disabled={loading}
                  className="relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-4 text-base font-bold tracking-wide text-white shadow-lg shadow-cyan-500/30 transition hover:shadow-xl hover:shadow-cyan-500/40 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                  <span className="relative flex items-center justify-center gap-2">
                    {loading ? (
                      <>
                        <RefreshCw className="h-5 w-5 animate-spin" />
                        Traitement sécurisé en cours...
                      </>
                    ) : (
                      <>
                        <Lock className="h-5 w-5" />
                        Payer {formattedAmount} {currency}
                      </>
                    )}
                  </span>
                </button>

                <p className="flex items-center justify-center gap-1.5 text-center text-[11px] text-slate-500 dark:text-slate-400">
                  <Lock className="h-3 w-3" />
                  Paiement 100% sécurisé · Vos données ne sont jamais stockées
                </p>
              </div>
            </div>
          </div>
        ) : (
          <ResultCard
            paymentResult={paymentResult}
            getProviderLabel={getProviderLabel}
            onReset={resetPayment}
            copied={copied}
            onCopy={copyReference}
          />
        )}
      </div>
    </div>
  );
};

const ResultCard = ({
  paymentResult,
  getProviderLabel,
  onReset,
  copied,
  onCopy,
}: {
  paymentResult: PaymentResponse;
  getProviderLabel: (p?: PaymentProvider) => string;
  onReset: () => void;
  copied: boolean;
  onCopy: () => void;
}) => {
  const success = paymentResult.success;
  return (
    <div className="mx-auto max-w-2xl">
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-white/10 dark:bg-slate-900/60">
        <div
          className={`relative px-8 py-10 text-center ${
            success
              ? 'bg-gradient-to-br from-emerald-500 via-emerald-500 to-teal-600 text-white'
              : 'bg-gradient-to-br from-rose-500 via-rose-500 to-pink-600 text-white'
          }`}
        >
          <div className="absolute inset-0 opacity-20">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/20 blur-3xl" />
            <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
          </div>
          <div className="relative">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
              {success ? <ShieldCheck className="h-10 w-10" /> : <RefreshCw className="h-10 w-10" />}
            </div>
            <h2 className="mb-2 text-3xl font-bold">{success ? 'Paiement réussi' : 'Paiement échoué'}</h2>
            <p className="mx-auto max-w-md text-sm opacity-90">{paymentResult.message}</p>
          </div>
        </div>

        <div className="space-y-4 p-6 sm:p-8">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <DetailItem label="Référence" mono>
              <span className="flex items-center gap-1.5">
                <span className="truncate">{paymentResult.transactionReference}</span>
                <button
                  type="button"
                  onClick={onCopy}
                  className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-cyan-600 dark:hover:bg-slate-800"
                  aria-label="Copier la référence"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </span>
            </DetailItem>
            <DetailItem label="Statut" badge value={paymentResult.status} />
            <DetailItem
              label="Montant"
              highlight
              value={`${paymentResult.amount} ${paymentResult.currency}`}
            />
            <DetailItem label="Fournisseur" value={getProviderLabel(paymentResult.provider)} />
            {paymentResult.externalTransactionId && (
              <div className="col-span-2">
                <DetailItem label="ID externe" mono value={paymentResult.externalTransactionId} />
              </div>
            )}
          </div>

          {(paymentResult.riskScore !== undefined || paymentResult.fraudRecommendation) && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-slate-800/50">
              <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                <Sparkles className="h-3.5 w-3.5" /> Analyse IA
              </h3>
              {paymentResult.riskScore !== undefined && (
                <div className="mb-2">
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400">Score de risque</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {(paymentResult.riskScore * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                    <div
                      className={`h-full rounded-full transition-all ${
                        paymentResult.riskLevel === 'HIGH'
                          ? 'bg-gradient-to-r from-rose-500 to-rose-600'
                          : paymentResult.riskLevel === 'MEDIUM'
                          ? 'bg-gradient-to-r from-amber-400 to-amber-500'
                          : 'bg-gradient-to-r from-emerald-500 to-emerald-600'
                      }`}
                      style={{ width: `${paymentResult.riskScore * 100}%` }}
                    />
                  </div>
                </div>
              )}
              {paymentResult.fraudRecommendation && (
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  {paymentResult.fraudRecommendation}
                </p>
              )}
              {paymentResult.threeDsRequired && (
                <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-500/20 dark:text-amber-300">
                  <Lock className="h-3 w-3" /> 3DS2 challenge requis
                </p>
              )}
            </div>
          )}

          <button
            onClick={onReset}
            className="w-full rounded-xl bg-slate-900 px-4 py-3.5 font-semibold text-white transition hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
          >
            Effectuer un nouveau paiement
          </button>
        </div>
      </div>
    </div>
  );
};

const DetailItem = ({
  label,
  value,
  mono,
  highlight,
  badge,
  children,
}: {
  label: string;
  value?: string;
  mono?: boolean;
  highlight?: boolean;
  badge?: boolean;
  children?: ReactNode;
}) => (
  <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-white/10 dark:bg-slate-800/50">
    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
      {label}
    </p>
    {children ?? (
      <p
        className={`mt-0.5 truncate ${
          mono ? 'font-mono text-xs' : ''
        } ${
          highlight
            ? 'text-base font-bold text-cyan-600 dark:text-cyan-400'
            : badge
            ? 'inline-block rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700 dark:bg-slate-700 dark:text-slate-200'
            : 'font-semibold text-slate-900 dark:text-slate-100'
        }`}
      >
        {value}
      </p>
    )}
  </div>
);

export default PaymentPage;

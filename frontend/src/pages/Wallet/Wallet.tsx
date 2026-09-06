import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import walletService from '../../services/walletService';
import accountService from '../../services/accountService';
import type { WalletBalanceDTO, WalletTransactionDTO, WalletTransactionPayload } from '../../types/wallet.types';
import type { AccountDTO } from '../../types/account.types';

const Wallet = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState<AccountDTO[]>([]);
  const [accountInput, setAccountInput] = useState('');
  const [resolvedAccountId, setResolvedAccountId] = useState('');
  const [accountOperator, setAccountOperator] = useState<'none' | 'mvola' | 'airtel' | 'orange'>('none');
  const [balance, setBalance] = useState<WalletBalanceDTO | null>(null);
  const [history, setHistory] = useState<WalletTransactionDTO[]>([]);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [showCreateAccount, setShowCreateAccount] = useState(false);

  const accountDisplay = useMemo(() => {
    if (!balance) return 'Compte inconnu';
    const label = accounts.find((a) => a.id === balance.accountId)?.accountNumber ?? balance.accountId;
    return `${label} - ${balance.currency} ${Number(balance.balance).toFixed(2)}`;
  }, [balance, accounts]);

  useEffect(() => {
    accountService.list()
      .then(setAccounts)
      .catch(() => setError('Impossible de charger vos comptes.'))
      .finally(() => setLoadingAccounts(false));
  }, []);

  useEffect(() => {
    if (!resolvedAccountId) return;
    const fetchWallet = async () => {
      try {
        setIsLoading(true);
        const wallet = await walletService.getBalance(resolvedAccountId);
        setBalance(wallet);
        const historyData = await walletService.getHistory(resolvedAccountId);
        setHistory(historyData);
      } catch {
        setError('Impossible de charger le portefeuille. Vérifiez le compte ou votre connexion.');
        setBalance(null);
        setHistory([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWallet();
  }, [resolvedAccountId]);

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoadingAccounts(true);
      const created = await accountService.create({ currency: 'MGA' });
      setAccounts((prev) => [...prev, created]);
      setAccountInput(created.id);
      setResolvedAccountId(created.id);
      setShowCreateAccount(false);
      setSuccess('Compte créé avec succès.');
    } catch {
      setError('Impossible de créer le compte.');
    } finally {
      setLoadingAccounts(false);
    }
  };

  const handleAction = async (type: 'deposit' | 'withdraw') => {
    setError(null);
    setSuccess(null);

    if (!resolvedAccountId) {
      setError('Veuillez saisir un compte valide.');
      return;
    }

    if (!amount || Number(amount) <= 0) {
      setError('Le montant doit être supérieur à zéro.');
      return;
    }

    if (!description) {
      setError('La description est requise.');
      return;
    }

    const payload: WalletTransactionPayload = {
      accountId: resolvedAccountId,
      amount,
      description,
    };

    try {
      setIsLoading(true);
      if (type === 'deposit') {
        await walletService.deposit(payload);
        setSuccess('Dépôt effectué avec succès.');
      } else {
        await walletService.withdraw(payload);
        setSuccess('Retrait effectué avec succès.');
      }
      const wallet = await walletService.getBalance(resolvedAccountId);
      setBalance(wallet);
      setHistory(await walletService.getHistory(resolvedAccountId));
      setAmount('');
      setDescription('');
    } catch {
      setError('Échec de l\u2019opération. Vérifiez le solde et réessayez.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900 sm:px-6 lg:px-8 dark:bg-slate-950 dark:text-slate-50">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="rounded-4xl border border-slate-200 bg-white/80 p-8 shadow-xl backdrop-blur dark:border-white/10 dark:bg-slate-900/70">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-cyan-600/80 dark:text-cyan-300/80">Portefeuille</p>
              <h1 className="mt-2 text-4xl font-semibold">Gestion de compte</h1>
              <p className="mt-3 max-w-2xl text-slate-500 dark:text-slate-300">
                Gérez vos dépôts, retraits et consultez l'historique de votre compte sécurisé.
              </p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500 dark:border-white/10 dark:bg-slate-800/50 dark:text-slate-300">
              <div>Connecté en tant que :</div>
              <div className="mt-2 font-semibold text-slate-900 dark:text-white">{user?.firstName ?? user?.email}</div>
            </div>
          </div>
        </div>

        <div className="grid gap-8 xl:grid-cols-[0.95fr_0.75fr]">
          <section className="rounded-4xl border border-slate-200 bg-white/70 p-8 shadow-lg dark:border-white/10 dark:bg-slate-900/70">
            <div className="grid gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300" htmlFor="account-select">
                  Compte
                </label>
                {loadingAccounts ? (
                  <div className="mt-2 text-sm text-slate-500">Chargement des comptes...</div>
                ) : accounts.length === 0 ? (
                  <div className="mt-2 text-sm text-slate-500">
                    Aucun compte trouvé.{' '}
                    <button
                      type="button"
                      onClick={() => setShowCreateAccount(true)}
                      className="text-cyan-600 underline"
                    >
                      Créer un compte
                    </button>
                  </div>
                ) : (
                  <div className="mt-2 flex gap-2">
                    <select
                      value={accountOperator}
                      onChange={(e) => {
                        const op = e.target.value as 'none' | 'mvola' | 'airtel' | 'orange';
                        setAccountOperator(op);
                        // clear resolved id when selecting external operator
                        if (op !== 'none') {
                          setResolvedAccountId('');
                          setBalance(null);
                          setHistory([]);
                        }
                      }}
                      className="w-1/3 rounded-3xl border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none dark:border-white/10 dark:bg-slate-900 dark:text-slate-100"
                    >
                      <option value="none">Interne</option>
                      <option value="mvola">Mvola</option>
                      <option value="airtel">Airtel</option>
                      <option value="orange">Orange Money</option>
                    </select>
                    <input
                      id="account-input"
                      type="text"
                      value={accountInput}
                      onChange={(e) => {
                        const val = e.target.value;
                        setAccountInput(val);
                        const match = accounts.find((a) => a.id === val || a.accountNumber === val);
                        if (match) {
                          setResolvedAccountId(match.id);
                        } else {
                          setResolvedAccountId('');
                          setBalance(null);
                          setHistory([]);
                        }
                      }}
                      placeholder={accountOperator === 'none' ? "Entrez l'ID du compte ou le numéro de compte" : "Entrez le numéro de téléphone (ex: 034...)"}
                      className="flex-1 rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-500 dark:border-white/10 dark:bg-slate-800/80 dark:text-slate-100 dark:focus:border-cyan-400"
                    />
                  </div>
                )}
              </div>

              {error && (
                <div className="rounded-3xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-600 dark:text-rose-200" role="alert">
                  {error}
                </div>
              )}
              {success && (
                <div className="rounded-3xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-600 dark:text-emerald-200" role="status">
                  {success}
                </div>
              )}

              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-slate-700 dark:border-white/10 dark:bg-slate-800/50 dark:text-slate-200">
                <div className="text-sm text-slate-500 dark:text-slate-400">Solde du compte</div>
                <div className="mt-3 text-3xl font-semibold text-slate-900 dark:text-white">{balance ? `${balance.currency} ${Number(balance.balance).toFixed(2)}` : '—'}</div>
                <div className="mt-1 text-sm text-slate-500 dark:text-slate-500">{accountDisplay}</div>
                {accounts[0]?.kycStatus && (
                  <div className="mt-3">
                    {accounts[0].kycStatus === 'VERIFIED' ? (
                      <span className="inline-flex items-center rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-300">
                        KYC vérié
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-amber-500/15 px-3 py-1 text-xs font-medium text-amber-600 dark:text-amber-300">
                        KYC : {accounts[0].kycStatus}
                      </span>
                    )}
                  </div>
                )}
                {accountOperator !== 'none' && accountInput && (
                  <div className="mt-3 text-sm text-amber-600 dark:text-amber-300">
                    {accountOperator === 'mvola' ? (
                      <>Solde non disponible pour les comptes d'opérateurs mobiles. <button type="button" onClick={() => navigate('/transfer')} className="underline">Utilisez la page Transfert</button> pour envoyer vers Mvola</>
                    ) : accountOperator === 'airtel' ? (
                      <>Solde non disponible pour les comptes d'opérateurs mobiles. <button type="button" onClick={() => navigate('/transfer')} className="underline">Utilisez la page Transfert</button> pour envoyer vers Airtel Money</>
                    ) : (
                      <>Solde non disponible pour les comptes d'opérateurs mobiles. <button type="button" onClick={() => navigate('/transfer')} className="underline">Utilisez la page Transfert</button> pour envoyer vers Orange Money</>
                    )}
                  </div>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-300" htmlFor="amount">
                    Montant
                  </label>
                  <input
                    id="amount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={amount}
                    onChange={(event) => setAmount(event.target.value)}
                    className="mt-2 w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder-slate-400 focus:border-cyan-500 focus:bg-white dark:border-white/10 dark:bg-slate-800/80 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:border-cyan-400 dark:focus:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-300" htmlFor="description">
                    Description
                  </label>
                  <input
                    id="description"
                    type="text"
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    className="mt-2 w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder-slate-400 focus:border-cyan-500 focus:bg-white dark:border-white/10 dark:bg-slate-800/80 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:border-cyan-400 dark:focus:bg-slate-800"
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  disabled={isLoading || !resolvedAccountId}
                  onClick={() => handleAction('deposit')}
                  className="rounded-3xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Déposer
                </button>
                <button
                  type="button"
                  disabled={isLoading || !resolvedAccountId}
                  onClick={() => handleAction('withdraw')}
                  className="rounded-3xl bg-rose-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Retirer
                </button>
              </div>
            </div>
          </section>

          <section className="rounded-4xl border border-slate-200 bg-white/70 p-8 shadow-lg dark:border-white/10 dark:bg-slate-900/70">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-cyan-600/80 dark:text-cyan-300/80">Historique</p>
                <h2 className="mt-2 text-2xl font-semibold">Transactions récentes</h2>
              </div>
            </div>

            <div className="space-y-4">
              {history.length === 0 ? (
                <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500 dark:border-white/10 dark:bg-slate-800/50 dark:text-slate-400">
                  Aucune transaction trouvée pour ce compte.
                </div>
              ) : (
                history.map((txn) => (
                  <div key={txn.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 dark:border-white/10 dark:bg-slate-800/50 dark:text-slate-200">
                    <div className="flex items-center justify-between gap-4">
                      <span className="font-semibold text-slate-900 dark:text-white">{txn.type}</span>
                      <span className="text-slate-500 dark:text-slate-400">{txn.currency} {Number(txn.amount).toFixed(2)}</span>
                    </div>
                    <div className="mt-2 text-slate-500 dark:text-slate-400">{txn.description}</div>
                    <div className="mt-3 text-xs text-slate-400 dark:text-slate-500">{txn.createdAt ? new Date(txn.createdAt).toLocaleString() : 'Date non disponible'}</div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>

      {showCreateAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" role="dialog" aria-modal="true">
          <div className="w-full max-w-md rounded-4xl border border-white/10 bg-slate-900 p-6 shadow-2xl">
            <h3 className="mb-4 text-xl font-semibold text-white">Créer un compte</h3>
            <form onSubmit={handleCreateAccount} className="space-y-4">
              <p className="text-sm text-slate-300">
                Un compte en MGA sera créé pour vous. Cette action est gratuite et instantanée.
              </p>
              <button
                type="submit"
                disabled={loadingAccounts}
                className="w-full rounded-2xl bg-cyan-500 py-3 text-sm font-semibold text-white transition hover:bg-cyan-400 disabled:opacity-60"
              >
                {loadingAccounts ? 'Création...' : 'Créer mon compte'}
              </button>
              <button
                type="button"
                onClick={() => setShowCreateAccount(false)}
                className="w-full rounded-2xl bg-slate-800 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700"
              >
                Annuler
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wallet;

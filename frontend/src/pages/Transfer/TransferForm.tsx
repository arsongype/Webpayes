import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { transfer, fetchTransactions } from '../../store/slices/transactionSlice';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppDispatch';
import Button from '../../components/common/Button/Button';
import accountService from '../../services/accountService';

const transferSchema = z.object({
  senderAccountId: z.string().optional(),
  receiverOperator: z.enum(['none', 'mvola', 'airtel', 'orange']),
  receiverAccountId: z.string().min(1, 'Compte destinataire requis'),
  amount: z.string().min(1, 'Montant requis').refine((val) => Number(val) > 0, 'Montant doit être supérieur à 0'),
  description: z.string().min(1, 'Description requise'),
});

type TransferFormData = z.infer<typeof transferSchema>;

interface Account {
  id: string;
  accountNumber: string;
  balance: string | number;
}

const TransferForm = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error } = useAppSelector((state) => state.transactions);
  const [success, setSuccess] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [accountsLoading, setAccountsLoading] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TransferFormData>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      description: 'Transfert effectué',
      receiverOperator: 'none',
    },
  });

  const [useMyWallet, setUseMyWallet] = useState(false);

  const senderAccountId = watch('senderAccountId');
  const receiverOperatorValue = watch('receiverOperator');

  // Load user accounts
  useEffect(() => {
    const loadAccounts = async () => {
      try {
        setAccountsLoading(true);
        const data = await accountService.list();
        setAccounts(data);
      } catch (err) {
        console.error('Failed to load accounts:', err);
      } finally {
        setAccountsLoading(false);
      }
    };
    loadAccounts();
  }, []);

  useEffect(() => {
    dispatch(fetchTransactions({ page: 0, size: 5 }));
  }, [dispatch]);

  const onSubmit = async (data: TransferFormData) => {
    setSuccess(null);
    try {
      const payload: any = {
        // if senderAccountId is empty/undefined, let backend use current user's default wallet
        ...(data.senderAccountId ? { senderAccountId: data.senderAccountId } : {}),
        receiverAccountId: data.receiverAccountId,
        amount: data.amount,
        description: data.description,
      };
      if ((data as any).receiverOperator && (data as any).receiverOperator !== 'none') {
        payload.receiverOperator = (data as any).receiverOperator;
      }

      const response = await dispatch(transfer(payload));
      if (transfer.fulfilled.match(response)) {
        setSuccess(`Transfert effectué avec succès. Référence: ${response.payload.reference}`);
        reset();
        dispatch(fetchTransactions({ page: 0, size: 20 }));
        setTimeout(() => navigate('/transactions'), 2000);
      }
    } catch (err) {
      console.error('Transfer error:', err);
    }
  };

  const senderAccount = accounts.find(acc => acc.id === senderAccountId);

  const getBalance = (balance: string | number) => {
    const num = typeof balance === 'string' ? parseFloat(balance) : balance;
    return isNaN(num) ? 0 : num;
  };

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900 sm:px-6 lg:px-8 dark:bg-slate-950 dark:text-slate-50">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold">Effectuer un transfert</h1>
          <p className="mt-2 text-slate-500 dark:text-slate-300">Transférez de l'argent entre comptes</p>
        </div>

        {success && (
          <div className="mb-6 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4 text-emerald-600 dark:text-emerald-200">
            ✓ {success}
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-red-600 dark:text-red-200">
            ✗ {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="rounded-4xl border border-slate-200 bg-white/80 p-8 shadow-xl backdrop-blur dark:border-white/10 dark:bg-slate-900/70">
          <div className="space-y-6">
            {/* Sender Account */}
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">Compte émetteur</label>
              <div className="mt-2 flex items-center gap-3">
                <label className="inline-flex items-center gap-2">
                  <input type="checkbox" checked={useMyWallet} onChange={(e) => {
                    const val = e.target.checked;
                    setUseMyWallet(val);
                    if (val) {
                      // if user has accounts, prefill with first account id to show balance
                      if (accounts && accounts.length > 0) {
                        setValue('senderAccountId', accounts[0].id);
                      } else {
                        setValue('senderAccountId', '');
                      }
                    } else {
                      setValue('senderAccountId', '');
                    }
                  }} />
                  <span className="text-sm text-slate-700 dark:text-slate-300">Utiliser mon portefeuille</span>
                </label>
              </div>

              <input
                type="text"
                {...register('senderAccountId')}
                disabled={useMyWallet}
                placeholder="Entrez l'ID du compte émetteur ou le numéro de compte"
                className="mt-1 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-cyan-500 focus:outline-none dark:border-white/10 dark:bg-slate-800/80 dark:text-slate-100 dark:focus:border-cyan-400"
              />
              {errors.senderAccountId && <p className="mt-1 text-sm text-red-600 dark:text-red-300">{errors.senderAccountId.message}</p>}
            </div>

            {/* Balance Info */}
            {senderAccount && (
              <div className="rounded-2xl border border-cyan-400/30 bg-cyan-500/10 p-4">
                <p className="text-sm text-slate-500 dark:text-slate-300">Solde disponible:</p>
                <p className="text-2xl font-bold text-cyan-600 dark:text-cyan-300">{getBalance(senderAccount.balance).toFixed(4)} MGA</p>
              </div>
            )}

            {/* Receiver Account */}
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">Compte destinataire</label>
              <div className="mt-2 flex gap-2">
                <select
                  {...register('receiverOperator')}
                  className="w-1/2 rounded-2xl border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-cyan-500 focus:outline-none dark:border-white/10 dark:bg-slate-800/80 dark:text-slate-100"
                >
                  <option value="none">Interne</option>
                  <option value="mvola">Mvola</option>
                  <option value="airtel">Airtel Money</option>
                  <option value="orange">Orange Money</option>
                </select>

                <div className="flex-1">
                  {accountsLoading ? (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-500 dark:border-white/10 dark:bg-slate-800/50 dark:text-slate-400">Chargement...</div>
                  ) : (
                    <input
                      type="text"
                      {...register('receiverAccountId')}
                      placeholder={receiverOperatorValue === 'none' ? "Entrez l'ID du compte interne" : "Entrez le numéro de téléphone du destinataire"}
                      className="mt-1 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-cyan-500 focus:outline-none dark:border-white/10 dark:bg-slate-800/80 dark:text-slate-100 dark:focus:border-cyan-400"
                    />
                  )}
                </div>
              </div>
              {errors.receiverAccountId && <p className="mt-1 text-sm text-red-600 dark:text-red-300">{errors.receiverAccountId.message}</p>}
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">Montant (MGA)</label>
              <input
                type="number"
                step="0.01"
                {...register('amount')}
                className="mt-1 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-cyan-500 focus:outline-none dark:border-white/10 dark:bg-slate-800/80 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:border-cyan-400"
                placeholder="0.00"
              />
              {errors.amount && <p className="mt-1 text-sm text-red-600 dark:text-red-300">{errors.amount.message}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">Description (optionnelle)</label>
              <textarea
                {...register('description')}
                rows={3}
                className="mt-1 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-cyan-500 focus:outline-none dark:border-white/10 dark:bg-slate-800/80 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:border-cyan-400"
                placeholder="Motif du transfert"
              />
              {errors.description && <p className="mt-1 text-sm text-red-600 dark:text-red-300">{errors.description.message}</p>}
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <Button type="submit" variant="primary" isLoading={loading || accountsLoading}>
                Effectuer le transfert
              </Button>
              <Button type="button" variant="secondary" onClick={() => navigate('/transactions')}>
                Annuler
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransferForm;

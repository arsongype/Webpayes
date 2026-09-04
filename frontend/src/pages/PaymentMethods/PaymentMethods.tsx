import { useEffect, useState } from 'react';
import paymentMethodService, { type PaymentMethodDTO, type PaymentMethodRequest } from '../../services/paymentMethodService';


const PaymentMethods = () => {
  const [methods, setMethods] = useState<PaymentMethodDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [form, setForm] = useState<PaymentMethodRequest>({ type: 'CARD' });

  const load = async () => {
    try {
      const data = await paymentMethodService.list();
      setMethods(data);
    } catch {
      setError('Impossible de charger les moyens de paiement.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      if (editingId) {
        await paymentMethodService.update(editingId, form);
        setSuccess('Moyen de paiement mis à jour.');
      } else {
        await paymentMethodService.create(form);
        setSuccess('Moyen de paiement ajouté.');
      }
      setShowForm(false);
      setEditingId(null);
      setForm({ type: 'CARD' });
      load();
    } catch {
      setError('Échec de l\'opération.');
    }
  };

  const handleEdit = (method: PaymentMethodDTO) => {
    setForm({ type: method.type, provider: method.provider, accountNumber: method.accountNumber, expiryDate: method.expiryDate, isFavorite: method.isFavorite });
    setEditingId(method.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce moyen de paiement ?')) return;
    try {
      await paymentMethodService.remove(id);
      setSuccess('Supprimé.');
      load();
    } catch {
      setError('Échec de la suppression.');
    }
  };

  const handleToggleFavorite = async (id: string) => {
    try {
      await paymentMethodService.toggleFavorite(id);
      load();
    } catch {
      setError('Échec de la mise à jour.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900 dark:bg-slate-950 dark:text-slate-50 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-4xl border border-slate-200 bg-white/80 p-8 shadow-xl backdrop-blur dark:border-white/10 dark:bg-slate-900/70">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-cyan-600/80 dark:text-cyan-300/80">Paiement</p>
              <h1 className="mt-2 text-3xl font-semibold">Moyens de paiement</h1>
            </div>
            <button
              onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({ categoryId: '', type: 'CARD' }); }}
              className="rounded-2xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-400"
            >
              {showForm ? 'Annuler' : 'Ajouter'}
            </button>
          </div>

          {error && (
            <div className="mb-6 rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-600 dark:text-rose-200" role="alert">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-6 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-600 dark:text-emerald-200" role="status">
              {success}
            </div>
          )}

          {showForm && (
            <form className="mb-8 rounded-3xl border border-slate-200 bg-slate-50 p-6 dark:border-white/10 dark:bg-slate-800/50" onSubmit={handleSubmit}>
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value as PaymentMethodRequest['type'] })}
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-cyan-500 dark:border-white/10 dark:bg-slate-800/80 dark:text-slate-100"
                  >
                    <option value="CARD">Carte bancaire</option>
                    <option value="MOBILE_MONEY">Mobile Money</option>
                    <option value="BANK_TRANSFER">Virement</option>
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Fournisseur / Opérateur</label>
                  <input
                    value={form.provider || ''}
                    onChange={(e) => setForm({ ...form, provider: e.target.value })}
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-cyan-500 dark:border-white/10 dark:bg-slate-800/80 dark:text-slate-100"
                    placeholder="Visa, Orange Money..."
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Numéro de compte</label>
                  <input
                    value={form.accountNumber || ''}
                    onChange={(e) => setForm({ ...form, accountNumber: e.target.value })}
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-cyan-500 dark:border-white/10 dark:bg-slate-800/80 dark:text-slate-100"
                  />
                </div>
                {form.type === 'CARD' && (
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Date d'expiration</label>
                    <input
                      value={form.expiryDate || ''}
                      onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-cyan-500 dark:border-white/10 dark:bg-slate-800/80 dark:text-slate-100"
                      placeholder="MM/AA"
                    />
                  </div>
                )}
              </div>
              <div className="mt-6 flex gap-4">
                <button type="submit" className="rounded-2xl bg-cyan-500 px-6 py-3 font-semibold text-white transition hover:bg-cyan-400">
                  {editingId ? 'Mettre à jour' : 'Ajouter'}
                </button>
              </div>
            </form>
          )}

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />
            </div>
          ) : methods.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 text-center dark:border-white/10 dark:bg-slate-800/50">
              <p className="text-slate-500 dark:text-slate-400">Aucun moyen de paiement enregistré.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {methods.map((m) => (
                <div key={m.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-slate-800/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">{m.provider || m.type}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {m.accountNumber ? `****${m.accountNumber.slice(-4)}` : 'N/A'}
                        {m.expiryDate && ` • Exp: ${m.expiryDate}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleToggleFavorite(m.id)} className={`rounded-full px-3 py-1 text-xs font-medium ${m.isFavorite ? 'bg-amber-500/15 text-amber-600 dark:text-amber-300' : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'}`}>
                        {m.isFavorite ? 'Favori' : 'Favori'}
                      </button>
                      <button onClick={() => handleEdit(m)} className="rounded-full bg-slate-200 px-3 py-1 text-xs font-medium text-slate-700 dark:bg-slate-700 dark:text-slate-300">Éditer</button>
                      <button onClick={() => handleDelete(m.id)} className="rounded-full bg-rose-500/15 px-3 py-1 text-xs font-medium text-rose-600 dark:text-rose-300">Supprimer</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentMethods;




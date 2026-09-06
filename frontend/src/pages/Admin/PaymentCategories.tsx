import { useEffect, useState } from 'react';
import paymentMethodService, { type PaymentMethodCategoryDTO } from '../../services/paymentMethodService';
import { Plus, Pencil, Trash2, X } from 'lucide-react';

const PaymentCategories = () => {
  const [categories, setCategories] = useState<PaymentMethodCategoryDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', description: '', icon: '' });

  const load = async () => {
    try {
      const data = await paymentMethodService.listCategories();
      setCategories(data);
    } catch {
      setError('Impossible de charger les catégories.');
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
        await paymentMethodService.updateCategory(editingId, form);
        setSuccess('Catégorie mise à jour.');
      } else {
        await paymentMethodService.createCategory(form);
        setSuccess('Catégorie créée.');
      }
      setShowForm(false);
      setEditingId(null);
      setForm({ name: '', description: '', icon: '' });
      load();
    } catch {
      setError('Échec de l\'opération.');
    }
  };

  const handleEdit = (cat: PaymentMethodCategoryDTO) => {
    setForm({ name: cat.name, description: cat.description || '', icon: cat.icon || '' });
    setEditingId(cat.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette catégorie ?')) return;
    try {
      await paymentMethodService.deleteCategory(id);
      setSuccess('Supprimé.');
      load();
    } catch {
      setError('Échec de la suppression.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-6 lg:px-8 dark:bg-slate-950 dark:text-slate-50">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Admin</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">Catégories de moyens de paiement</h1>
          </div>
          <button
            onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({ name: '', description: '', icon: '' }); }}
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:shadow-lg"
          >
            {showForm ? <><X size={16} /> Annuler</> : <><Plus size={16} /> Ajouter</>}
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
          <form className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900" onSubmit={handleSubmit}>
            <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">{editingId ? 'Modifier' : 'Nouvelle catégorie'}</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Nom</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-500 dark:border-white/10 dark:bg-slate-800/80 dark:text-slate-100" required />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Icône</label>
                <input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-500 dark:border-white/10 dark:bg-slate-800/80 dark:text-slate-100" placeholder="card, mobile..." />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
                <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-500 dark:border-white/10 dark:bg-slate-800/80 dark:text-slate-100" />
              </div>
            </div>
            <div className="mt-6">
              <button type="submit" className="rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md transition hover:shadow-lg">
                {editingId ? 'Mettre à jour' : 'Créer'}
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />
          </div>
        ) : categories.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center dark:border-white/10 dark:bg-slate-900">
            <p className="text-slate-500 dark:text-slate-400">Aucune catégorie.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {categories.map((c) => (
              <div key={c.id} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-white/10 dark:bg-slate-900">
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">{c.name}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{c.description || '—'}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(c)} className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">
                    <Pencil size={14} />
                    Éditer
                  </button>
                  <button onClick={() => handleDelete(c.id)} className="inline-flex items-center gap-1.5 rounded-xl bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-500/20 dark:text-rose-300">
                    <Trash2 size={14} />
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentCategories;

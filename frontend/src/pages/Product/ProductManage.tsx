import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, Edit, Trash2 } from 'lucide-react';
import productService, { type ProductDTO, type ProductRequest } from '../../services/productService';
import Button from '../../components/common/Button/Button';
import Modal from '../../components/common/Modal/Modal';
import RequiredAsterisk from '../../components/common/RequiredAsterisk/RequiredAsterisk';

const ProductManage = () => {
  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<ProductDTO | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ProductRequest>({ name: '', price: '', stock: 0, active: true });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const load = async () => {
    setLoading(true);
    try {
      const data = await productService.listMy();
      setProducts(data);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      setForm({ ...form, imageUrl: base64 });
      setImagePreview(base64);
    } catch {
      alert('Impossible de charger l\'image.');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await productService.update(editing.id, form);
      } else {
        await productService.create(form);
      }
      setShowCreate(false);
      setEditing(null);
      setForm({ name: '', price: '', stock: 0, active: true });
      setImagePreview(null);
      load();
    } catch {
      alert('Erreur lors de l\'enregistrement.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (p: ProductDTO) => {
    setEditing(p);
    setForm({ name: p.name, description: p.description, price: p.price, currency: p.currency, imageUrl: p.imageUrl, stock: p.stock, active: p.active });
    setImagePreview(p.imageUrl || null);
    setShowCreate(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce produit ?')) return;
    try {
      await productService.delete(id);
      load();
    } catch {
      alert('Erreur lors de la suppression.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900 dark:bg-slate-950 dark:text-slate-50">
      <div className="mx-auto max-w-6xl">
        <Link to="/dashboard" className="mb-6 inline-flex items-center gap-2 text-sm text-cyan-600 hover:text-cyan-700 dark:text-cyan-400">
          <ArrowLeft size={16} /> Retour au tableau de bord
        </Link>

        <div className="rounded-4xl border border-slate-200 bg-white/80 p-8 shadow-xl backdrop-blur dark:border-white/10 dark:bg-slate-900/70">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold sm:text-3xl">Mes produits</h1>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">Gérez votre catalogue</p>
            </div>
            <Button variant="primary" onClick={() => { setEditing(null); setForm({ name: '', price: '', stock: 0, active: true }); setImagePreview(null); setShowCreate(true); }}>
              <Plus size={16} /> Ajouter
            </Button>
          </div>

          {loading && (
            <div className="mt-8 flex justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />
            </div>
          )}

          {!loading && products.length === 0 && (
            <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center dark:border-white/10 dark:bg-slate-800/50">
              <p className="text-slate-500 dark:text-slate-400">Aucun produit. Créez votre premier produit !</p>
            </div>
          )}

          <div className="mt-8 space-y-4">
            {products.map((p) => (
              <div key={p.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-white/10 dark:bg-slate-800/50">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    {p.imageUrl && (
                      <img src={p.imageUrl} alt={p.name} className="h-16 w-16 rounded-xl object-cover border border-slate-200 dark:border-white/10" />
                    )}
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">{p.name}</h3>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">{p.description}</p>
                      <p className="mt-1 text-lg font-semibold text-cyan-600 dark:text-cyan-300">{Number(p.price).toFixed(2)} {p.currency}</p>
                      <p className="text-xs text-slate-400">Stock: {p.stock} | Actif: {p.active ? 'Oui' : 'Non'}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(p)} className="rounded-xl bg-cyan-500/15 px-3 py-2 text-xs font-medium text-cyan-600 dark:text-cyan-300">
                      <Edit size={14} />
                    </button>
                    <button onClick={() => handleDelete(p.id)} className="rounded-xl bg-red-500/15 px-3 py-2 text-xs font-medium text-red-600 dark:text-red-300">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Modal isOpen={showCreate} onClose={() => { setShowCreate(false); setEditing(null); setImagePreview(null); }} title={editing ? 'Modifier le produit' : 'Nouveau produit'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">Nom<RequiredAsterisk hasError={touched.name && !form.name} /></label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => { setForm({ ...form, name: e.target.value }); setTouched({ ...touched, name: true }); }}
              onBlur={() => setTouched({ ...touched, name: true })}
              className={`w-full rounded-2xl border bg-slate-800 px-4 py-3 text-white outline-none focus:border-cyan-500 ${touched.name && !form.name ? 'border-red-500' : 'border-slate-600'}`}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full rounded-2xl border border-slate-600 bg-slate-800 px-4 py-3 text-white outline-none focus:border-cyan-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">Prix<RequiredAsterisk hasError={touched.price && !form.price} /></label>
              <input
                type="number"
                step="0.01"
                required
                value={form.price}
                onChange={(e) => { setForm({ ...form, price: e.target.value }); setTouched({ ...touched, price: true }); }}
                onBlur={() => setTouched({ ...touched, price: true })}
                className={`w-full rounded-2xl border bg-slate-800 px-4 py-3 text-white outline-none focus:border-cyan-500 ${touched.price && !form.price ? 'border-red-500' : 'border-slate-600'}`}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">Stock</label>
              <input
                type="number"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: parseInt(e.target.value, 10) || 0 })}
                className="w-full rounded-2xl border border-slate-600 bg-slate-800 px-4 py-3 text-white outline-none focus:border-cyan-500"
              />
            </div>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="mb-2 block w-full text-sm text-slate-400"
            />
            {imagePreview && (
              <img src={imagePreview} alt="Preview" className="mt-2 h-24 w-24 rounded-xl object-cover border border-slate-600" />
            )}
          </div>
          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-2xl bg-cyan-500 py-3 text-sm font-semibold text-white transition hover:bg-cyan-400 disabled:opacity-60"
          >
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default ProductManage;

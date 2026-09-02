import { useEffect, useState, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, ShoppingCart, ArrowLeft, Plus, Edit, Trash2 } from 'lucide-react';
import productService from '../../services/productService';
import orderService from '../../services/orderService';
import Button from '../../components/common/Button/Button';
import Modal from '../../components/common/Modal/Modal';
import RequiredAsterisk from '../../components/common/RequiredAsterisk/RequiredAsterisk';
import { useAuth } from '../../hooks/useAuth';

const ProductList = () => {
  const location = useLocation();
  const searchResults = (location.state as any)?.searchResults;
  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<ProductDTO | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ProductRequest>({ name: '', price: '', stock: 0, active: true });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const { user } = useAuth();
  const isMerchant = user?.roles?.includes('ADMIN') || false;

  useEffect(() => {
    if (searchResults) {
      setProducts(searchResults);
      setLoading(false);
    } else {
      load();
    }
  }, [searchResults]);

  const load = async () => {
    setLoading(true);
    try {
      const data = await productService.list(query || undefined);
      setProducts(data);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!searchResults) {
      const timer = setTimeout(() => load(), 300);
      return () => clearTimeout(timer);
    }
  }, [query, searchResults]);

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

  const handleBuy = async (productId: string) => {
    const qtyStr = prompt('Quantité :', '1');
    if (!qtyStr) return;
    const qty = parseInt(qtyStr, 10);
    if (isNaN(qty) || qty < 1) {
      alert('Quantité invalide.');
      return;
    }
    try {
      await orderService.create({ productId, quantity: qty });
      alert('Commande créée avec succès !');
    } catch {
      alert('Erreur lors de la commande.');
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
              <h1 className="text-2xl font-semibold sm:text-3xl">Catalogue produits</h1>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">Parcourez les produits disponibles sur la plateforme</p>
            </div>
            {isMerchant && (
              <Button variant="primary" onClick={() => { setEditing(null); setForm({ name: '', price: '', stock: 0, active: true }); setImagePreview(null); setShowCreate(true); }}>
                <Plus size={16} /> Ajouter
              </Button>
            )}
          </div>

          <div className="mt-6">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher un produit..."
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-500 dark:border-white/10 dark:bg-slate-800/80 dark:text-slate-100 dark:focus:border-cyan-400"
            />
          </div>

          {loading && (
            <div className="mt-8 flex justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />
            </div>
          )}

          {!loading && products.length === 0 && (
            <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center dark:border-white/10 dark:bg-slate-800/50">
              <p className="text-slate-500 dark:text-slate-400">Aucun produit trouve.</p>
            </div>
          )}

          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <div key={p.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-6 dark:border-white/10 dark:bg-slate-800/50">
                {p.imageUrl && (
                  <img src={p.imageUrl} alt={p.name} className="mb-4 h-40 w-full rounded-2xl object-cover" />
                )}
                <h3 className="font-semibold text-slate-900 dark:text-white">{p.name}</h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">{p.description}</p>
                <p className="mt-2 text-lg font-semibold text-cyan-600 dark:text-cyan-300">
                  {Number(p.price).toFixed(2)} {p.currency}
                </p>
                <p className="mt-1 text-xs text-slate-400">Stock: {p.stock}</p>
                <div className="mt-4 flex gap-2">
                  {!isMerchant && p.active && p.stock > 0 && (
                    <Button variant="primary" onClick={() => handleBuy(p.id)} className="flex-1">
                      <ShoppingCart size={16} /> Acheter
                    </Button>
                  )}
                  {isMerchant && (
                    <>
                      <button onClick={() => handleEdit(p)} className="rounded-xl bg-cyan-500/15 px-3 py-2 text-xs font-medium text-cyan-600 dark:text-cyan-300">
                        <Edit size={14} />
                      </button>
                      <button onClick={() => handleDelete(p.id)} className="rounded-xl bg-red-500/15 px-3 py-2 text-xs font-medium text-red-600 dark:text-red-300">
                        <Trash2 size={14} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Modal isOpen={showCreate} onClose={() => { setShowCreate(false); setEditing(null); setImagePreview(null); }} title={editing ? 'Modifier le produit' : 'Nouveau produit'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">Nom<RequiredAsterisk hasError={!form.name && touched.name} /></label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => { setForm({ ...form, name: e.target.value }); setTouched({ ...touched, name: true }); }}
              className={`w-full rounded-2xl border bg-slate-800 px-4 py-3 text-white outline-none focus:border-cyan-500 ${!form.name && touched.name ? 'border-red-500' : 'border-slate-600'}`}
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

export default ProductList;

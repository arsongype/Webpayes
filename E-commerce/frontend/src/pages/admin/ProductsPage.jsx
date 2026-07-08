import { useEffect, useState } from 'react'
import { productAPI } from '../../api/product.api'
import Modal from '../../components/ui/Modal'

export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({
    name: '',
    price: 0,
    stockQuantity: 0,
    categoryId: '',
    description: '',
  })
  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await productAPI.getAll({ size: 100 })
      const list = res.content || res
      setProducts(list)
      const cats = await productAPI.getCategories()
      setCategories(cats)
    } catch (err) {
      console.error('Failed to load products:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const startEdit = (product) => {
    setEditing(product)
    setForm({
      name: product.name || '',
      price: product.price || 0,
      stockQuantity: product.stockQuantity || 0,
      categoryId: product.category?.id || '',
      description: product.description || '',
    })
    setFile(null)
    setPreviewUrl(product.imageUrl || null)
    setIsModalOpen(true)
  }

  const resetForm = () => {
    setEditing(null)
    setForm({ name: '', price: 0, stockQuantity: 0, categoryId: '', description: '' })
    setFile(null)
    setPreviewUrl(null)
    setIsModalOpen(false)
  }

  const openNew = () => {
    setEditing(null)
    setForm({ name: '', price: 0, stockQuantity: 0, categoryId: '', description: '' })
    setFile(null)
    setPreviewUrl(null)
    setIsModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      let savedId = null
      if (editing) {
        const payload = {
          name: form.name,
          description: form.description,
          price: parseFloat(form.price),
          originalPrice: editing.originalPrice || null,
          sku: editing.sku || `SKU-${Date.now()}`,
          imageUrl: editing.imageUrl || null,
          categoryId: form.categoryId ? parseInt(form.categoryId, 10) : null,
          stockQuantity: parseInt(form.stockQuantity, 10) || 0,
          isNew: editing.isNew || false,
          featured: editing.featured || false,
        }
        await productAPI.update(editing.id, payload)
        savedId = editing.id
      } else {
        const payload = {
          name: form.name,
          description: form.description,
          price: parseFloat(form.price),
          originalPrice: null,
          sku: `SKU-${Date.now()}`,
          imageUrl: null,
          categoryId: form.categoryId ? parseInt(form.categoryId, 10) : null,
          stockQuantity: parseInt(form.stockQuantity, 10) || 0,
          isNew: false,
          featured: false,
        }
        const res = await productAPI.create(payload)
        savedId = res?.id || null
      }

      await fetchData()

      // If create returned no id, try to locate the product by name
      if (!savedId) {
        const found = products.find((p) => p.name === form.name)
        if (found) savedId = found.id
      }

      // Upload image if provided and we have an id
      if (file && savedId) {
        try {
          const fd = new FormData()
          fd.append('image', file)
          await productAPI.uploadImage(savedId, fd)
          await fetchData()
        } catch (uploadErr) {
          console.error('Image upload failed:', uploadErr)
          alert('L\'upload de l\'image a échoué')
        }
      }

      resetForm()
    } catch (err) {
      console.error('Failed to save product:', err)
      alert('Erreur lors de la sauvegarde du produit')
    }
  }

  const handleFileChange = (e) => {
    const f = e.target.files?.[0] || null
    setFile(f)
    if (f) {
      const url = URL.createObjectURL(f)
      setPreviewUrl(url)
    } else {
      setPreviewUrl(null)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ce produit ?')) return
    try {
      await productAPI.delete(id)
      await fetchData()
    } catch (err) {
      console.error('Failed to delete product:', err)
      alert('Erreur lors de la suppression')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Gestion des produits</h1>
        <button
          onClick={openNew}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Ajouter un produit
        </button>
      </div>

      <Modal isOpen={isModalOpen} onClose={resetForm} title={editing ? 'Modifier produit' : 'Nouveau produit'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Nom</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Prix</label>
              <input
                type="number"
                step="0.01"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Stock</label>
              <input
                type="number"
                value={form.stockQuantity}
                onChange={(e) => setForm({ ...form, stockQuantity: e.target.value })}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Catégorie</label>
            <select
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              className="w-full px-3 py-2 border rounded"
            >
              <option value="">— Aucune —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 border rounded"
              rows={4}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Image</label>
            <input type="file" accept="image/*" onChange={handleFileChange} className="w-full" />
            {previewUrl && (
              <div className="mt-2">
                <img src={previewUrl} alt="Preview" className="w-32 h-32 object-cover rounded" />
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Enregistrer</button>
            <button type="button" onClick={resetForm} className="px-4 py-2 border rounded">Annuler</button>
          </div>
        </form>
      </Modal>

      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-lg font-semibold mb-4">Liste des produits</h2>
        {loading ? (
          <p>Chargement...</p>
        ) : (
          <div className="space-y-3">
            {products.length === 0 ? (
              <p>Aucun produit trouvé.</p>
            ) : (
              products.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <div className="font-medium">{p.name}</div>
                    <div className="text-xs text-gray-500">{p.category?.name || '—'}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-sm mr-4">{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(p.price)}</div>
                    <button onClick={() => startEdit(p)} className="px-3 py-1 border rounded">Modifier</button>
                    <button onClick={() => handleDelete(p.id)} className="px-3 py-1 bg-red-600 text-white rounded">Supprimer</button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}

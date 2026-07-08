export const categories = [
  { id: 1, name: 'Électronique', slug: 'electronique' },
  { id: 2, name: 'Mode', slug: 'mode' },
  { id: 3, name: 'Maison', slug: 'maison' },
  { id: 4, name: 'Sport', slug: 'sport' },
]

const productImages = {
  electronique: [
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
    'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=500',
    'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500',
    'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=500',
  ],
  mode: [
    'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=500',
    'https://images.unsplash.com/photo-1523381215227-30a93a75bb6e?w=500',
    'https://images.unsplash.com/photo-1551028711-22ff037e3963?w=500',
    'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=500',
    'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500',
  ],
  maison: [
    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500',
    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500',
    'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=500',
    'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=500',
    'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=500',
  ],
  sport: [
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500',
    'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500',
    'https://images.unsplash.com/photo-1517649763961-0c62306601b7?w=500',
    'https://images.unsplash.com/photo-1461896836934-bd45ba0cf6b2?w=500',
    'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=500',
  ],
}

const productDefs = [
  { name: 'Montre Connectée Pro X', categoryId: 1, price: 249.99, originalPrice: 299.99, rating: 4.5, reviewCount: 128, isNew: true, featured: true },
  { name: 'Casque Audio Sans Fil', categoryId: 1, price: 89.99, originalPrice: 119.99, rating: 4.7, reviewCount: 256, isNew: false, featured: true },
  { name: 'Enceinte Bluetooth Portable', categoryId: 1, price: 59.99, rating: 4.3, reviewCount: 89, isNew: true, featured: false },
  { name: 'Tablette 10 pouces', categoryId: 1, price: 349.99, originalPrice: 399.99, rating: 4.6, reviewCount: 67, isNew: false, featured: true },
  { name: 'Clavier Mécanique RGB', categoryId: 1, price: 129.99, rating: 4.8, reviewCount: 312, isNew: true, featured: false },
  { name: 'Veste en Cuir Premium', categoryId: 2, price: 189.99, originalPrice: 249.99, rating: 4.4, reviewCount: 45, isNew: false, featured: true },
  { name: 'Sneakers Urban Style', categoryId: 2, price: 79.99, rating: 4.5, reviewCount: 178, isNew: true, featured: true },
  { name: 'Sac à Main Élégant', categoryId: 2, price: 119.99, originalPrice: 149.99, rating: 4.2, reviewCount: 92, isNew: false, featured: false },
  { name: 'Pull en Laine Mérinos', categoryId: 2, price: 69.99, rating: 4.6, reviewCount: 134, isNew: true, featured: false },
  { name: 'Jean Slim Fit', categoryId: 2, price: 49.99, rating: 4.3, reviewCount: 201, isNew: false, featured: true },
  { name: 'Canapé Scandinave 3 Places', categoryId: 3, price: 599.99, originalPrice: 749.99, rating: 4.7, reviewCount: 56, isNew: false, featured: true },
  { name: 'Lampe de Bureau LED', categoryId: 3, price: 39.99, rating: 4.4, reviewCount: 167, isNew: true, featured: false },
  { name: 'Set de Coussins Déco', categoryId: 3, price: 29.99, rating: 4.1, reviewCount: 78, isNew: false, featured: false },
  { name: 'Machine à Café Automatique', categoryId: 3, price: 449.99, originalPrice: 549.99, rating: 4.8, reviewCount: 234, isNew: true, featured: true },
  { name: 'Tapis Moderne 160x230', categoryId: 3, price: 89.99, rating: 4.2, reviewCount: 43, isNew: false, featured: false },
  { name: 'Tapis de Yoga Premium', categoryId: 4, price: 34.99, rating: 4.6, reviewCount: 189, isNew: true, featured: false },
  { name: 'Haltères Ajustables 20kg', categoryId: 4, price: 149.99, originalPrice: 179.99, rating: 4.5, reviewCount: 112, isNew: false, featured: true },
  { name: 'Vélo d\'Appartement', categoryId: 4, price: 299.99, rating: 4.7, reviewCount: 87, isNew: false, featured: true },
  { name: 'Sac de Sport Imperméable', categoryId: 4, price: 44.99, rating: 4.3, reviewCount: 156, isNew: true, featured: false },
  { name: 'Montre GPS Running', categoryId: 4, price: 199.99, originalPrice: 249.99, rating: 4.8, reviewCount: 203, isNew: true, featured: true },
]

const categorySlugMap = { 1: 'electronique', 2: 'mode', 3: 'maison', 4: 'sport' }

export const products = productDefs.map((def, index) => {
  const id = index + 1
  const category = categories.find((c) => c.id === def.categoryId)
  const slug = categorySlugMap[def.categoryId]
  const images = productImages[slug]
  const imageUrl = images[index % images.length]

  return {
    id,
    name: def.name,
    slug: def.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    description: `${def.name} — Produit de qualité supérieure, sélectionné par nos experts. Livraison rapide et garantie satisfait ou remboursé sous 30 jours.`,
    price: def.price,
    originalPrice: def.originalPrice || null,
    sku: `SKU-${String(id).padStart(4, '0')}`,
    imageUrl,
    images: [imageUrl, images[(index + 1) % images.length]],
    category,
    stockQuantity: Math.floor(Math.random() * 50) + 5,
    rating: def.rating,
    reviewCount: def.reviewCount,
    isNew: def.isNew,
    featured: def.featured,
    createdAt: new Date(Date.now() - index * 86400000 * 3).toISOString(),
  }
})

export const DEMO_USERS = [
  {
    id: 1,
    email: 'demo@shopease.fr',
    password: 'Demo123!',
    firstName: 'Jean',
    lastName: 'Dupont',
    role: 'USER',
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 2,
    email: 'admin@shopease.fr',
    password: 'Admin123!',
    firstName: 'Admin',
    lastName: 'ShopEase',
    role: 'ADMIN',
    createdAt: '2024-01-01T10:00:00Z',
  },
]

-- Users seeded by DataInitializer with BCrypt passwords

INSERT INTO categories (name, slug) VALUES
('Électronique', 'electronique'),
('Mode', 'mode'),
('Maison', 'maison'),
('Sport', 'sport');

INSERT INTO products (name, slug, description, price, original_price, sku, image_url, category_id, stock_quantity, rating, review_count, is_new, featured, created_at) VALUES
('Montre Connectée Pro X', 'montre-connectee-pro-x', 'Montre Connectée Pro X — Produit de qualité supérieure, sélectionné par nos experts.', 249.99, 299.99, 'SKU-0001', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500', 1, 45, 4.5, 128, TRUE, TRUE, CURRENT_TIMESTAMP),
('Casque Audio Sans Fil', 'casque-audio-sans-fil', 'Casque Audio Sans Fil — Produit de qualité supérieure, sélectionné par nos experts.', 89.99, 119.99, 'SKU-0002', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500', 1, 38, 4.7, 256, FALSE, TRUE, CURRENT_TIMESTAMP),
('Enceinte Bluetooth Portable', 'enceinte-bluetooth-portable', 'Enceinte Bluetooth Portable — Produit de qualité supérieure.', 59.99, NULL, 'SKU-0003', 'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=500', 1, 52, 4.3, 89, TRUE, FALSE, CURRENT_TIMESTAMP),
('Tablette 10 pouces', 'tablette-10-pouces', 'Tablette 10 pouces — Produit de qualité supérieure.', 349.99, 399.99, 'SKU-0004', 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500', 1, 22, 4.6, 67, FALSE, TRUE, CURRENT_TIMESTAMP),
('Clavier Mécanique RGB', 'clavier-mecanique-rgb', 'Clavier Mécanique RGB — Produit de qualité supérieure.', 129.99, NULL, 'SKU-0005', 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=500', 1, 30, 4.8, 312, TRUE, FALSE, CURRENT_TIMESTAMP),
('Veste en Cuir Premium', 'veste-en-cuir-premium', 'Veste en Cuir Premium — Produit de qualité supérieure.', 189.99, 249.99, 'SKU-0006', 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=500', 2, 15, 4.4, 45, FALSE, TRUE, CURRENT_TIMESTAMP),
('Sneakers Urban Style', 'sneakers-urban-style', 'Sneakers Urban Style — Produit de qualité supérieure.', 79.99, NULL, 'SKU-0007', 'https://images.unsplash.com/photo-1523381215227-30a93a75bb6e?w=500', 2, 60, 4.5, 178, TRUE, TRUE, CURRENT_TIMESTAMP),
('Sac à Main Élégant', 'sac-a-main-elegant', 'Sac à Main Élégant — Produit de qualité supérieure.', 119.99, 149.99, 'SKU-0008', 'https://images.unsplash.com/photo-1551028711-22ff037e3963?w=500', 2, 25, 4.2, 92, FALSE, FALSE, CURRENT_TIMESTAMP),
('Pull en Laine Mérinos', 'pull-en-laine-merinos', 'Pull en Laine Mérinos — Produit de qualité supérieure.', 69.99, NULL, 'SKU-0009', 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=500', 2, 40, 4.6, 134, TRUE, FALSE, CURRENT_TIMESTAMP),
('Jean Slim Fit', 'jean-slim-fit', 'Jean Slim Fit — Produit de qualité supérieure.', 49.99, NULL, 'SKU-0010', 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500', 2, 55, 4.3, 201, FALSE, TRUE, CURRENT_TIMESTAMP),
('Canapé Scandinave 3 Places', 'canape-scandinave-3-places', 'Canapé Scandinave 3 Places — Produit de qualité supérieure.', 599.99, 749.99, 'SKU-0011', 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500', 3, 8, 4.7, 56, FALSE, TRUE, CURRENT_TIMESTAMP),
('Lampe de Bureau LED', 'lampe-de-bureau-led', 'Lampe de Bureau LED — Produit de qualité supérieure.', 39.99, NULL, 'SKU-0012', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500', 3, 70, 4.4, 167, TRUE, FALSE, CURRENT_TIMESTAMP),
('Set de Coussins Déco', 'set-de-coussins-deco', 'Set de Coussins Déco — Produit de qualité supérieure.', 29.99, NULL, 'SKU-0013', 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=500', 3, 35, 4.1, 78, FALSE, FALSE, CURRENT_TIMESTAMP),
('Machine à Café Automatique', 'machine-a-cafe-automatique', 'Machine à Café Automatique — Produit de qualité supérieure.', 449.99, 549.99, 'SKU-0014', 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=500', 3, 12, 4.8, 234, TRUE, TRUE, CURRENT_TIMESTAMP),
('Tapis Moderne 160x230', 'tapis-moderne-160x230', 'Tapis Moderne 160x230 — Produit de qualité supérieure.', 89.99, NULL, 'SKU-0015', 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=500', 3, 20, 4.2, 43, FALSE, FALSE, CURRENT_TIMESTAMP),
('Tapis de Yoga Premium', 'tapis-de-yoga-premium', 'Tapis de Yoga Premium — Produit de qualité supérieure.', 34.99, NULL, 'SKU-0016', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500', 4, 80, 4.6, 189, TRUE, FALSE, CURRENT_TIMESTAMP),
('Haltères Ajustables 20kg', 'halteres-ajustables-20kg', 'Haltères Ajustables 20kg — Produit de qualité supérieure.', 149.99, 179.99, 'SKU-0017', 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500', 4, 18, 4.5, 112, FALSE, TRUE, CURRENT_TIMESTAMP),
('Vélo d''Appartement', 'velo-d-appartement', 'Vélo d''Appartement — Produit de qualité supérieure.', 299.99, NULL, 'SKU-0018', 'https://images.unsplash.com/photo-1517649763961-0c62306601b7?w=500', 4, 10, 4.7, 87, FALSE, TRUE, CURRENT_TIMESTAMP),
('Sac de Sport Imperméable', 'sac-de-sport-impermeable', 'Sac de Sport Imperméable — Produit de qualité supérieure.', 44.99, NULL, 'SKU-0019', 'https://images.unsplash.com/photo-1461896836934-bd45ba0cf6b2?w=500', 4, 45, 4.3, 156, TRUE, FALSE, CURRENT_TIMESTAMP),
('Montre GPS Running', 'montre-gps-running', 'Montre GPS Running — Produit de qualité supérieure.', 199.99, 249.99, 'SKU-0020', 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=500', 4, 28, 4.8, 203, TRUE, TRUE, CURRENT_TIMESTAMP);

INSERT INTO product_images (product_id, image_url)
SELECT id, image_url FROM products;

INSERT INTO product_images (product_id, image_url) VALUES
(1, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500'),
(2, 'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=500'),
(3, 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500'),
(4, 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=500');

ALTER TABLE payment_methods DROP COLUMN IF EXISTS category_id;
DROP TABLE IF EXISTS payment_method_categories;

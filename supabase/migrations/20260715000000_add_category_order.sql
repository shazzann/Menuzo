-- Add category_order column to shops table to support reordering categories
ALTER TABLE shops ADD COLUMN category_order text[] DEFAULT NULL;

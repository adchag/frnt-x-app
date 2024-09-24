-- Drop the old logo_url column
ALTER TABLE merchant_mandates DROP COLUMN logo_url;

-- Add a new column for storing the image path in Supabase storage
ALTER TABLE merchant_mandates ADD COLUMN logo JSONB;

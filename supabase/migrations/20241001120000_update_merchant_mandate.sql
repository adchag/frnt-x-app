-- Drop the old logo_url column
ALTER TABLE merchant_mandates DROP COLUMN logo_url;

-- Add a new column for storing the image path in Supabase storage
ALTER TABLE merchant_mandates ADD COLUMN logo JSONB;

-- Add a new column for storing multiple files
ALTER TABLE merchant_mandates ADD COLUMN files JSONB[];

-- Update the trigger function to include the new column
CREATE OR REPLACE FUNCTION update_merchant_mandates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger to ensure it uses the updated function
DROP TRIGGER IF EXISTS update_merchant_mandates_updated_at ON merchant_mandates;
CREATE TRIGGER update_merchant_mandates_updated_at
BEFORE UPDATE ON merchant_mandates
FOR EACH ROW
EXECUTE FUNCTION update_merchant_mandates_updated_at();
-- Rename the merchant_mandates table to merchants
ALTER TABLE merchant_mandates RENAME TO merchants;

-- Rename the index
ALTER INDEX idx_merchant_mandates_company_name RENAME TO idx_merchants_company_name;

-- Drop the old trigger
DROP TRIGGER IF EXISTS update_merchant_mandates_updated_at ON merchants;

-- Rename and update the function
CREATE OR REPLACE FUNCTION update_merchants_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the new trigger
CREATE TRIGGER update_merchants_updated_at
BEFORE UPDATE ON merchants
FOR EACH ROW
EXECUTE FUNCTION update_merchants_updated_at();

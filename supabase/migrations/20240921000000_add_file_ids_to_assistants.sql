-- Add file_ids column to assistants table
ALTER TABLE assistants ADD COLUMN file_ids TEXT[];

-- Update the existing update_assistants_updated_at function to include file_ids
CREATE OR REPLACE FUNCTION update_assistants_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger to ensure it uses the updated function
DROP TRIGGER IF EXISTS update_assistants_updated_at ON assistants;
CREATE TRIGGER update_assistants_updated_at
BEFORE UPDATE ON assistants
FOR EACH ROW
EXECUTE FUNCTION update_assistants_updated_at();
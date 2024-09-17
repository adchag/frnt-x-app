-- Drop the existing policy
DROP POLICY IF EXISTS "Give users access to own folder" ON storage.objects;

-- Create a new policy that allows public access to the 'pdfs' bucket
CREATE POLICY "Allow public access to pdfs bucket" ON storage.objects
    FOR ALL USING (bucket_id = 'pdfs');

-- Enable RLS on the storage.objects table
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Grant usage on storage schema to public
GRANT USAGE ON SCHEMA storage TO PUBLIC;

-- Grant all privileges on all tables in storage schema to public
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA storage TO PUBLIC;

-- Grant all privileges on all sequences in storage schema to public
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA storage TO PUBLIC;

-- Insert the 'pdfs' bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('pdfs', 'pdfs', true)
ON CONFLICT (id) DO UPDATE SET public = true;
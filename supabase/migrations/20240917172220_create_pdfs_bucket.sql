-- Create the 'pdfs' bucket
INSERT INTO storage.buckets (id, name)
VALUES ('pdfs', 'pdfs')
ON CONFLICT DO NOTHING;

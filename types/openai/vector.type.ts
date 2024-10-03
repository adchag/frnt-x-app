export interface Vector {
  id: string;
  object: string;
  created_at: number;
  name: string;
  description: string | null;
  metadata: Record<string, any>;
}

export interface VectorFile {
  id: string;
  object: string;
  created_at: number;
  vector_store_id: string;
  file_id: string;
  status: string;
}
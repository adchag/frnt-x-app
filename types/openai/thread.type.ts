export interface Thread {
  id: string;
  object: string;
  created_at: number;
  metadata: Record<string, any>;
  tool_resources?: {
    file_search?: {
      vector_store_ids?: string[];
    };
  };
}
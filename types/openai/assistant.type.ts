export interface Assistant {
  id: string;
  object: string;
  created_at: number;
  name: string;
  description: string | null;
  model: string;
  instructions: string;
  tools: Array<{ type: string }>;
  file_ids: string[];
  metadata: Record<string, any>;
  tool_resources?: {
    file_search?: {
      vector_store_ids?: string[];
    };
  };
}
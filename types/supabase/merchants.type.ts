export type Merchant = {
  id: string;
  company_name: string;
  description: string;
  logo: { url: string };
  created_at: string;
  updated_at: string;
  oa_assistant_id: string | null;
};

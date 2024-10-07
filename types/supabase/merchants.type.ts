// ALTER
 
// TABLE
//  public.merchants
// ADD
 
// COLUMN
//  mandate TEXT,
// ADD
 
// COLUMN
//  size TEXT,
// ADD
 
// COLUMN
//  committed_funds 
// BIGINT
// ,
// ADD
 
// COLUMN
//  structure TEXT,
// ADD
 
// COLUMN
//  start_date 
// TIMESTAMP
 
// WITH
 
// TIME
//  ZONE,
// ADD
 
// COLUMN
//  main_contact TEXT;

export type Merchant = {
  id: string;
  company_name: string;
  description: string;
  logo: { url: string };
  created_at: string;
  updated_at: string;
  oa_assistant_id: string | null;
  mandate: string;
  size: string;
  committed_funds: number;
  structure: string;
  start_date: string;
  main_contact: string;
};

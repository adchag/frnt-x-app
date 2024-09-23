-- Create merchant_mandates table
CREATE TABLE merchant_mandates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_name VARCHAR(255) NOT NULL,
  logo_url TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create an index on company_name for faster lookups
CREATE INDEX idx_merchant_mandates_company_name ON merchant_mandates(company_name);
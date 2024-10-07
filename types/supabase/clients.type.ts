//  CREATE TABLE
//   public.clients (
//     id UUID NOT NULL DEFAULT extensions.uuid_generate_v4 (),
//     first_name TEXT NOT NULL,
//     last_name TEXT NOT NULL,
//     email TEXT NOT NULL,
//     company_id UUID NOT NULL,
//     ROLE TEXT NOT NULL,
//     created_at TIMESTAMP WITH TIME ZONE NULL DEFAULT CURRENT_TIMESTAMP,
//     updated_at TIMESTAMP WITH TIME ZONE NULL DEFAULT CURRENT_TIMESTAMP,
//     CONSTRAINT clients_pkey PRIMARY KEY (id),
//     CONSTRAINT clients_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies (id) ON DELETE CASCADE
// // ) TABLESPACE pg_default;

// CREATE INDEX IF NOT EXISTS idx_clients_email ON public.clients USING btree (email) TABLESPACE pg_default;

export type Client = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  company_id: string;
  role: string;
  created_at: string;
};

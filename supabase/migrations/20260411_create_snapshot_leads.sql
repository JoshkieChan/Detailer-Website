-- Migration: create_snapshot_leads.sql
-- Description: Create table for recording lead magnet signups (Life & Money Snapshot)

CREATE TABLE IF NOT EXISTS public.snapshot_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.snapshot_leads ENABLE ROW LEVEL SECURITY;

-- Allow service role to manage everything
CREATE POLICY "Service role can manage snapshot leads"
ON public.snapshot_leads
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Allow public to insert (for edge function usage, though edge function often bypasses RLS with service_role key)
-- But for extra safety, we allow insert with no auth if we want, 
-- though the edge function will likely use service_role.

-- Migration: HR Connections table for ReachPilot
-- This migration is idempotent and safe to re-run

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "citext";

-- Drop existing constraints if they exist (for idempotency)
DO $$
BEGIN
    -- Drop existing unique constraint on email alone if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'hr_contacts' 
        AND constraint_type = 'UNIQUE' 
        AND constraint_name LIKE '%email%'
        AND constraint_name NOT LIKE '%created_by_email%'
    ) THEN
        ALTER TABLE public.hr_contacts DROP CONSTRAINT IF EXISTS hr_contacts_email_key;
        ALTER TABLE public.hr_contacts DROP CONSTRAINT IF EXISTS unique_email;
    END IF;
END $$;

-- Create hr_contacts table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.hr_contacts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamptz NOT NULL DEFAULT now(),
    created_by_email citext NOT NULL,
    email citext NOT NULL,
    name text,
    linkedin_url text
);

-- Drop existing constraints if they exist (for re-runs)
ALTER TABLE public.hr_contacts DROP CONSTRAINT IF EXISTS unique_user_contact_email;
ALTER TABLE public.hr_contacts DROP CONSTRAINT IF EXISTS hr_contacts_created_by_email_email_key;

-- Add unique constraint on (created_by_email, email) for per-user uniqueness
ALTER TABLE public.hr_contacts 
ADD CONSTRAINT unique_user_contact_email 
UNIQUE (created_by_email, email);

-- Create indexes for performance
DROP INDEX IF EXISTS idx_hr_contacts_created_by_email;
DROP INDEX IF EXISTS idx_hr_contacts_created_at;

CREATE INDEX idx_hr_contacts_created_by_email ON public.hr_contacts (created_by_email);
CREATE INDEX idx_hr_contacts_created_at ON public.hr_contacts (created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.hr_contacts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Users can access their own contacts" ON public.hr_contacts;
DROP POLICY IF EXISTS "Users can view own contacts" ON public.hr_contacts;
DROP POLICY IF EXISTS "Users can insert own contacts" ON public.hr_contacts;
DROP POLICY IF EXISTS "Users can update own contacts" ON public.hr_contacts;
DROP POLICY IF EXISTS "Users can delete own contacts" ON public.hr_contacts;

-- Note: We intentionally do NOT create public policies since we use service role in API routes
-- RLS is enabled to protect against accidental access, but API routes will use service role
-- which bypasses RLS policies

-- Migrate legacy data if it exists (set created_by_email for existing records)
-- This is a placeholder - adjust the email as needed for your use case
DO $$
BEGIN
    -- If there are existing records without created_by_email, you can set them to a default user
    -- UPDATE public.hr_contacts 
    -- SET created_by_email = 'your-admin-email@example.com'
    -- WHERE created_by_email IS NULL;
    
    -- For now, we'll just ensure the column is not null for new records
    NULL;
END $$;

-- Add comments for documentation
COMMENT ON TABLE public.hr_contacts IS 'HR/Recruiter contacts for ReachPilot users';
COMMENT ON COLUMN public.hr_contacts.id IS 'Primary key UUID';
COMMENT ON COLUMN public.hr_contacts.created_at IS 'Timestamp when contact was created';
COMMENT ON COLUMN public.hr_contacts.created_by_email IS 'Email of the user who owns this contact (NextAuth session email)';
COMMENT ON COLUMN public.hr_contacts.email IS 'Email address of the HR/recruiter contact (unique per user)';
COMMENT ON COLUMN public.hr_contacts.name IS 'Optional name of the contact';
COMMENT ON COLUMN public.hr_contacts.linkedin_url IS 'Optional LinkedIn profile URL';
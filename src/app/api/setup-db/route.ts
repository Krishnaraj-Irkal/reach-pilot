import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

/**
 * Setup endpoint to create the hr_contacts table if it doesn't exist
 * This is a development utility - remove in production
 */
export async function POST() {
    try {
        const supabase = supabaseServer();

        // Create the table using raw SQL
        const { error: setupError } = await supabase.rpc('exec_sql', {
            sql: `
        -- Enable required extensions
        CREATE EXTENSION IF NOT EXISTS "pgcrypto";
        CREATE EXTENSION IF NOT EXISTS "citext";

        -- Create hr_contacts table if it doesn't exist
        CREATE TABLE IF NOT EXISTS public.hr_contacts (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            created_at timestamptz NOT NULL DEFAULT now(),
            created_by_email citext NOT NULL,
            email citext NOT NULL,
            name text,
            linkedin_url text
        );

        -- Add unique constraint on (created_by_email, email) for per-user uniqueness
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.table_constraints 
                WHERE table_name = 'hr_contacts' 
                AND constraint_name = 'unique_user_contact_email'
            ) THEN
                ALTER TABLE public.hr_contacts 
                ADD CONSTRAINT unique_user_contact_email 
                UNIQUE (created_by_email, email);
            END IF;
        END $$;

        -- Create indexes for performance
        CREATE INDEX IF NOT EXISTS idx_hr_contacts_created_by_email ON public.hr_contacts (created_by_email);
        CREATE INDEX IF NOT EXISTS idx_hr_contacts_created_at ON public.hr_contacts (created_at DESC);

        -- Enable Row Level Security
        ALTER TABLE public.hr_contacts ENABLE ROW LEVEL SECURITY;
      `
        });

        if (setupError) {
            // Try alternative approach - direct table creation
            const { error: createError } = await supabase
                .from('hr_contacts')
                .select('count(*)')
                .limit(1);

            if (createError?.code === '42P01') {
                // Table doesn't exist, create it manually via SQL query
                const { error: sqlError } = await supabase.rpc('run_sql', {
                    query: `
            CREATE TABLE IF NOT EXISTS public.hr_contacts (
                id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                created_at timestamptz NOT NULL DEFAULT now(),
                created_by_email text NOT NULL,
                email text NOT NULL,
                name text,
                linkedin_url text,
                UNIQUE(created_by_email, email)
            );
            
            CREATE INDEX IF NOT EXISTS idx_hr_contacts_created_by_email ON public.hr_contacts (created_by_email);
            CREATE INDEX IF NOT EXISTS idx_hr_contacts_created_at ON public.hr_contacts (created_at DESC);
            
            ALTER TABLE public.hr_contacts ENABLE ROW LEVEL SECURITY;
          `
                });

                if (sqlError) {
                    return NextResponse.json({
                        success: false,
                        error: 'Failed to create table via SQL',
                        details: sqlError.message
                    }, { status: 500 });
                }
            } else {
                return NextResponse.json({
                    success: false,
                    error: 'Setup failed',
                    details: setupError.message
                }, { status: 500 });
            }
        }

        // Test if table was created successfully
        const { data: testData, error: testError } = await supabase
            .from('hr_contacts')
            .select('count(*)')
            .limit(1);

        if (testError) {
            return NextResponse.json({
                success: false,
                error: 'Table creation verification failed',
                details: testError.message
            }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: 'Database setup completed successfully',
            tableCreated: true
        });

    } catch (error) {
        console.error('Setup DB endpoint error:', error);
        return NextResponse.json({
            success: false,
            error: 'Unexpected error during setup',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
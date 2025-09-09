import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

/**
 * Test endpoint to verify database connection and table existence
 */
export async function GET() {
    try {
        const supabase = supabaseServer();

        // Test 1: Check if we can connect to Supabase
        const { data: connectionTest, error: connectionError } = await supabase
            .from('hr_contacts')
            .select('count(*)')
            .limit(1);

        if (connectionError) {
            return NextResponse.json({
                success: false,
                error: 'Database connection failed',
                details: connectionError.message,
                code: connectionError.code
            }, { status: 500 });
        }

        // Test 2: Try to insert a test record (and immediately delete it)
        const testEmail = `test-${Date.now()}@example.com`;
        const { data: insertTest, error: insertError } = await supabase
            .from('hr_contacts')
            .insert({
                created_by_email: 'test@example.com',
                email: testEmail,
                name: 'Test Contact'
            })
            .select()
            .single();

        if (insertError) {
            return NextResponse.json({
                success: false,
                error: 'Database insert failed',
                details: insertError.message,
                code: insertError.code
            }, { status: 500 });
        }

        // Clean up test record
        await supabase
            .from('hr_contacts')
            .delete()
            .eq('id', insertTest.id);

        return NextResponse.json({
            success: true,
            message: 'Database connection and table are working correctly',
            tableExists: true,
            canInsert: true,
            canDelete: true
        });

    } catch (error) {
        console.error('Test DB endpoint error:', error);
        return NextResponse.json({
            success: false,
            error: 'Unexpected error',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { supabaseServer } from '@/lib/supabase/server';
import { validateConnection } from '@/lib/validators';
import type { Connection, CreateConnectionRequest, ConnectionsListResponse, ConnectionError } from '@/types/connections';

/**
 * GET /api/app/connections
 * List connections for the current user with optional search and pagination
 */
export async function GET(request: NextRequest) {
    try {
        // Check authentication
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json(
                { error: 'unauthorized' } as ConnectionError,
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search') || '';
        const limitParam = searchParams.get('limit');
        const cursor = searchParams.get('cursor');

        // Validate and sanitize limit parameter
        let limit = 50; // default
        if (limitParam) {
            const parsedLimit = parseInt(limitParam, 10);
            if (isNaN(parsedLimit) || parsedLimit < 1) {
                limit = 50;
            } else if (parsedLimit > 100) {
                limit = 100; // maximum
            } else {
                limit = parsedLimit;
            }
        }

        const supabase = supabaseServer();

        // Build the query
        let query = supabase
            .from('hr_contacts')
            .select('*')
            .eq('created_by_email', session.user.email)
            .order('created_at', { ascending: false })
            .limit(limit + 1); // Get one extra to check if there are more

        // Apply search filter if provided
        if (search.trim()) {
            const searchTerm = `%${search.trim()}%`;
            query = query.or(`email.ilike.${searchTerm},name.ilike.${searchTerm}`);
        }

        // Apply cursor-based pagination if provided
        if (cursor) {
            try {
                const [cursorDate, cursorId] = cursor.split('|');
                query = query.or(`created_at.lt.${cursorDate},and(created_at.eq.${cursorDate},id.lt.${cursorId})`);
            } catch (error) {
                // Invalid cursor format, ignore pagination
                console.warn('Invalid cursor format:', cursor);
            }
        }

        const { data, error } = await query;

        if (error) {
            console.error('Database error:', error);
            return NextResponse.json(
                { error: 'Database query failed' },
                { status: 500 }
            );
        }

        // Check if there are more results
        const hasMore = data.length > limit;
        const connections = hasMore ? data.slice(0, limit) : data;

        // Generate next cursor if there are more results
        let nextCursor: string | undefined;
        if (hasMore && connections.length > 0) {
            const lastConnection = connections[connections.length - 1];
            nextCursor = `${lastConnection.created_at}|${lastConnection.id}`;
        }

        const response: ConnectionsListResponse = {
            data: connections as Connection[],
            has_more: hasMore,
            next_cursor: nextCursor,
        };

        return NextResponse.json(response);

    } catch (error) {
        console.error('Unexpected error in GET /api/app/connections:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/app/connections
 * Create a new connection for the current user
 */
export async function POST(request: NextRequest) {
    try {
        // Check authentication
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json(
                { error: 'unauthorized' } as ConnectionError,
                { status: 401 }
            );
        }

        // Parse and validate request body
        let body: CreateConnectionRequest;
        try {
            body = await request.json();
        } catch (error) {
            return NextResponse.json(
                { error: 'validation_error', message: 'Invalid JSON in request body' } as ConnectionError,
                { status: 400 }
            );
        }

        // Validate the connection data
        const validation = validateConnection({
            email: body.email,
            name: body.name,
            linkedin_url: body.linkedin_url,
        });

        if (!validation.isValid) {
            return NextResponse.json(
                {
                    error: 'validation_error',
                    message: 'Validation failed',
                    details: validation.errors
                },
                { status: 422 }
            );
        }

        const supabase = supabaseServer();

        // Check for duplicate email for this user
        const { data: existingContact } = await supabase
            .from('hr_contacts')
            .select('id')
            .eq('created_by_email', session.user.email)
            .eq('email', validation.normalized.email)
            .single();

        if (existingContact) {
            return NextResponse.json(
                { error: 'duplicate_email', message: 'A contact with this email already exists' } as ConnectionError,
                { status: 409 }
            );
        }

        // Insert the new connection
        const { data, error } = await supabase
            .from('hr_contacts')
            .insert({
                created_by_email: session.user.email,
                email: validation.normalized.email,
                name: validation.normalized.name,
                linkedin_url: validation.normalized.linkedin_url,
            })
            .select()
            .single();

        if (error) {
            console.error('Database error creating connection:', error);

            // Check if it's a unique constraint violation
            if (error.code === '23505' && error.message.includes('unique_user_contact_email')) {
                return NextResponse.json(
                    { error: 'duplicate_email', message: 'A contact with this email already exists' } as ConnectionError,
                    { status: 409 }
                );
            }

            return NextResponse.json(
                { error: 'Database insertion failed' },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { data: data as Connection },
            { status: 201 }
        );

    } catch (error) {
        console.error('Unexpected error in POST /api/app/connections:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { supabaseServer } from '@/lib/supabase/server';
import { validateConnection } from '@/lib/validators';
import type { Connection, UpdateConnectionRequest, ConnectionResponse, ConnectionError } from '@/types/connections';

type RouteParams = {
    params: {
        id: string;
    };
};

/**
 * Helper function to get connection by ID with ownership check
 */
async function getConnectionByIdForUser(id: string, userEmail: string) {
    const supabase = supabaseServer();

    const { data, error } = await supabase
        .from('hr_contacts')
        .select('*')
        .eq('id', id)
        .eq('created_by_email', userEmail)
        .single();

    return { data, error };
}

/**
 * GET /api/app/connections/[id]
 * Fetch a single connection by ID (must be owned by current user)
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        // Check authentication
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json(
                { error: 'unauthorized' } as ConnectionError,
                { status: 401 }
            );
        }

        const { id } = params;

        // Validate UUID format
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(id)) {
            return NextResponse.json(
                { error: 'not_found', message: 'Invalid connection ID format' } as ConnectionError,
                { status: 404 }
            );
        }

        const { data, error } = await getConnectionByIdForUser(id, session.user.email);

        if (error || !data) {
            return NextResponse.json(
                { error: 'not_found', message: 'Connection not found' } as ConnectionError,
                { status: 404 }
            );
        }

        const response: ConnectionResponse = {
            data: data as Connection,
        };

        return NextResponse.json(response);

    } catch (error) {
        console.error('Unexpected error in GET /api/app/connections/[id]:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

/**
 * PATCH /api/app/connections/[id]
 * Update a connection (must be owned by current user)
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
    try {
        // Check authentication
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json(
                { error: 'unauthorized' } as ConnectionError,
                { status: 401 }
            );
        }

        const { id } = params;

        // Validate UUID format
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(id)) {
            return NextResponse.json(
                { error: 'not_found', message: 'Invalid connection ID format' } as ConnectionError,
                { status: 404 }
            );
        }

        // Check if connection exists and is owned by user
        const { data: existingConnection, error: fetchError } = await getConnectionByIdForUser(id, session.user.email);

        if (fetchError || !existingConnection) {
            return NextResponse.json(
                { error: 'not_found', message: 'Connection not found' } as ConnectionError,
                { status: 404 }
            );
        }

        // Parse and validate request body
        let body: UpdateConnectionRequest;
        try {
            body = await request.json();
        } catch (error) {
            return NextResponse.json(
                { error: 'validation_error', message: 'Invalid JSON in request body' } as ConnectionError,
                { status: 400 }
            );
        }

        // Build update data - only include fields that are provided
        const updateData: Partial<UpdateConnectionRequest> = {};

        if (body.email !== undefined) {
            updateData.email = body.email;
        }
        if (body.name !== undefined) {
            updateData.name = body.name;
        }
        if (body.linkedin_url !== undefined) {
            updateData.linkedin_url = body.linkedin_url;
        }

        // If no fields to update, return current data
        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({
                data: existingConnection as Connection,
            });
        }

        // Validate the update data
        const validation = validateConnection({
            email: updateData.email ?? existingConnection.email,
            name: updateData.name ?? existingConnection.name,
            linkedin_url: updateData.linkedin_url ?? existingConnection.linkedin_url,
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

        // Check for duplicate email if email is being changed
        if (updateData.email && validation.normalized.email !== existingConnection.email) {
            const { data: duplicateCheck } = await supabase
                .from('hr_contacts')
                .select('id')
                .eq('created_by_email', session.user.email)
                .eq('email', validation.normalized.email)
                .neq('id', id)
                .single();

            if (duplicateCheck) {
                return NextResponse.json(
                    { error: 'duplicate_email', message: 'A contact with this email already exists' } as ConnectionError,
                    { status: 409 }
                );
            }
        }

        // Prepare the update object with normalized values
        const normalizedUpdate: Record<string, string | null> = {};

        if (updateData.email !== undefined) {
            normalizedUpdate.email = validation.normalized.email;
        }
        if (updateData.name !== undefined) {
            normalizedUpdate.name = validation.normalized.name;
        }
        if (updateData.linkedin_url !== undefined) {
            normalizedUpdate.linkedin_url = validation.normalized.linkedin_url;
        }

        // Update the connection
        const { data, error } = await supabase
            .from('hr_contacts')
            .update(normalizedUpdate)
            .eq('id', id)
            .eq('created_by_email', session.user.email)
            .select()
            .single();

        if (error) {
            console.error('Database error updating connection:', error);

            // Check if it's a unique constraint violation
            if (error.code === '23505' && error.message.includes('unique_user_contact_email')) {
                return NextResponse.json(
                    { error: 'duplicate_email', message: 'A contact with this email already exists' } as ConnectionError,
                    { status: 409 }
                );
            }

            return NextResponse.json(
                { error: 'Database update failed' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            data: data as Connection,
        });

    } catch (error) {
        console.error('Unexpected error in PATCH /api/app/connections/[id]:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/app/connections/[id]
 * Delete a connection (must be owned by current user)
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        // Check authentication
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json(
                { error: 'unauthorized' } as ConnectionError,
                { status: 401 }
            );
        }

        const { id } = params;

        // Validate UUID format
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(id)) {
            return NextResponse.json(
                { error: 'not_found', message: 'Invalid connection ID format' } as ConnectionError,
                { status: 404 }
            );
        }

        // Check if connection exists and is owned by user
        const { data: existingConnection, error: fetchError } = await getConnectionByIdForUser(id, session.user.email);

        if (fetchError || !existingConnection) {
            return NextResponse.json(
                { error: 'not_found', message: 'Connection not found' } as ConnectionError,
                { status: 404 }
            );
        }

        const supabase = supabaseServer();

        // Delete the connection
        const { error } = await supabase
            .from('hr_contacts')
            .delete()
            .eq('id', id)
            .eq('created_by_email', session.user.email);

        if (error) {
            console.error('Database error deleting connection:', error);
            return NextResponse.json(
                { error: 'Database deletion failed' },
                { status: 500 }
            );
        }

        return NextResponse.json({}, { status: 204 });

    } catch (error) {
        console.error('Unexpected error in DELETE /api/app/connections/[id]:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
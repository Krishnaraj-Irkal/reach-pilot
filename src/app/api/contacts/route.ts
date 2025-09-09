import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

export async function GET() {
    const supabase = supabaseServer();
    const { data, error } = await supabase
        .from('hr_contacts')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data });
}

export async function POST(req: Request) {
    const body = await req.json().catch(() => ({}));
    const { email, name, linkedin_url } = body as {
        email?: string; name?: string; linkedin_url?: string;
    };

    if (!email) return NextResponse.json({ error: 'email required' }, { status: 400 });

    const supabase = supabaseServer();
    const { data, error } = await supabase
        .from('hr_contacts')
        .insert([{ email, name, linkedin_url }])
        .select('*')
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data }, { status: 201 });
}

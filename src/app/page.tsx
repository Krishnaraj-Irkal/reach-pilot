'use client';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

type Contact = { id: string; email: string; name?: string; linkedin_url?: string; created_at: string };

export default function Home() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const { data: session, status } = useSession();

  async function load() {
    const res = await fetch('/api/contacts', { cache: 'no-store' });
    const json = await res.json();
    setContacts(json.data ?? []);
  }

  async function add() {
    if (!email) return;
    await fetch('/api/contacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name }),
    });
    setEmail(''); setName('');
    load();
  }

  useEffect(() => { load(); }, []);
  if (status === "loading") return null;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">ReachPilot · Next + Supabase</h1>

        <section className="mt-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Add Contact (server write)</h3>
          <div className="flex gap-3">
            <input
              placeholder="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              placeholder="name"
              value={name}
              onChange={e => setName(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={add}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
            >
              Add
            </button>
          </div>
        </section>

        <section className="mt-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Contacts</h3>
          <div className="bg-gray-50 rounded-md p-4">
            {contacts.length > 0 ? (
              <ul className="space-y-2">
                {contacts.map(c => (
                  <li key={c.id} className="text-gray-700">
                    {c.email} {c.name ? `– ${c.name}` : ''}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 italic">No contacts yet. Add your first contact above!</p>
            )}
          </div>
        </section>
        <div className="mt-8 pt-6 border-t border-gray-200">
          {status === "authenticated" ? (
            <div className="flex items-center justify-between">
              <p className="text-gray-600">Signed in as <span className="font-medium">{session?.user?.email}</span></p>
              <div className="space-x-4">
                <Link
                  href="/dashboard"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
                >
                  Go to Dashboard
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/signin" })}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md font-medium"
                >
                  Sign out
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-gray-600 mb-4">Sign in to access your dashboard and manage contacts</p>
              <Link
                href="/signin"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

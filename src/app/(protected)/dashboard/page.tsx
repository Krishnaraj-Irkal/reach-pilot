'use client';

import { withAuth } from '@/components/auth/withAuth';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

function Dashboard() {
  const { data: session } = useSession();

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-lg text-gray-600">Welcome back, {session?.user?.email}!</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Total Contacts</h3>
          <p className="text-3xl font-bold text-blue-600">247</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Active Campaigns</h3>
          <p className="text-3xl font-bold text-green-600">12</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Open Positions</h3>
          <p className="text-3xl font-bold text-purple-600">8</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Response Rate</h3>
          <p className="text-3xl font-bold text-indigo-600">24%</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/contacts" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold text-blue-600 mb-2">👥 Manage Contacts</h2>
          <p className="text-gray-600">Add, edit, and organize your HR contacts</p>
        </Link>

        <Link href="/campaigns" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold text-green-600 mb-2">📧 Create Campaign</h2>
          <p className="text-gray-600">Launch new email outreach campaigns</p>
        </Link>

        <Link href="/ats" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold text-purple-600 mb-2">🎯 Post New Job</h2>
          <p className="text-gray-600">Add job openings to your ATS</p>
        </Link>

        <Link href="/analytics" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold text-red-600 mb-2">📈 View Analytics</h2>
          <p className="text-gray-600">Track performance and metrics</p>
        </Link>

        <Link href="/sequences" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold text-indigo-600 mb-2">🔄 Email Sequences</h2>
          <p className="text-gray-600">Automate your outreach workflow</p>
        </Link>

        <Link href="/settings" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold text-gray-600 mb-2">⚙️ Settings</h2>
          <p className="text-gray-600">Manage your account preferences</p>
        </Link>
      </div>
    </div>
  );
}

export default withAuth(Dashboard);
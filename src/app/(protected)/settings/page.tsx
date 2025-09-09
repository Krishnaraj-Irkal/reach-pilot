'use client';

import { withAuth } from '@/components/auth/withAuth';

function AccountSettings() {
    return (
        <div>
            <h1>Account Settings</h1>
            <p>This is a protected settings page - you can only see this if you&apos;re authenticated!</p>
        </div>
    );
}

export default withAuth(AccountSettings);
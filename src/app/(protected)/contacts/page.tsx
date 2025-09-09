'use client';

import { withAuth } from '@/components/auth/withAuth';

function ContactManager() {
    return (
        <div>
            <h1>Contact Manager</h1>
            <p>This is a protected contacts page - you can only see this if you&apos;re authenticated!</p>
        </div>
    );
}

export default withAuth(ContactManager);
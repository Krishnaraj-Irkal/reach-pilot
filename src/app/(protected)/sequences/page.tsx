'use client';

import { withAuth } from '@/components/auth/withAuth';

function EmailSequences() {
    return (
        <div>
            <h1>Email Sequences</h1>
            <p>This is a protected sequences page - you can only see this if you&apos;re authenticated!</p>
        </div>
    );
}

export default withAuth(EmailSequences);
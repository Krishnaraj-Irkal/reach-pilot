'use client';

import { withAuth } from '@/components/auth/withAuth';

function EmailTemplates() {
    return (
        <div>
            <h1>Email Templates</h1>
            <p>This is a protected templates page - you can only see this if you&apos;re authenticated!</p>
        </div>
    );
}

export default withAuth(EmailTemplates);
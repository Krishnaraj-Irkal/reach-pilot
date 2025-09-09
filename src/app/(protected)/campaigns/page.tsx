'use client';

import { withAuth } from '@/components/auth/withAuth';

function EmailCampaigns() {
    return (
        <div>
            <h1>Email Campaigns</h1>
            <p>This is a protected campaigns page - you can only see this if you&apos;re authenticated!</p>
        </div>
    );
}

export default withAuth(EmailCampaigns);
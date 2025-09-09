'use client';

import { withAuth } from '@/components/auth/withAuth';

function AnalyticsOverview() {
    return (
        <div>
            <h1>Analytics Overview</h1>
            <p>This is a protected analytics page - you can only see this if you&apos;re authenticated!</p>
        </div>
    );
}

export default withAuth(AnalyticsOverview);
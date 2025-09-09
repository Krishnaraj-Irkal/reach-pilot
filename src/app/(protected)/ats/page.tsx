'use client';

import { withAuth } from '@/components/auth/withAuth';

function ATS() {
    return (
        <div>
            <h1>Applicant Tracking System</h1>
            <p>This is a protected ATS page - you can only see this if you&apos;re authenticated!</p>
        </div>
    );
}

export default withAuth(ATS);
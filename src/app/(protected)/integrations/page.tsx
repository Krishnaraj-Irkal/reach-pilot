'use client';

import { withAuth } from '@/components/auth/withAuth';

function Integrations() {
  return (
    <div>
      <h1>Integrations</h1>
      <p>This is a protected integrations page - you can only see this if you&apos;re authenticated!</p>
    </div>
  );
}

export default withAuth(Integrations);
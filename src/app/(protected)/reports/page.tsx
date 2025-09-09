'use client';

import { withAuth } from '@/components/auth/withAuth';

function Reports() {
  return (
    <div>
      <h1>Reports</h1>
      <p>This is a protected reports page - you can only see this if you&apos;re authenticated!</p>
    </div>
  );
}

export default withAuth(Reports);
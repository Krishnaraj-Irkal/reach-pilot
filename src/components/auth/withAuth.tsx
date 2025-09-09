'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function withAuth<T extends Record<string, any>>(
    WrappedComponent: React.ComponentType<T>
) {
    return function AuthenticatedComponent(props: T) {
        const { data: session, status } = useSession();
        const router = useRouter();

        useEffect(() => {
            if (status === 'loading') return; // Still loading

            if (!session) {
                router.push('/signin');
                return;
            }
        }, [session, status, router]);

        // Show loading while checking authentication
        if (status === 'loading') {
            return (
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-lg">Loading...</div>
                </div>
            );
        }

        // Don't render the component if not authenticated
        if (!session) {
            return null;
        }

        // Render the protected component
        return <WrappedComponent {...props} />;
    };
}
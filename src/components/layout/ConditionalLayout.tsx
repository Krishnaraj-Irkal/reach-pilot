'use client';

import { usePathname } from 'next/navigation';
import PublicHeader from './PublicHeader';
import Footer from './Footer';

export default function ConditionalLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    // Check if we're in a protected route
    const isProtectedRoute = pathname.startsWith('/dashboard') ||
        pathname.startsWith('/connections') ||
        pathname.startsWith('/campaigns') ||
        pathname.startsWith('/ats') ||
        pathname.startsWith('/analytics') ||
        pathname.startsWith('/sequences') ||
        pathname.startsWith('/templates') ||
        pathname.startsWith('/reports') ||
        pathname.startsWith('/integrations') ||
        pathname.startsWith('/settings');

    if (isProtectedRoute) {
        // Protected routes: just return children (they have their own layout)
        return <>{children}</>;
    }

    // Public routes: include header and footer
    return (
        <div className="min-h-screen flex flex-col">
            <PublicHeader />
            <main className="flex-1">
                {children}
            </main>
            <Footer />
        </div>
    );
}
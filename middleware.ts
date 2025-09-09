import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(req) {
        // This function runs after NextAuth has verified the token
        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: ({ token }) => {
                // Check if user has valid token
                return !!token;
            },
        },
    }
);

// Configure which routes require authentication
export const config = {
    matcher: [
        // Protected route group
        "/(protected)/:path*",
        // API routes that require authentication
        "/api/app/:path*",
        // Individual protected routes (if any exist outside of (protected) group)
        "/connections/:path*",
        "/campaigns/:path*",
        "/ats/:path*",
        "/dashboard/:path*",
        "/analytics/:path*",
        "/sequences/:path*",
        "/templates/:path*",
        "/integrations/:path*",
        "/reports/:path*",
        "/settings/:path*"
    ],
};
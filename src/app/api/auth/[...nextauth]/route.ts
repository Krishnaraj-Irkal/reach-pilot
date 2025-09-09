import NextAuth, { type AuthOptions } from "next-auth";
import Google from "next-auth/providers/google";
import AzureAD from "next-auth/providers/azure-ad";

export const authOptions: AuthOptions = {
    session: {
        // Store session as a signed JWT cookie (no DB)
        strategy: "jwt",
    },
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            // minimal scopes for sign-in; later we’ll request send scopes at send time
            authorization: { params: { prompt: "consent", access_type: "offline", scope: "openid email profile" } },
        }),
    ],
    pages: {
        signIn: "/signin",
        // (optional) error: "/signin",
    },
    callbacks: {
        // enrich the token with minimal identity
        async jwt({ token, account, profile }) {
            if (account?.provider) token.provider = account.provider;
            if (profile && "email" in profile && typeof profile.email === "string") {
                token.email = profile.email;
            }
            return token;
        },
        async session({ session, token }) {
            // expose provider + email on session.user
            if (session.user) {
                session.user.email = (token.email as string) ?? session.user.email;
                (session as any).provider = token.provider;
            }
            return session;
        },
        // Redirect to dashboard after successful sign-in
        async redirect({ url, baseUrl }) {
            // If signing in, redirect to dashboard
            if (url === baseUrl) {
                return `${baseUrl}/dashboard`;
            }
            // Allow relative callback URLs
            if (url.startsWith("/")) {
                return `${baseUrl}${url}`;
            }
            // Allow callback URLs on the same origin
            if (new URL(url).origin === baseUrl) {
                return url;
            }
            return baseUrl;
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

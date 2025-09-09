"use client";

import { signIn } from "next-auth/react";

export default function SignInPage() {
    return (
        <main className="min-h-dvh grid place-items-center p-6">
            <div className="w-full max-w-sm border rounded-xl p-6 shadow-sm">
                <h1 className="text-xl font-semibold mb-4">Sign in to ReachPilot</h1>
                <p className="text-sm text-neutral-600 mb-6">Choose your account provider</p>
                <div className="grid gap-3">
                    <button
                        onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                        className="w-full rounded-md border px-4 py-2 hover:bg-neutral-50"
                    >
                        Continue with Google
                    </button>
                </div>
                <p className="text-xs text-neutral-500 mt-6">
                    By continuing, you agree to our Terms and acknowledge our Privacy Policy.
                </p>
            </div>
        </main>
    );
}

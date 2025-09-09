'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';

export default function PublicHeader() {
    const { data: session } = useSession();

    return (
        <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center">
                        <Link href="/" className="text-xl font-bold text-gray-900">
                            ReachPilot
                        </Link>
                    </div>

                    <nav className="hidden md:flex space-x-8">
                        <Link href="/" className="text-gray-700 hover:text-gray-900">
                            Home
                        </Link>
                        <Link href="/about" className="text-gray-700 hover:text-gray-900">
                            About
                        </Link>
                        <Link href="/features" className="text-gray-700 hover:text-gray-900">
                            Features
                        </Link>
                        <Link href="/pricing" className="text-gray-700 hover:text-gray-900">
                            Pricing
                        </Link>
                        <Link href="/contact-us" className="text-gray-700 hover:text-gray-900">
                            Contact
                        </Link>
                    </nav>

                    <div className="flex items-center space-x-4">
                        {session ? (
                            <Link
                                href="/dashboard"
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link href="/signin" className="text-gray-700 hover:text-gray-900">
                                    Sign In
                                </Link>
                                <Link
                                    href="/signup"
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                                >
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
'use client';

import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, User, LogOut, Settings, ChevronDown } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

export default function DashboardHeader() {
    const { data: session } = useSession();
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [notifications] = useState(3);
    const profileMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
                setShowProfileMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <motion.header
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="bg-white border-b border-[#E5E7EB] z-30 relative flex-shrink-0 w-full"
            style={{ height: '72px' }}
        >
            <div className="flex items-center justify-end h-full px-8">
                <div className="flex items-center space-x-4">
                    {/* Notifications */}
                    <motion.button
                        whileHover={{ scale: 1.05, y: -1 }}
                        whileTap={{ scale: 0.95 }}
                        className="relative p-3 rounded-xl hover:bg-[#F8F9FD] transition-all duration-200 group"
                    >
                        <Bell className="w-5 h-5 text-[#6B7280] group-hover:text-[#4A7CFF] transition-colors" />
                        {notifications > 0 && (
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute -top-1 -right-1 w-5 h-5 bg-[#EF4444] rounded-full flex items-center justify-center"
                            >
                                <span className="text-white text-xs font-semibold">{notifications}</span>
                            </motion.div>
                        )}
                    </motion.button>

                    {/* Profile Menu */}
                    <div className="relative" ref={profileMenuRef}>
                        <motion.button
                            whileHover={{ backgroundColor: "#F8F9FD" }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setShowProfileMenu(!showProfileMenu)}
                            className="flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200"
                        >
                            <div className="w-9 h-9 bg-gradient-to-br from-[#4A7CFF] to-[#3D6FE8] rounded-xl flex items-center justify-center shadow-md">
                                <User className="w-5 h-5 text-white" />
                            </div>
                            <div className="text-left hidden sm:block">
                                <p className="text-sm font-semibold text-[#1A1D29]">
                                    {session?.user?.name || 'User'}
                                </p>
                                <p className="text-xs text-[#6B7280]">
                                    {session?.user?.email}
                                </p>
                            </div>
                            <motion.div
                                animate={{ rotate: showProfileMenu ? 180 : 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <ChevronDown className="w-4 h-4 text-[#6B7280]" />
                            </motion.div>
                        </motion.button>

                        {/* Profile Dropdown */}
                        <AnimatePresence>
                            {showProfileMenu && (
                                <motion.div
                                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                                    transition={{ duration: 0.2, ease: "easeOut" }}
                                    className="absolute right-0 mt-3 w-64 bg-white rounded-2xl border border-[#E5E7EB] shadow-xl z-50 overflow-hidden"
                                >
                                    {/* Profile Header */}
                                    <div className="px-6 py-4 bg-gradient-to-r from-[#F8F9FD] to-[#EEF2FF] border-b border-[#E5E7EB]">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-12 h-12 bg-gradient-to-br from-[#4A7CFF] to-[#3D6FE8] rounded-xl flex items-center justify-center">
                                                <User className="w-6 h-6 text-white" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-[#1A1D29] text-sm">
                                                    {session?.user?.name || 'User'}
                                                </p>
                                                <p className="text-xs text-[#6B7280]">
                                                    {session?.user?.email}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Menu Items */}
                                    <div className="py-2">
                                        <motion.div whileHover={{ x: 4 }}>
                                            <Link
                                                href="/settings"
                                                className="flex items-center px-6 py-3 text-sm text-[#6B7280] hover:bg-[#F8F9FD] hover:text-[#1A1D29] transition-colors group"
                                                onClick={() => setShowProfileMenu(false)}
                                            >
                                                <div className="w-8 h-8 bg-[#F3F4F6] group-hover:bg-white rounded-lg flex items-center justify-center mr-3 transition-colors">
                                                    <Settings className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <div className="font-medium">Settings</div>
                                                    <div className="text-xs text-[#9CA3AF]">Account preferences</div>
                                                </div>
                                            </Link>
                                        </motion.div>
                                        <motion.div whileHover={{ x: 4 }}>
                                            <button
                                                onClick={() => {
                                                    setShowProfileMenu(false);
                                                    signOut({ callbackUrl: '/signin' });
                                                }}
                                                className="flex items-center w-full px-6 py-3 text-sm text-[#EF4444] hover:bg-[#FEF2F2] transition-colors group"
                                            >
                                                <div className="w-8 h-8 bg-[#FEE2E2] group-hover:bg-[#FECACA] rounded-lg flex items-center justify-center mr-3 transition-colors">
                                                    <LogOut className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <div className="font-medium">Sign Out</div>
                                                    <div className="text-xs text-[#9CA3AF]">End current session</div>
                                                </div>
                                            </button>
                                        </motion.div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </motion.header>
    );
}
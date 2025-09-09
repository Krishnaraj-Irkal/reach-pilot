'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import {
    Home,
    Users,
    Send,
    Briefcase,
    BarChart3,
    Repeat,
    FileText,
    PieChart,
    Puzzle,
    Settings,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { useState, useEffect } from 'react';

interface NavigationItem {
    name: string;
    href: string;
    icon: LucideIcon;
    subItems?: SubNavigationItem[];
}

interface SubNavigationItem {
    name: string;
    href: string;
    status: 'active' | 'warning' | 'danger';
}

const navigation: NavigationItem[] = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Connections', href: '/connections', icon: Users },
    { name: 'Campaigns', href: '/campaigns', icon: Send },
    {
        name: 'ATS',
        href: '/ats',
        icon: Briefcase,
        subItems: [
            { name: 'Jobs', href: '/ats/jobs', status: 'active' },
            { name: 'Candidates', href: '/ats/candidates', status: 'warning' },
        ]
    },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Sequences', href: '/sequences', icon: Repeat },
    { name: 'Templates', href: '/templates', icon: FileText },
    { name: 'Reports', href: '/reports', icon: PieChart },
    { name: 'Integrations', href: '/integrations', icon: Puzzle },
    { name: 'Settings', href: '/settings', icon: Settings },
];

const statusColors = {
    active: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444'
};

export default function Sidebar() {
    const pathname = usePathname();
    const [expandedItems, setExpandedItems] = useState<string[]>([]);
    const [isCollapsed, setIsCollapsed] = useState(false);

    const toggleExpanded = (itemName: string) => {
        setExpandedItems(prev =>
            prev.includes(itemName)
                ? prev.filter(name => name !== itemName)
                : [...prev, itemName]
        );
    };

    const isActive = (href: string) => {
        return pathname === href || pathname.startsWith(href + '/');
    };

    useEffect(() => {
        // Auto-expand parent of active item
        const activeItem = navigation.find(item =>
            item.subItems?.some(sub => isActive(sub.href))
        );
        if (activeItem && !expandedItems.includes(activeItem.name)) {
            setExpandedItems(prev => [...prev, activeItem.name]);
        }
    }, [pathname, expandedItems]);

    return (
        <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{
                opacity: 1,
                x: 0,
                width: isCollapsed ? '72px' : '260px'
            }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="relative bg-white border-r border-[#E5E7EB] h-full flex-shrink-0 overflow-visible z-40"
        >
            {/* Collapse/Expand Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute top-6 -right-4 z-50 w-8 h-8 bg-white border border-[#E5E7EB] rounded-full flex items-center justify-center shadow-md hover:shadow-lg hover:border-[#4A7CFF] transition-all duration-200 group"
            >
                <motion.div
                    animate={{ rotate: isCollapsed ? 0 : 180 }}
                    transition={{ duration: 0.3 }}
                >
                    <ChevronLeft className="w-4 h-4 text-[#6B7280] group-hover:text-[#4A7CFF] transition-colors" />
                </motion.div>
            </motion.button>

            <nav className="relative px-4 py-8 h-full flex flex-col overflow-y-auto">
                {/* Logo Section */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="mb-8"
                >
                    {!isCollapsed ? (
                        <div className="px-2">
                            <h1 className="text-xl font-bold text-[#1A1D29]">ReachPilot</h1>
                            <p className="text-xs text-[#9CA3AF] mt-0.5">Sales Automation</p>
                        </div>
                    ) : (
                        <div className="w-8 h-8 bg-[#4A7CFF] rounded-lg flex items-center justify-center mx-auto">
                            <span className="text-white font-bold text-sm">R</span>
                        </div>
                    )}
                </motion.div>

                {/* Navigation Items */}
                <div className="space-y-2 flex-1">
                    {navigation.map((item, index) => {
                        const Icon = item.icon;
                        const isItemActive = isActive(item.href);
                        const isExpanded = expandedItems.includes(item.name);
                        const hasSubItems = item.subItems && item.subItems.length > 0;

                        return (
                            <motion.div
                                key={item.name}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                    duration: 0.2,
                                    delay: index * 0.05,
                                    ease: "easeOut"
                                }}
                            >
                                {/* Main Menu Item */}
                                <motion.div
                                    whileHover={{ x: isCollapsed ? 0 : 4 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    {hasSubItems ? (
                                        <button
                                            onClick={() => !isCollapsed && toggleExpanded(item.name)}
                                            className={`group relative flex items-center justify-between w-full px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${isItemActive
                                                ? 'bg-[#4A7CFF] text-white shadow-lg shadow-[#4A7CFF]/25'
                                                : 'text-[#6B7280] hover:bg-[#F8F9FD] hover:text-[#1A1D29]'
                                                }`}
                                        >
                                            <div className="flex items-center">
                                                <Icon className={`w-5 h-5 transition-all duration-200 ${isItemActive ? 'text-white' : 'text-[#6B7280] group-hover:text-[#4A7CFF]'
                                                    }`} />
                                                {!isCollapsed && (
                                                    <span className="ml-3 font-medium">{item.name}</span>
                                                )}
                                            </div>
                                            {!isCollapsed && (
                                                <motion.div
                                                    animate={{ rotate: isExpanded ? 90 : 0 }}
                                                    transition={{ duration: 0.2 }}
                                                >
                                                    <ChevronRight className={`w-4 h-4 ${isItemActive ? 'text-white' : 'text-[#9CA3AF]'
                                                        }`} />
                                                </motion.div>
                                            )}
                                        </button>
                                    ) : (
                                        <Link
                                            href={item.href}
                                            className={`group relative flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${isItemActive
                                                ? 'bg-[#4A7CFF] text-white shadow-lg shadow-[#4A7CFF]/25'
                                                : 'text-[#6B7280] hover:bg-[#F8F9FD] hover:text-[#1A1D29]'
                                                }`}
                                        >
                                            <Icon className={`w-5 h-5 transition-all duration-200 ${isItemActive ? 'text-white' : 'text-[#6B7280] group-hover:text-[#4A7CFF]'
                                                }`} />
                                            {!isCollapsed && (
                                                <span className="ml-3 font-medium">{item.name}</span>
                                            )}
                                            {isItemActive && (
                                                <motion.div
                                                    className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-white rounded-l-full"
                                                    layoutId="activeIndicator"
                                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                                />
                                            )}
                                        </Link>
                                    )}
                                </motion.div>

                                {/* Sub Menu Items */}
                                {hasSubItems && !isCollapsed && (
                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                                className="overflow-hidden"
                                            >
                                                <div className="mt-2 ml-6 space-y-1 border-l border-[#E5E7EB] pl-4">
                                                    {item.subItems!.map((subItem) => {
                                                        const isSubItemActive = isActive(subItem.href);
                                                        return (
                                                            <motion.div
                                                                key={subItem.name}
                                                                whileHover={{ x: 4 }}
                                                                className="flex items-center"
                                                            >
                                                                <div
                                                                    className="w-2 h-2 rounded-full mr-3 flex-shrink-0"
                                                                    style={{
                                                                        backgroundColor: statusColors[subItem.status as keyof typeof statusColors] || '#6B7280'
                                                                    }}
                                                                />
                                                                <Link
                                                                    href={subItem.href}
                                                                    className={`flex-1 py-2 px-2 text-sm rounded-lg transition-all duration-200 ${isSubItemActive
                                                                        ? 'text-[#4A7CFF] font-medium bg-[#E8F0FF]'
                                                                        : 'text-[#6B7280] hover:text-[#1A1D29] hover:bg-[#F8F9FD]'
                                                                        }`}
                                                                >
                                                                    {subItem.name}
                                                                </Link>
                                                            </motion.div>
                                                        );
                                                    })}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                )}
                            </motion.div>
                        );
                    })}

                </div>
            </nav>
        </motion.aside>
    );
}

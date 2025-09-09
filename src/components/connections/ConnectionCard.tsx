import { motion } from 'framer-motion';
import {
    Mail,
    User,
    ExternalLink,
    Copy,
    Edit,
    Trash2,
    MoreHorizontal,
    Calendar,
    MapPin,
    Building
} from 'lucide-react';
import { useState } from 'react';
import type { Connection } from '@/types/connections';

interface ConnectionCardProps {
    connection: Connection;
    index: number;
    onCopy: (email: string) => void;
    onView: (id: string) => void;
    onEdit: (connection: Connection) => void;
    onDelete: (connection: Connection) => void;
    selectable?: boolean;
    selected?: boolean;
    onSelect?: (connection: Connection, selected: boolean) => void;
}

export default function ConnectionCard({
    connection,
    index,
    onCopy,
    onView,
    onEdit,
    onDelete,
    selectable = false,
    selected = false,
    onSelect
}: ConnectionCardProps) {
    const [showActions, setShowActions] = useState(false);

    // Generate initials from name or email
    const getInitials = (name?: string, email?: string) => {
        if (name) {
            return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
        }
        if (email) {
            return email.slice(0, 2).toUpperCase();
        }
        return '??';
    };

    // Format relative time
    const getRelativeTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = now.getTime() - date.getTime();
        const diffHours = Math.floor(diffTime / (1000 * 60 * 60));

        if (diffHours < 1) {
            return 'Just now';
        } else if (diffHours < 24) {
            return `${diffHours}h ago`;
        } else {
            const diffDays = Math.floor(diffHours / 24);
            if (diffDays === 1) {
                return 'Yesterday';
            } else if (diffDays < 7) {
                return `${diffDays}d ago`;
            } else if (diffDays < 30) {
                const weeks = Math.floor(diffDays / 7);
                return `${weeks}w ago`;
            } else {
                const months = Math.floor(diffDays / 30);
                if (months === 1) {
                    return '1 month ago';
                } else if (months < 12) {
                    return `${months} months ago`;
                } else {
                    const years = Math.floor(months / 12);
                    return `${years} year${years > 1 ? 's' : ''} ago`;
                }
            }
        }
    };

    // Extract domain from email for company inference
    const getDomainFromEmail = (email: string) => {
        const domain = email.split('@')[1];
        return domain?.split('.')[0] || '';
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                duration: 0.25,
                delay: index * 0.05,
                ease: [0.22, 0.61, 0.36, 1]
            }}
            whileHover={{
                y: -2,
                transition: { duration: 0.15 }
            }}
            onMouseEnter={() => setShowActions(true)}
            onMouseLeave={() => setShowActions(false)}
            className={`group relative bg-white border border-slate-200 rounded-xl p-6 
                       hover:shadow-md hover:border-slate-300 transition-all duration-200
                       ${selected ? 'ring-2 ring-blue-500 border-blue-300' : ''}`}
        >

            <div className={`grid grid-cols-1 lg:grid-cols-12 gap-4 items-center`}>
                {/* Avatar & Primary Info */}
                <div className="lg:col-span-4 flex items-center gap-4">
                    <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 
                                      rounded-xl flex items-center justify-center text-white font-semibold text-sm">
                            {getInitials(connection.name, connection.email)}
                        </div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-base font-semibold text-slate-900 truncate">
                            {connection.name || 'Unnamed Contact'}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                            <Mail className="w-3 h-3 text-slate-400 flex-shrink-0" />
                            <p className="text-sm text-slate-600 truncate">
                                {connection.email}
                            </p>
                        </div>
                        {getDomainFromEmail(connection.email) && (
                            <div className="flex items-center gap-2 mt-1">
                                <Building className="w-3 h-3 text-slate-400 flex-shrink-0" />
                                <p className="text-xs text-slate-500 capitalize truncate">
                                    {getDomainFromEmail(connection.email)}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Contact Info */}
                <div className="lg:col-span-3 space-y-2">
                    {connection.linkedin_url && (
                        <div className="flex items-center gap-2">
                            <ExternalLink className="w-3 h-3 text-slate-400 flex-shrink-0" />
                            <a
                                href={connection.linkedin_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 hover:text-blue-700 transition-colors truncate"
                                onClick={(e) => e.stopPropagation()}
                            >
                                LinkedIn Profile
                            </a>
                        </div>
                    )}
                    <div className="flex items-center gap-2">
                        <Calendar className="w-3 h-3 text-slate-400 flex-shrink-0" />
                        <span className="text-sm text-slate-500">
                            Added {getRelativeTime(connection.created_at)}
                        </span>
                    </div>
                </div>

                {/* Status & Tags */}
                <div className="lg:col-span-3 flex flex-wrap gap-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium 
                                   bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Active
                    </span>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium 
                                   bg-slate-50 text-slate-600 border border-slate-200">
                        Manual
                    </span>
                </div>

                {/* Quick Actions */}
                <div className="lg:col-span-2 flex items-center justify-end gap-2">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                            e.stopPropagation();
                            onCopy(connection.email);
                        }}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 
                                 rounded-lg transition-colors"
                        title="Copy email"
                    >
                        <Copy className="w-4 h-4" />
                    </motion.button>

                    <motion.a
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        href={`mailto:${connection.email}`}
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 
                                 rounded-lg transition-colors"
                        title="Send email"
                    >
                        <Mail className="w-4 h-4" />
                    </motion.a>

                    {/* More actions menu */}
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowActions(!showActions);
                        }}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 
                                 rounded-lg transition-colors"
                    >
                        <MoreHorizontal className="w-4 h-4" />
                    </motion.button>

                    {/* Actions dropdown */}
                    {showActions && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                            transition={{ duration: 0.15 }}
                            className="absolute top-full right-0 mt-2 w-48 bg-white border border-slate-200 
                                     rounded-lg shadow-lg z-10"
                        >
                            <div className="py-1">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onView(connection.id);
                                    }}
                                    className="flex items-center gap-3 w-full px-4 py-2 text-sm text-slate-700 
                                             hover:bg-slate-50 transition-colors"
                                >
                                    <User className="w-4 h-4" />
                                    View Details
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onEdit(connection);
                                    }}
                                    className="flex items-center gap-3 w-full px-4 py-2 text-sm text-slate-700 
                                             hover:bg-slate-50 transition-colors"
                                >
                                    <Edit className="w-4 h-4" />
                                    Edit Contact
                                </button>
                                <hr className="my-1 border-slate-200" />
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDelete(connection);
                                    }}
                                    className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 
                                             hover:bg-red-50 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Delete Contact
                                </button>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Click area for viewing details */}
            <button
                onClick={() => onView(connection.id)}
                className="absolute inset-0 w-full h-full rounded-xl focus:outline-none 
                         focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                aria-label={`View details for ${connection.name || connection.email}`}
            />
        </motion.div>
    );
}
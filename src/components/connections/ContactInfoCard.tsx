import { motion } from 'framer-motion';
import {
    Mail,
    User,
    Calendar,
    ExternalLink,
    Copy,
    ArrowLeft,
    Edit,
    Trash2,
    MessageSquare,
    Clock,
    FileText
} from 'lucide-react';
import type { Connection } from '@/types/connections';

interface ContactInfoCardProps {
    connection: Connection;
    onCopy: (email: string) => void;
    onEdit: () => void;
    onDelete: () => void;
    isEditing: boolean;
}

export default function ContactInfoCard({
    connection,
    onCopy,
    onEdit,
    onDelete,
    isEditing
}: ContactInfoCardProps) {
    // Format date with relative time
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = now.getTime() - date.getTime();
        const diffHours = Math.floor(diffTime / (1000 * 60 * 60));

        const fullDate = date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });

        let relative = '';
        if (diffHours < 24) {
            relative = 'Today';
        } else {
            const diffDays = Math.floor(diffHours / 24);
            if (diffDays === 1) {
                relative = 'Yesterday';
            } else if (diffDays < 7) {
                relative = `${diffDays} days ago`;
            } else if (diffDays < 30) {
                const weeks = Math.floor(diffDays / 7);
                relative = `${weeks} week${weeks > 1 ? 's' : ''} ago`;
            } else {
                const months = Math.floor(diffDays / 30);
                relative = `${months} month${months > 1 ? 's' : ''} ago`;
            }
        }

        return { fullDate, relative };
    };

    const dateInfo = formatDate(connection.created_at);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 0.61, 0.36, 1] }}
            className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden"
        >
            {/* Card Header */}
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-slate-900">
                        Contact Information
                    </h3>
                    {!isEditing && (
                        <div className="flex items-center gap-2">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={onEdit}
                                className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 
                                         rounded-lg transition-colors"
                                title="Edit contact"
                            >
                                <Edit className="w-4 h-4" />
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={onDelete}
                                className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 
                                         rounded-lg transition-colors"
                                title="Delete contact"
                            >
                                <Trash2 className="w-4 h-4" />
                            </motion.button>
                        </div>
                    )}
                </div>
            </div>

            {/* Card Content */}
            <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Email */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-slate-500" />
                            <label className="text-sm font-medium text-slate-700">
                                Email Address
                            </label>
                        </div>
                        <div className="flex items-center gap-2">
                            <a
                                href={`mailto:${connection.email}`}
                                className="text-blue-600 hover:text-blue-700 transition-colors font-medium"
                            >
                                {connection.email}
                            </a>
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => onCopy(connection.email)}
                                className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 
                                         rounded transition-colors"
                                title="Copy email"
                            >
                                <Copy className="w-3 h-3" />
                            </motion.button>
                        </div>
                    </div>

                    {/* Name */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-slate-500" />
                            <label className="text-sm font-medium text-slate-700">
                                Full Name
                            </label>
                        </div>
                        <p className="text-slate-900 font-medium">
                            {connection.name || (
                                <span className="text-slate-400 italic">Not provided</span>
                            )}
                        </p>
                    </div>

                    {/* LinkedIn Profile */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <ExternalLink className="w-4 h-4 text-slate-500" />
                            <label className="text-sm font-medium text-slate-700">
                                LinkedIn Profile
                            </label>
                        </div>
                        {connection.linkedin_url ? (
                            <a
                                href={connection.linkedin_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 
                                         transition-colors font-medium"
                            >
                                View Profile
                                <ExternalLink className="w-3 h-3" />
                            </a>
                        ) : (
                            <span className="text-slate-400 italic">Not provided</span>
                        )}
                    </div>

                    {/* Date Added */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-slate-500" />
                            <label className="text-sm font-medium text-slate-700">
                                Date Added
                            </label>
                        </div>
                        <div className="space-y-1">
                            <p className="text-slate-900 font-medium">
                                {dateInfo.relative}
                            </p>
                            <p className="text-xs text-slate-500">
                                {dateInfo.fullDate}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
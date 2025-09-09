import { motion } from 'framer-motion';
import {
    Mail,
    ExternalLink,
    MessageSquare,
    Clock,
    FileText,
    Calendar,
    Phone,
    Video
} from 'lucide-react';
import type { Connection } from '@/types/connections';

interface QuickActionsProps {
    connection: Connection;
    onCopy: (email: string) => void;
}

export default function QuickActions({ connection, onCopy }: QuickActionsProps) {
    const actions = [
        {
            id: 'email',
            label: 'Send Email',
            icon: Mail,
            color: 'blue',
            href: `mailto:${connection.email}`,
            primary: true
        },
        {
            id: 'linkedin',
            label: 'View LinkedIn',
            icon: ExternalLink,
            color: 'indigo',
            href: connection.linkedin_url,
            disabled: !connection.linkedin_url,
            external: true
        },
        {
            id: 'message',
            label: 'Add Note',
            icon: FileText,
            color: 'green',
            onClick: () => {
                // Placeholder for note functionality
                console.log('Add note for', connection.id);
            }
        },
        {
            id: 'schedule',
            label: 'Schedule Follow-up',
            icon: Clock,
            color: 'amber',
            onClick: () => {
                // Placeholder for scheduling functionality
                console.log('Schedule follow-up for', connection.id);
            }
        },
        {
            id: 'calendar',
            label: 'Schedule Meeting',
            icon: Calendar,
            color: 'purple',
            onClick: () => {
                // Placeholder for calendar integration
                console.log('Schedule meeting with', connection.id);
            }
        }
    ];

    const getColorClasses = (color: string, primary = false) => {
        const colors = {
            blue: {
                bg: primary ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-50 hover:bg-blue-100',
                text: primary ? 'text-white' : 'text-blue-700',
                border: primary ? 'border-blue-600' : 'border-blue-200'
            },
            indigo: {
                bg: 'bg-indigo-50 hover:bg-indigo-100',
                text: 'text-indigo-700',
                border: 'border-indigo-200'
            },
            green: {
                bg: 'bg-green-50 hover:bg-green-100',
                text: 'text-green-700',
                border: 'border-green-200'
            },
            amber: {
                bg: 'bg-amber-50 hover:bg-amber-100',
                text: 'text-amber-700',
                border: 'border-amber-200'
            },
            purple: {
                bg: 'bg-purple-50 hover:bg-purple-100',
                text: 'text-purple-700',
                border: 'border-purple-200'
            }
        };
        return colors[color as keyof typeof colors] || colors.blue;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 0.61, 0.36, 1], delay: 0.1 }}
            className="bg-slate-50 rounded-xl p-6"
        >
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
                Quick Actions
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
                {actions.map((action, index) => {
                    const IconComponent = action.icon;
                    const colorClasses = getColorClasses(action.color, action.primary);

                    if (action.disabled) {
                        return (
                            <div
                                key={action.id}
                                className="flex items-center gap-3 px-4 py-3 rounded-lg border 
                                         bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed"
                            >
                                <IconComponent className="w-4 h-4 flex-shrink-0" />
                                <span className="text-sm font-medium truncate">
                                    {action.label}
                                </span>
                            </div>
                        );
                    }

                    const buttonContent = (
                        <>
                            <IconComponent className="w-4 h-4 flex-shrink-0" />
                            <span className="text-sm font-medium truncate">
                                {action.label}
                            </span>
                            {action.external && (
                                <ExternalLink className="w-3 h-3 ml-auto flex-shrink-0 opacity-60" />
                            )}
                        </>
                    );

                    const buttonClasses = `flex items-center gap-3 px-4 py-3 rounded-lg border 
                                        transition-all duration-200 ${colorClasses.bg} 
                                        ${colorClasses.text} ${colorClasses.border}
                                        hover:shadow-md focus:ring-2 focus:ring-offset-2 
                                        ${action.primary ? 'focus:ring-blue-500' : 'focus:ring-slate-300'}`;

                    if (action.href) {
                        return (
                            <motion.a
                                key={action.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                    duration: 0.2,
                                    delay: index * 0.05,
                                    ease: [0.22, 0.61, 0.36, 1]
                                }}
                                whileHover={{
                                    scale: 1.02,
                                    transition: { duration: 0.15 }
                                }}
                                whileTap={{ scale: 0.98 }}
                                href={action.href}
                                target={action.external ? '_blank' : undefined}
                                rel={action.external ? 'noopener noreferrer' : undefined}
                                className={buttonClasses}
                            >
                                {buttonContent}
                            </motion.a>
                        );
                    }

                    return (
                        <motion.button
                            key={action.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                                duration: 0.2,
                                delay: index * 0.05,
                                ease: [0.22, 0.61, 0.36, 1]
                            }}
                            whileHover={{
                                scale: 1.02,
                                transition: { duration: 0.15 }
                            }}
                            whileTap={{ scale: 0.98 }}
                            onClick={action.onClick}
                            className={buttonClasses}
                        >
                            {buttonContent}
                        </motion.button>
                    );
                })}
            </div>

            {/* Additional Info */}
            <div className="mt-4 pt-4 border-t border-slate-200">
                <p className="text-xs text-slate-500">
                    Pro tip: Use keyboard shortcuts to quickly perform actions.
                    Press <kbd className="px-1 py-0.5 text-xs bg-slate-200 rounded">E</kbd> to send email,
                    <kbd className="px-1 py-0.5 text-xs bg-slate-200 rounded">L</kbd> to view LinkedIn.
                </p>
            </div>
        </motion.div>
    );
}
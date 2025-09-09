import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    rightSlot?: ReactNode;
    breadcrumb?: { label: string; href?: string }[];
}

export default function PageHeader({ title, subtitle, rightSlot, breadcrumb }: PageHeaderProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 0.61, 0.36, 1] }}
            className="mb-8"
        >
            {/* Breadcrumb */}
            {breadcrumb && (
                <nav className="mb-4" aria-label="Breadcrumb">
                    <ol className="flex items-center space-x-2 text-sm">
                        {breadcrumb.map((crumb, index) => (
                            <li key={index} className="flex items-center">
                                {index > 0 && (
                                    <svg
                                        className="w-4 h-4 mx-2 text-slate-400"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                )}
                                {crumb.href ? (
                                    <a
                                        href={crumb.href}
                                        className="text-slate-500 hover:text-slate-700 transition-colors"
                                    >
                                        {crumb.label}
                                    </a>
                                ) : (
                                    <span className="text-slate-900 font-medium">{crumb.label}</span>
                                )}
                            </li>
                        ))}
                    </ol>
                </nav>
            )}

            {/* Header Content */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1 min-w-0">
                    <motion.h1
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                        className="text-3xl font-bold text-slate-900 tracking-tight"
                    >
                        {title}
                    </motion.h1>
                    {subtitle && (
                        <motion.p
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: 0.15 }}
                            className="mt-2 text-base text-slate-600 max-w-2xl"
                        >
                            {subtitle}
                        </motion.p>
                    )}
                </div>

                {rightSlot && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                        className="flex flex-wrap items-center gap-3 flex-shrink-0"
                    >
                        {rightSlot}
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
}
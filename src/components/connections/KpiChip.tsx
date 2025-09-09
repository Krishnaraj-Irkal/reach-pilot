import { motion } from 'framer-motion';

interface KpiChipProps {
    label: string;
    value: number | string;
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: string;
    color?: 'blue' | 'green' | 'amber' | 'red' | 'slate';
    animate?: boolean;
}

export default function KpiChip({
    label,
    value,
    trend,
    trendValue,
    color = 'blue',
    animate = true
}: KpiChipProps) {
    const colorClasses = {
        blue: {
            bg: 'bg-blue-50',
            text: 'text-blue-700',
            border: 'border-blue-200',
            trend: {
                up: 'text-emerald-600',
                down: 'text-red-600',
                neutral: 'text-slate-500'
            }
        },
        green: {
            bg: 'bg-emerald-50',
            text: 'text-emerald-700',
            border: 'border-emerald-200',
            trend: {
                up: 'text-emerald-600',
                down: 'text-red-600',
                neutral: 'text-slate-500'
            }
        },
        amber: {
            bg: 'bg-amber-50',
            text: 'text-amber-700',
            border: 'border-amber-200',
            trend: {
                up: 'text-emerald-600',
                down: 'text-red-600',
                neutral: 'text-slate-500'
            }
        },
        red: {
            bg: 'bg-red-50',
            text: 'text-red-700',
            border: 'border-red-200',
            trend: {
                up: 'text-emerald-600',
                down: 'text-red-600',
                neutral: 'text-slate-500'
            }
        },
        slate: {
            bg: 'bg-slate-50',
            text: 'text-slate-700',
            border: 'border-slate-200',
            trend: {
                up: 'text-emerald-600',
                down: 'text-red-600',
                neutral: 'text-slate-500'
            }
        }
    };

    const classes = colorClasses[color];

    const getTrendIcon = () => {
        switch (trend) {
            case 'up':
                return (
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    </svg>
                );
            case 'down':
                return (
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                );
            case 'neutral':
                return (
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                );
            default:
                return null;
        }
    };

    const chipContent = (
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border 
                       ${classes.bg} ${classes.border} ${classes.text}`}>
            <span className="text-xs font-medium text-slate-600">{label}</span>
            <span className="text-sm font-bold">{value}</span>

            {trend && trendValue && (
                <div className={`flex items-center gap-1 ${classes.trend[trend]}`}>
                    {getTrendIcon()}
                    <span className="text-xs font-medium">{trendValue}</span>
                </div>
            )}
        </div>
    );

    if (!animate) {
        return chipContent;
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
                duration: 0.2,
                ease: [0.22, 0.61, 0.36, 1]
            }}
            whileHover={{
                scale: 1.05,
                transition: { duration: 0.15 }
            }}
        >
            {chipContent}
        </motion.div>
    );
}
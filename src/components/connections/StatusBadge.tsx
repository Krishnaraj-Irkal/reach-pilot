import { motion } from 'framer-motion';

type StatusType = 'active' | 'pending' | 'contacted' | 'inactive';

interface StatusBadgeProps {
    status: StatusType;
    animate?: boolean;
}

export default function StatusBadge({ status, animate = true }: StatusBadgeProps) {
    const getStatusConfig = (status: StatusType) => {
        const configs = {
            active: {
                label: 'Active',
                color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                dot: 'bg-emerald-500'
            },
            pending: {
                label: 'Pending',
                color: 'bg-amber-50 text-amber-700 border-amber-200',
                dot: 'bg-amber-500'
            },
            contacted: {
                label: 'Contacted',
                color: 'bg-blue-50 text-blue-700 border-blue-200',
                dot: 'bg-blue-500'
            },
            inactive: {
                label: 'Inactive',
                color: 'bg-slate-50 text-slate-700 border-slate-200',
                dot: 'bg-slate-400'
            }
        };
        return configs[status];
    };

    const config = getStatusConfig(status);

    const badgeContent = (
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium ${config.color}`}>
            <div className={`w-2 h-2 rounded-full ${config.dot}`} />
            {config.label}
        </div>
    );

    if (!animate) {
        return badgeContent;
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
            {badgeContent}
        </motion.div>
    );
}
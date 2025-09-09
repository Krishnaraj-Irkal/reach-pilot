import { motion } from 'framer-motion';
import {
    Users,
    Activity,
    TrendingUp,
    Clock,
    Mail,
    CheckCircle,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react';

interface StatsData {
    totalConnections: number;
    activeThisMonth: number;
    responseRate: number;
    avgResponseTime: string;
}

interface StatsOverviewProps {
    stats: StatsData;
    loading?: boolean;
}

export default function StatsOverview({ stats, loading = false }: StatsOverviewProps) {
    const statsCards = [
        {
            id: 'total',
            label: 'Total Connections',
            value: stats.totalConnections,
            icon: Users,
            color: 'blue',
            trend: { direction: 'up', value: '12%' },
            description: 'All contacts in your network'
        },
        {
            id: 'active',
            label: 'Active This Month',
            value: stats.activeThisMonth,
            icon: Activity,
            color: 'green',
            trend: { direction: 'up', value: '8%' },
            description: 'Connections contacted recently'
        },
        {
            id: 'response',
            label: 'Response Rate',
            value: `${stats.responseRate}%`,
            icon: CheckCircle,
            color: 'emerald',
            trend: { direction: 'down', value: '2%' },
            description: 'Average email response rate'
        },
        {
            id: 'time',
            label: 'Avg Response Time',
            value: stats.avgResponseTime,
            icon: Clock,
            color: 'amber',
            trend: { direction: 'up', value: '15min' },
            description: 'Time to first response'
        }
    ];

    const getColorClasses = (color: string) => {
        const colors = {
            blue: {
                bg: 'bg-blue-50',
                icon: 'text-blue-600',
                border: 'border-blue-200'
            },
            green: {
                bg: 'bg-green-50',
                icon: 'text-green-600',
                border: 'border-green-200'
            },
            emerald: {
                bg: 'bg-emerald-50',
                icon: 'text-emerald-600',
                border: 'border-emerald-200'
            },
            amber: {
                bg: 'bg-amber-50',
                icon: 'text-amber-600',
                border: 'border-amber-200'
            }
        };
        return colors[color as keyof typeof colors] || colors.blue;
    };

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
                {[...Array(4)].map((_, index) => (
                    <div key={index} className="bg-white border border-slate-200 rounded-xl p-6 animate-pulse">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-10 h-10 bg-slate-200 rounded-lg" />
                            <div className="w-16 h-4 bg-slate-200 rounded" />
                        </div>
                        <div className="w-20 h-8 bg-slate-200 rounded mb-2" />
                        <div className="w-32 h-3 bg-slate-200 rounded" />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, staggerChildren: 0.05 }}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8"
        >
            {statsCards.map((stat, index) => {
                const colorClasses = getColorClasses(stat.color);
                const IconComponent = stat.icon;

                return (
                    <motion.div
                        key={stat.id}
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
                        className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-md 
                                 hover:border-slate-300 transition-all duration-200"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className={`w-10 h-10 ${colorClasses.bg} ${colorClasses.border} 
                                          border rounded-lg flex items-center justify-center`}>
                                <IconComponent className={`w-5 h-5 ${colorClasses.icon}`} />
                            </div>

                            {stat.trend && (
                                <div className={`flex items-center gap-1 text-xs font-medium
                                              ${stat.trend.direction === 'up'
                                        ? 'text-emerald-600'
                                        : 'text-red-600'
                                    }`}>
                                    {stat.trend.direction === 'up' ? (
                                        <ArrowUpRight className="w-3 h-3" />
                                    ) : (
                                        <ArrowDownRight className="w-3 h-3" />
                                    )}
                                    {stat.trend.value}
                                </div>
                            )}
                        </div>

                        <div className="space-y-1">
                            <p className="text-2xl font-bold text-slate-900">
                                {stat.value}
                            </p>
                            <p className="text-sm font-medium text-slate-600">
                                {stat.label}
                            </p>
                            <p className="text-xs text-slate-500">
                                {stat.description}
                            </p>
                        </div>
                    </motion.div>
                );
            })}
        </motion.div>
    );
}
import { useState, useCallback } from 'react';
import type { Connection } from '@/types/connections';

interface StatsData {
    totalConnections: number;
    activeThisMonth: number;
    responseRate: number;
    avgResponseTime: string;
}

export function useConnectionStats() {
    const [stats, setStats] = useState<StatsData>({
        totalConnections: 0,
        activeThisMonth: 0,
        responseRate: 0,
        avgResponseTime: '0h'
    });
    const [loading, setLoading] = useState(false);

    const calculateStats = useCallback((connections: Connection[]) => {
        const now = new Date();
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const activeThisMonth = connections.filter(conn => {
            const createdAt = new Date(conn.created_at);
            return createdAt >= thisMonth;
        }).length;

        // Mock calculations for demo - in real app would come from API
        const responseRate = Math.min(85 + Math.random() * 10, 95);
        const avgResponseTime = `${Math.floor(2 + Math.random() * 6)}h ${Math.floor(Math.random() * 60)}m`;

        setStats({
            totalConnections: connections.length,
            activeThisMonth,
            responseRate: Math.round(responseRate),
            avgResponseTime
        });
    }, []);

    const fetchStats = useCallback(async () => {
        setLoading(true);
        try {
            // In a real app, this would be an API call
            // For now, we'll simulate loading
            await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        stats,
        loading,
        calculateStats,
        fetchStats
    };
}
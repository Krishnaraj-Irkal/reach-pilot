'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    Plus,
    UserRound,
    AlertCircle,
    RefreshCw,
    ShieldAlert,
    Filter,
    SortAsc,
    SortDesc,
    MoreHorizontal,
    Download,
    Trash2,
    Users
} from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import {
    PageHeader,
    SearchInput,
    KpiChip,
    ConnectionCard,
    ConfirmDialog,
    useToast,
    StatsOverview,
    useConnectionStats
} from '@/components/connections';
import type { Connection, ConnectionsListResponse, ConnectionError } from '@/types/connections';

export default function ConnectionsPage() {
    const [connections, setConnections] = useState<Connection[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [hasMore, setHasMore] = useState(false);
    const [nextCursor, setNextCursor] = useState<string | null>(null);
    const [loadingMore, setLoadingMore] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState<{ connection: Connection; isOpen: boolean } | null>(null);
    const [selectedConnections, setSelectedConnections] = useState<Set<string>>(new Set());
    const [showBulkActions, setShowBulkActions] = useState(false);
    const [sortBy, setSortBy] = useState<'name' | 'email' | 'date'>('date');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [filterBy, setFilterBy] = useState<'all' | 'recent' | 'active'>('all');

    const router = useRouter();
    const { showToast, ToastContainer } = useToast();
    const { stats, loading: statsLoading, calculateStats } = useConnectionStats();

    // Debounced search
    const searchTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

    // Fetch connections
    const fetchConnections = useCallback(async (searchTerm = '', cursor: string | null = null, reset = true) => {
        try {
            if (reset) {
                setLoading(true);
                setError(null);
            } else {
                setLoadingMore(true);
            }

            const params = new URLSearchParams();
            if (searchTerm.trim()) {
                params.append('search', searchTerm.trim());
            }
            if (cursor) {
                params.append('cursor', cursor);
            }
            params.append('limit', '20');

            const response = await fetch(`/api/app/connections?${params.toString()}`);

            if (!response.ok) {
                const errorData: ConnectionError = await response.json();
                if (response.status === 401) {
                    router.push('/signin');
                    return;
                }
                throw new Error(errorData.message || 'Failed to fetch connections');
            }

            const data: ConnectionsListResponse = await response.json();

            if (reset) {
                setConnections(data.data);
            } else {
                setConnections(prev => [...prev, ...data.data]);
            }

            setHasMore(data.has_more || false);
            setNextCursor(data.next_cursor || null);

            // Update stats when connections change
            if (reset) {
                calculateStats(data.data);
            }

        } catch (err) {
            console.error('Error fetching connections:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch connections');
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [router, calculateStats]);

    // Initial load
    useEffect(() => {
        fetchConnections(search);
    }, [fetchConnections]);

    // Handle search with debounce
    const handleSearchChange = useCallback((value: string) => {
        setSearch(value);

        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        searchTimeoutRef.current = setTimeout(() => {
            fetchConnections(value, null, true);
        }, 250);
    }, [fetchConnections]);

    // Handle keyboard shortcuts
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            fetchConnections(search, null, true);
        }
    }, [fetchConnections, search]);

    // Load more connections
    const loadMore = useCallback(() => {
        if (nextCursor && !loadingMore) {
            fetchConnections(search, nextCursor, false);
        }
    }, [fetchConnections, search, nextCursor, loadingMore]);

    // Copy email to clipboard
    const handleCopyEmail = useCallback(async (email: string) => {
        try {
            await navigator.clipboard.writeText(email);
            showToast('Email copied');
        } catch (err) {
            console.error('Failed to copy email:', err);
            showToast('Failed to copy email', 'error');
        }
    }, [showToast]);

    // Navigate to connection detail
    const handleViewConnection = useCallback((id: string) => {
        router.push(`/connections/${id}`);
    }, [router]);

    // Handle quick edit
    const handleEditConnection = useCallback((connection: Connection) => {
        router.push(`/connections/${connection.id}`);
    }, [router]);

    // Handle delete connection
    const handleDeleteConnection = useCallback((connection: Connection) => {
        setDeleteDialog({ connection, isOpen: true });
    }, []);

    // Handle connection selection
    const handleConnectionSelect = useCallback((connection: Connection, selected: boolean) => {
        setSelectedConnections(prev => {
            const newSet = new Set(prev);
            if (selected) {
                newSet.add(connection.id);
            } else {
                newSet.delete(connection.id);
            }
            setShowBulkActions(newSet.size > 0);
            return newSet;
        });
    }, []);

    // Select all connections
    const handleSelectAll = useCallback((selected: boolean) => {
        if (selected) {
            const allIds = new Set(connections.map(conn => conn.id));
            setSelectedConnections(allIds);
            setShowBulkActions(true);
        } else {
            setSelectedConnections(new Set());
            setShowBulkActions(false);
        }
    }, [connections]);

    // Bulk delete
    const handleBulkDelete = useCallback(async () => {
        const selectedIds = Array.from(selectedConnections);

        try {
            const promises = selectedIds.map(id =>
                fetch(`/api/app/connections/${id}`, { method: 'DELETE' })
            );

            const results = await Promise.all(promises);
            const failedDeletes = results.filter(r => !r.ok);

            if (failedDeletes.length > 0) {
                showToast(`Failed to delete ${failedDeletes.length} connections`, 'error');
            } else {
                showToast(`Deleted ${selectedIds.length} connections`);
            }

            // Remove deleted connections from local state
            setConnections(prev => prev.filter(conn => !selectedIds.includes(conn.id)));
            setSelectedConnections(new Set());
            setShowBulkActions(false);

        } catch (err) {
            console.error('Error bulk deleting:', err);
            showToast('Failed to delete connections', 'error');
        }
    }, [selectedConnections, showToast]);

    // Export connections
    const handleExport = useCallback(async () => {
        try {
            const selectedIds = Array.from(selectedConnections);
            const connectionsToExport = selectedIds.length > 0
                ? connections.filter(conn => selectedIds.includes(conn.id))
                : connections;

            const csvContent = [
                'Name,Email,LinkedIn Profile,Date Added',
                ...connectionsToExport.map(conn =>
                    `"${conn.name || ''}","${conn.email}","${conn.linkedin_url || ''}","${conn.created_at}"`
                )
            ].join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `connections-${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            showToast(`Exported ${connectionsToExport.length} connections`);
        } catch (err) {
            console.error('Export error:', err);
            showToast('Failed to export connections', 'error');
        }
    }, [connections, selectedConnections, showToast]);

    // Sort and filter connections
    const sortedAndFilteredConnections = React.useMemo(() => {
        let filtered = [...connections];

        // Apply filters
        if (filterBy === 'recent') {
            const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            filtered = filtered.filter(conn => new Date(conn.created_at) > weekAgo);
        } else if (filterBy === 'active') {
            // This would typically come from the API, for now just show all
            filtered = filtered;
        }

        // Apply sorting
        filtered.sort((a, b) => {
            let aValue: string | Date;
            let bValue: string | Date;

            switch (sortBy) {
                case 'name':
                    aValue = (a.name || a.email).toLowerCase();
                    bValue = (b.name || b.email).toLowerCase();
                    break;
                case 'email':
                    aValue = a.email.toLowerCase();
                    bValue = b.email.toLowerCase();
                    break;
                case 'date':
                default:
                    aValue = new Date(a.created_at);
                    bValue = new Date(b.created_at);
                    break;
            }

            let comparison = 0;
            if (aValue > bValue) {
                comparison = 1;
            } else if (aValue < bValue) {
                comparison = -1;
            }

            return sortOrder === 'desc' ? -comparison : comparison;
        });

        return filtered;
    }, [connections, filterBy, sortBy, sortOrder]);

    // Confirm single delete
    const confirmDelete = useCallback(async () => {
        if (!deleteDialog?.connection) return;

        try {
            const response = await fetch(`/api/app/connections/${deleteDialog.connection.id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData: ConnectionError = await response.json();
                if (response.status === 401) {
                    router.push('/signin');
                    return;
                }
                throw new Error(errorData.message || 'Failed to delete connection');
            }

            // Remove from local state
            setConnections(prev => prev.filter(conn => conn.id !== deleteDialog.connection.id));
            showToast('Connection deleted');
            setDeleteDialog(null);
        } catch (err) {
            console.error('Error deleting connection:', err);
            showToast(err instanceof Error ? err.message : 'Failed to delete connection', 'error');
        }
    }, [deleteDialog, router, showToast]);

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: [0.22, 0.61, 0.36, 1] }}
                className="mx-auto px-8 py-8"
                style={{ maxWidth: 'var(--content-max-width)' }}
            >
                {/* Header */}
                <PageHeader
                    title="Connections"
                    subtitle="Manage your HR and recruiter network"
                    breadcrumb={[
                        { label: 'Dashboard', href: '/dashboard' },
                        { label: 'Connections' }
                    ]}
                    rightSlot={
                        <div className="flex items-center gap-3">
                            <KpiChip label="Total" value={connections.length} />
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Link
                                    href="/connections/new"
                                    className="btn-primary-modern"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add Connection
                                </Link>
                            </motion.div>
                        </div>
                    }
                />

                {/* Statistics Overview */}
                {/* <StatsOverview stats={stats} loading={statsLoading} /> */}

                {/* Search and Filters */}
                <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, ease: [0.22, 0.61, 0.36, 1], delay: 0.1 }}
                    className="mb-8"
                >
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                        <div className="flex-1 max-w-md">
                            <SearchInput
                                value={search}
                                onChange={handleSearchChange}
                                onKeyDown={handleKeyDown}
                                placeholder="Search by name or email…"
                                className="w-full"
                            />
                        </div>

                        <div className="flex items-center gap-3">
                            {/* Filter Dropdown */}
                            <div className="relative">
                                <select
                                    value={filterBy}
                                    onChange={(e) => setFilterBy(e.target.value as 'all' | 'recent' | 'active')}
                                    className="appearance-none bg-white border border-slate-200 rounded-lg px-4 py-2 pr-8 text-sm font-medium text-slate-700 hover:border-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                >
                                    <option value="all">All Connections</option>
                                    <option value="recent">Recent (7 days)</option>
                                    <option value="active">Active</option>
                                </select>
                                <Filter className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                            </div>

                            {/* Sort Options */}
                            <div className="flex items-center gap-2">
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value as 'name' | 'email' | 'date')}
                                    className="appearance-none bg-white border border-slate-200 rounded-lg px-3 py-2 pr-8 text-sm font-medium text-slate-700 hover:border-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                >
                                    <option value="date">Date Added</option>
                                    <option value="name">Name</option>
                                    <option value="email">Email</option>
                                </select>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                                >
                                    {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                                </motion.button>
                            </div>

                            {/* Export Button */}
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleExport}
                                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                                title="Export connections"
                            >
                                <Download className="w-4 h-4" />
                            </motion.button>
                        </div>
                    </div>
                </motion.div>

                {/* Error Banner */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.2 }}
                        className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl"
                    >
                        <div className="flex items-start gap-3">
                            <ShieldAlert className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                                <h3 className="text-sm font-semibold text-red-800">Network error</h3>
                                <p className="mt-1 text-sm text-red-700">{error}</p>
                                <div className="mt-3">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => fetchConnections(search)}
                                        className="inline-flex items-center gap-2 text-sm font-medium text-red-800 hover:text-red-600 transition-colors duration-200"
                                    >
                                        <RefreshCw className="w-4 h-4" />
                                        Try again
                                    </motion.button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Loading state */}
                {loading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center justify-center py-16"
                    >
                        <LoadingSpinner size="lg" text="Loading connections..." />
                    </motion.div>
                )}

                {/* Content */}
                {!loading && (
                    <AnimatePresence mode="wait">
                        {sortedAndFilteredConnections.length === 0 ? (
                            /* Empty State */
                            <motion.div
                                key="empty"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.25, ease: [0.22, 0.61, 0.36, 1] }}
                                className="text-center py-16"
                            >
                                <div className="card-modern max-w-md mx-auto">
                                    <div className="w-16 h-16 bg-slate-100 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                                        <UserRound className="w-8 h-8 text-slate-400" />
                                    </div>
                                    <h3 className="text-section-title mb-2">
                                        {search.trim() ? 'No connections found' : 'No connections yet'}
                                    </h3>
                                    <p className="text-helper mb-8">
                                        {search.trim()
                                            ? 'No connections match your search criteria.'
                                            : 'Start by adding your first HR or recruiter contact.'
                                        }
                                    </p>
                                    <motion.div
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <Link
                                            href="/connections/new"
                                            className="btn-primary-modern"
                                        >
                                            <Plus className="w-4 h-4" />
                                            Add Connection
                                        </Link>
                                    </motion.div>
                                </div>
                            </motion.div>
                        ) : (
                            /* Connections List */
                            <motion.div
                                key="list"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.25, ease: [0.22, 0.61, 0.36, 1] }}
                                className="space-y-4"
                            >

                                <AnimatePresence>
                                    {sortedAndFilteredConnections.map((connection, index) => (
                                        <ConnectionCard
                                            key={connection.id}
                                            connection={connection}
                                            index={index}
                                            onCopy={handleCopyEmail}
                                            onView={handleViewConnection}
                                            onEdit={handleEditConnection}
                                            onDelete={handleDeleteConnection}
                                            selectable={true}
                                            selected={selectedConnections.has(connection.id)}
                                            onSelect={handleConnectionSelect}
                                        />
                                    ))}
                                </AnimatePresence>
                            </motion.div>
                        )}

                        {/* Load More */}
                        {hasMore && sortedAndFilteredConnections.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="mt-8 text-center"
                            >
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={loadMore}
                                    disabled={loadingMore}
                                    className="btn-secondary-modern"
                                >
                                    {loadingMore ? (
                                        <LoadingSpinner size="sm" text="Loading..." />
                                    ) : (
                                        <>
                                            <RefreshCw className="w-4 h-4" />
                                            Load More Connections
                                        </>
                                    )}
                                </motion.button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                )}
            </motion.div>

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                isOpen={deleteDialog?.isOpen || false}
                title="Delete this connection?"
                description={`Are you sure you want to delete the connection for ${deleteDialog?.connection?.email}? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                onConfirm={confirmDelete}
                onCancel={() => setDeleteDialog(null)}
                dangerous
            />

            {/* Toast Container */}
            <ToastContainer />
        </>
    );
}
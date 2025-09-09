'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft,
    Pencil,
    Trash2,
    Mail,
    CalendarClock,
    Link2,
    Copy,
    ShieldAlert,
    RefreshCw,
    User,
    Calendar,
    ExternalLink
} from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import {
    PageHeader,
    FormField,
    ConfirmDialog,
    useToast,
    ContactInfoCard,
    QuickActions,
    StatusBadge
} from '@/components/connections';
import { validateConnection } from '@/lib/validators';
import type { Connection, UpdateConnectionRequest, ConnectionError } from '@/types/connections';

interface ConnectionDetailPageProps {
    params: Promise<{
        id: string;
    }>;
}

export default function ConnectionDetailPage({ params }: ConnectionDetailPageProps) {
    const router = useRouter();
    const { id } = React.use(params);
    const { showToast, ToastContainer } = useToast();

    const [connection, setConnection] = useState<Connection | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState<UpdateConnectionRequest>({});
    const [editErrors, setEditErrors] = useState<Record<string, string>>({});
    const [isSaving, setIsSaving] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState<{ connection: Connection; isOpen: boolean } | null>(null);

    // Fetch connection data
    const fetchConnection = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`/api/app/connections/${id}`);

            if (!response.ok) {
                const errorData: ConnectionError = await response.json();
                if (response.status === 401) {
                    router.push('/signin');
                    return;
                }
                if (response.status === 404) {
                    setError('Connection not found');
                    return;
                }
                throw new Error(errorData.message || 'Failed to fetch connection');
            }

            const result = await response.json();
            setConnection(result.data);

            // Initialize edit data
            setEditData({
                email: result.data.email,
                name: result.data.name || '',
                linkedin_url: result.data.linkedin_url || '',
            });

        } catch (err) {
            console.error('Error fetching connection:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch connection');
        } finally {
            setLoading(false);
        }
    };

    // Load connection on mount
    useEffect(() => {
        fetchConnection();
    }, [id]);

    // Handle edit input changes
    const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setEditData((prev: UpdateConnectionRequest) => ({
            ...prev,
            [name]: value,
        }));

        // Clear field-specific error
        if (editErrors[name]) {
            setEditErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    // Start editing
    const startEditing = () => {
        setIsEditing(true);
        setEditErrors({});
    };

    // Cancel editing
    const cancelEditing = () => {
        setIsEditing(false);
        setEditErrors({});
        // Reset edit data
        if (connection) {
            setEditData({
                email: connection.email,
                name: connection.name || '',
                linkedin_url: connection.linkedin_url || '',
            });
        }
    };

    // Save changes
    const saveChanges = async () => {
        if (!connection) return;

        // Validate data
        const validation = validateConnection({
            email: editData.email || connection.email,
            name: editData.name || null,
            linkedin_url: editData.linkedin_url || null,
        });

        if (!validation.isValid) {
            setEditErrors(validation.errors);
            return;
        }

        setIsSaving(true);

        try {
            const response = await fetch(`/api/app/connections/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(editData),
            });

            if (!response.ok) {
                const errorData: ConnectionError = await response.json();

                if (response.status === 401) {
                    router.push('/signin');
                    return;
                }

                if (response.status === 409) {
                    setEditErrors({ email: 'A connection with this email already exists' });
                    return;
                }

                if (response.status === 422) {
                    const details = (errorData as ConnectionError & { details?: Record<string, string> }).details;
                    if (details) {
                        setEditErrors(details);
                        return;
                    }
                }

                throw new Error(errorData.message || 'Failed to update connection');
            }

            const result = await response.json();
            setConnection(result.data);
            setIsEditing(false);
            setEditErrors({});
            showToast('Connection updated');

        } catch (err) {
            console.error('Error updating connection:', err);
            setError(err instanceof Error ? err.message : 'Failed to update connection');
        } finally {
            setIsSaving(false);
        }
    };

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

    // Delete connection
    const confirmDeleteConnection = useCallback(async () => {
        if (!connection) return;

        try {
            const response = await fetch(`/api/app/connections/${id}`, {
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

            showToast('Connection deleted');
            // Redirect to connections list
            router.push('/connections');

        } catch (err) {
            console.error('Error deleting connection:', err);
            showToast(err instanceof Error ? err.message : 'Failed to delete connection', 'error');
        }
    }, [connection, id, router, showToast]);

    // Format date
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // Loading state
    if (loading) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <div className="flex items-center justify-center py-12">
                    <LoadingSpinner size="lg" text="Loading connection..." />
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Error loading connection</h3>
                    <p className="mt-1 text-sm text-gray-500">{error}</p>
                    <div className="mt-6 space-x-4">
                        <button
                            onClick={fetchConnection}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                        >
                            Try Again
                        </button>
                        <Link
                            href="/connections"
                            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                            Back to Connections
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    if (!connection) {
        return null;
    }

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: [0.22, 0.61, 0.36, 1] }}
                className="mx-auto px-8 py-8"
                style={{ maxWidth: 'var(--content-max-width)' }}
            >
                {/* Enhanced Header */}
                <PageHeader
                    title={connection.name || 'Connection Details'}
                    subtitle={connection.email}
                    breadcrumb={[
                        { label: 'Connections', href: '/connections' },
                        { label: connection.name || connection.email }
                    ]}
                    rightSlot={
                        <div className="flex items-center gap-3">
                            {/* Status Badge */}
                            <StatusBadge status="active" />

                            {!isEditing && (
                                <>
                                    <motion.button
                                        whileHover={{ scale: 1.02, x: -2 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={startEditing}
                                        className="btn-secondary-modern"
                                    >
                                        <Pencil className="w-4 h-4" />
                                        Edit
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => setDeleteDialog({ connection, isOpen: true })}
                                        className="btn-danger-modern"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Delete
                                    </motion.button>
                                </>
                            )}
                        </div>
                    }
                />

                {/* Contact Information Card */}
                <ContactInfoCard
                    connection={connection}
                    onCopy={handleCopyEmail}
                    onEdit={startEditing}
                    onDelete={() => setDeleteDialog({ connection, isOpen: true })}
                    isEditing={isEditing}
                />

                {/* Edit Form Modal/Overlay */}
                <AnimatePresence>
                    {isEditing && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 flex items-center justify-center p-4"
                        >
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="p-6 space-y-6">
                                    <h3 className="text-xl font-semibold text-slate-900 mb-6">
                                        Edit Connection
                                    </h3>

                                    {/* Email Field */}
                                    <FormField
                                        label="Email Address"
                                        required
                                        icon={<Mail className="w-4 h-4" />}
                                        error={editErrors.email}
                                    >
                                        <input
                                            type="email"
                                            name="email"
                                            value={editData.email || ''}
                                            onChange={handleEditChange}
                                            className={`input-modern w-full ${editErrors.email ? 'border-red-300 bg-red-50' : ''
                                                }`}
                                            placeholder="email@company.com"
                                        />
                                    </FormField>

                                    {/* Name Field */}
                                    <FormField
                                        label="Full Name"
                                        icon={<User className="w-4 h-4" />}
                                        error={editErrors.name}
                                    >
                                        <input
                                            type="text"
                                            name="name"
                                            value={editData.name || ''}
                                            onChange={handleEditChange}
                                            className={`input-modern w-full ${editErrors.name ? 'border-red-300 bg-red-50' : ''
                                                }`}
                                            placeholder="John Doe"
                                        />
                                    </FormField>

                                    {/* LinkedIn Field */}
                                    <FormField
                                        label="LinkedIn Profile"
                                        icon={<ExternalLink className="w-4 h-4" />}
                                        error={editErrors.linkedin_url}
                                    >
                                        <input
                                            type="url"
                                            name="linkedin_url"
                                            value={editData.linkedin_url || ''}
                                            onChange={handleEditChange}
                                            className={`input-modern w-full ${editErrors.linkedin_url ? 'border-red-300 bg-red-50' : ''
                                                }`}
                                            placeholder="https://www.linkedin.com/in/username"
                                        />
                                    </FormField>

                                    {/* Actions */}
                                    <div className="flex items-center justify-between pt-6 border-t border-slate-200">
                                        <button
                                            onClick={cancelEditing}
                                            disabled={isSaving}
                                            className="text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors duration-150 disabled:opacity-50"
                                        >
                                            Cancel
                                        </button>
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={saveChanges}
                                            disabled={isSaving}
                                            className="btn-primary-modern"
                                        >
                                            {isSaving ? (
                                                <LoadingSpinner size="sm" color="white" text="Saving..." />
                                            ) : (
                                                'Save Changes'
                                            )}
                                        </motion.button>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Quick Actions */}
                {!isEditing && (
                    <QuickActions
                        connection={connection}
                        onCopy={handleCopyEmail}
                    />
                )}
            </motion.div>

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                isOpen={deleteDialog?.isOpen || false}
                title="Delete this connection?"
                description={`Are you sure you want to delete the connection for ${connection?.email}? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                onConfirm={confirmDeleteConnection}
                onCancel={() => setDeleteDialog(null)}
                dangerous
            />

            {/* Toast Container */}
            <ToastContainer />
        </>
    );
}
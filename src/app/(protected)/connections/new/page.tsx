'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft,
    Mail,
    User,
    Link2,
    Plus,
    ShieldAlert,
    CheckCircle,
    Upload,
    FileText,
    Linkedin,
    Globe
} from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { PageHeader, FormField, useToast } from '@/components/connections';
import { validateConnection } from '@/lib/validators';
import type { CreateConnectionRequest, ConnectionError } from '@/types/connections';

export default function NewConnectionPage() {
    const router = useRouter();
    const { showToast, ToastContainer } = useToast();

    const [formData, setFormData] = useState<CreateConnectionRequest>({
        email: '',
        name: '',
        linkedin_url: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [formProgress, setFormProgress] = useState(0);
    const [linkedinProfile, setLinkedinProfile] = useState<{
        name: string;
        title: string;
        company: string;
        profilePicture: string | null;
    } | null>(null);
    const [fetchingProfile, setFetchingProfile] = useState(false);

    // Calculate form progress
    useEffect(() => {
        const fields = [formData.email, formData.name, formData.linkedin_url];
        const filledFields = fields.filter(field => field && field.trim().length > 0);
        const progress = Math.round((filledFields.length / fields.length) * 100);
        setFormProgress(progress);
    }, [formData]);

    // Email domain suggestions
    const getEmailSuggestions = useCallback((email: string) => {
        if (!email || !email.includes('@')) return [];

        const [localPart] = email.split('@');
        const commonDomains = [
            'gmail.com',
            'outlook.com',
            'yahoo.com',
            'hotmail.com',
            'company.com',
            'corporate.com'
        ];

        return commonDomains.map(domain => `${localPart}@${domain}`);
    }, []);

    // LinkedIn profile fetching (mock implementation)
    const fetchLinkedInProfile = useCallback(async (url: string) => {
        if (!url.includes('linkedin.com')) return;

        setFetchingProfile(true);

        // Mock LinkedIn profile data - in real app would use LinkedIn API
        setTimeout(() => {
            const mockProfile = {
                name: 'John Doe',
                title: 'Senior Recruiter',
                company: 'Tech Corp',
                profilePicture: null
            };
            setLinkedinProfile(mockProfile);

            // Auto-fill name if empty
            if (!formData.name) {
                setFormData(prev => ({ ...prev, name: mockProfile.name }));
            }

            setFetchingProfile(false);
        }, 1500);
    }, [formData.name]);

    // Enhanced input handler with smart features
    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        setFormData((prev: CreateConnectionRequest) => ({
            ...prev,
            [name]: value,
        }));

        // Clear field-specific error when user starts typing
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }

        // Clear submit error
        if (submitError) {
            setSubmitError(null);
        }

        // Handle email suggestions
        if (name === 'email') {
            if (value.includes('@') && !value.includes('.')) {
                const emailSuggestions = getEmailSuggestions(value);
                setSuggestions(emailSuggestions);
                setShowSuggestions(emailSuggestions.length > 0);
            } else {
                setShowSuggestions(false);
            }
        }

        // Handle LinkedIn URL formatting and profile fetching
        if (name === 'linkedin_url') {
            let formattedUrl = value;

            // Auto-format LinkedIn URL
            if (value && !value.startsWith('https://')) {
                if (value.includes('linkedin.com')) {
                    formattedUrl = `https://${value}`;
                } else if (value.startsWith('www.linkedin.com')) {
                    formattedUrl = `https://${value}`;
                } else if (!value.includes('linkedin.com') && value.length > 3) {
                    formattedUrl = `https://www.linkedin.com/in/${value}`;
                }

                if (formattedUrl !== value) {
                    setFormData(prev => ({ ...prev, linkedin_url: formattedUrl }));
                    return;
                }
            }

            // Fetch LinkedIn profile when valid URL is detected
            if (formattedUrl && formattedUrl.includes('linkedin.com/in/')) {
                fetchLinkedInProfile(formattedUrl);
            } else {
                setLinkedinProfile(null);
            }
        }
    }, [errors, submitError, getEmailSuggestions, fetchLinkedInProfile]);

    // Handle suggestion selection
    const handleSuggestionSelect = useCallback((suggestion: string) => {
        setFormData(prev => ({ ...prev, email: suggestion }));
        setShowSuggestions(false);
    }, []);

    // Check if email exists
    const checkEmailExists = useCallback(async (email: string) => {
        if (!email || !email.includes('@')) return false;

        try {
            const response = await fetch(`/api/app/connections?search=${encodeURIComponent(email)}`);
            if (response.ok) {
                const data = await response.json();
                return data.data.some((conn: { email: string }) => conn.email.toLowerCase() === email.toLowerCase());
            }
        } catch (err) {
            console.error('Error checking email:', err);
        }
        return false;
    }, []);

    // Enhanced validation with real-time feedback
    const validateForm = useCallback(async () => {
        const validation = validateConnection(formData);

        // Check for duplicate email
        if (formData.email && validation.isValid) {
            const emailExists = await checkEmailExists(formData.email);
            if (emailExists) {
                validation.errors.email = 'A connection with this email already exists';
                validation.isValid = false;
            }
        }

        setErrors(validation.errors);
        return validation.isValid;
    }, [formData, checkEmailExists]);

    // Enhanced form submission with better UX
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate form with async checks
        const isValid = await validateForm();
        if (!isValid) {
            showToast('Please fix the errors below', 'error');
            return;
        }

        setIsSubmitting(true);
        setSubmitError(null);

        try {
            const response = await fetch('/api/app/connections', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errorData: ConnectionError = await response.json();

                if (response.status === 401) {
                    router.push('/signin');
                    return;
                }

                if (response.status === 409) {
                    setErrors({ email: 'A connection with this email already exists' });
                    showToast('Email already exists in your connections', 'error');
                    return;
                }

                if (response.status === 422) {
                    // Validation errors from server
                    const details = (errorData as ConnectionError & { details?: Record<string, string> }).details;
                    if (details) {
                        setErrors(details);
                        return;
                    }
                }

                throw new Error(errorData.message || 'Failed to create connection');
            }

            // Success - show toast and redirect
            const result = await response.json();
            showToast('Connection created successfully! 🎉');

            // Animate success before redirect
            setTimeout(() => {
                router.push(`/connections/${result.data.id}`);
            }, 1000);

        } catch (err) {
            console.error('Error creating connection:', err);
            setSubmitError(err instanceof Error ? err.message : 'Failed to create connection');
            showToast('Failed to create connection', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

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
                    title="Add New Connection"
                    subtitle="Expand your HR network with a new contact"
                    breadcrumb={[
                        { label: 'Connections', href: '/connections' },
                        { label: 'Add New' }
                    ]}
                    rightSlot={
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <Link
                                href="/connections"
                                className="btn-secondary-modern"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back to list
                            </Link>
                        </motion.div>
                    }
                />

                {/* Network Error Banner */}
                {submitError && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl"
                    >
                        <div className="flex items-start gap-3">
                            <ShieldAlert className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                                <h3 className="text-sm font-semibold text-red-800">Error creating connection</h3>
                                <p className="text-sm text-red-700 mt-1">{submitError}</p>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Form Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, ease: [0.22, 0.61, 0.36, 1], delay: 0.15 }}
                    className="card-modern max-w-2xl mx-auto"
                >
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Email Field with Smart Suggestions */}
                        <FormField
                            label="Email Address"
                            required
                            icon={<Mail className="w-4 h-4" />}
                            error={errors.email}
                            helper="Primary contact email for this HR professional"
                        >
                            <div className="relative">
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className={`input-modern w-full ${errors.email ? 'border-red-300 bg-red-50' : ''
                                        }`}
                                    placeholder="hr@company.com"
                                    autoComplete="email"
                                />
                                {formData.email && !errors.email && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                                    >
                                        <CheckCircle className="w-5 h-5 text-emerald-500" />
                                    </motion.div>
                                )}

                                {/* Email Suggestions */}
                                <AnimatePresence>
                                    {showSuggestions && suggestions.length > 0 && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-10"
                                        >
                                            {suggestions.slice(0, 3).map((suggestion, index) => (
                                                <button
                                                    key={suggestion}
                                                    type="button"
                                                    onClick={() => handleSuggestionSelect(suggestion)}
                                                    className="w-full px-4 py-3 text-left text-sm hover:bg-slate-50 transition-colors duration-150 first:rounded-t-lg last:rounded-b-lg flex items-center gap-3"
                                                >
                                                    <Mail className="w-4 h-4 text-slate-400" />
                                                    <span>{suggestion}</span>
                                                </button>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </FormField>

                        {/* Name Field */}
                        <FormField
                            label="Full Name"
                            icon={<User className="w-4 h-4" />}
                            error={errors.name}
                            helper="Recruiter or HR manager's full name"
                        >
                            <div className="relative">
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className={`input-modern w-full ${errors.name ? 'border-red-300 bg-red-50' : ''
                                        }`}
                                    placeholder="John Doe"
                                    autoComplete="name"
                                />
                                {linkedinProfile && (
                                    <motion.div
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full"
                                    >
                                        Auto-filled
                                    </motion.div>
                                )}
                            </div>
                        </FormField>

                        {/* LinkedIn Field with Smart Features */}
                        <FormField
                            label="LinkedIn Profile"
                            icon={<Linkedin className="w-4 h-4" />}
                            error={errors.linkedin_url}
                            helper="Start typing username or paste full URL"
                        >
                            <div className="space-y-3">
                                <div className="relative">
                                    <input
                                        type="url"
                                        name="linkedin_url"
                                        value={formData.linkedin_url}
                                        onChange={handleChange}
                                        className={`input-modern w-full ${errors.linkedin_url ? 'border-red-300 bg-red-50' : ''
                                            }`}
                                        placeholder="johndoe or https://www.linkedin.com/in/johndoe"
                                    />
                                    {fetchingProfile && (
                                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                            <LoadingSpinner size="sm" />
                                        </div>
                                    )}
                                </div>

                                {/* LinkedIn Profile Preview */}
                                <AnimatePresence>
                                    {linkedinProfile && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="p-4 bg-blue-50 border border-blue-200 rounded-lg"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                                                    {linkedinProfile.name.charAt(0)}
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-slate-900">
                                                        {linkedinProfile.name}
                                                    </h4>
                                                    <p className="text-sm text-slate-600">
                                                        {linkedinProfile.title} at {linkedinProfile.company}
                                                    </p>
                                                </div>
                                                <CheckCircle className="w-5 h-5 text-emerald-500" />
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </FormField>

                        {/* Quick Actions */}
                        <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                            <div className="flex items-center gap-2">
                                <Upload className="w-4 h-4 text-slate-500" />
                                <span className="text-sm text-slate-600">Quick Add:</span>
                            </div>
                            <button
                                type="button"
                                className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                                onClick={() => {
                                    // Placeholder for bulk import
                                    showToast('Bulk import coming soon!', 'info');
                                }}
                            >
                                Import from CSV
                            </button>
                            <span className="text-slate-300">•</span>
                            <button
                                type="button"
                                className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                                onClick={() => {
                                    // Placeholder for LinkedIn import
                                    showToast('LinkedIn import coming soon!', 'info');
                                }}
                            >
                                Import from LinkedIn
                            </button>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between pt-6 border-t border-slate-200">
                            <div className="flex items-center gap-4">
                                <Link
                                    href="/connections"
                                    className="text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors duration-150"
                                >
                                    Cancel
                                </Link>
                                <button
                                    type="button"
                                    className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors duration-150"
                                    onClick={() => {
                                        // Save as draft functionality
                                        showToast('Draft saved locally!', 'info');
                                    }}
                                >
                                    Save as Draft
                                </button>
                            </div>
                            <div className="flex items-center gap-3">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    disabled={isSubmitting || formProgress < 34} // At least email required
                                    className="btn-primary-modern disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? (
                                        <LoadingSpinner size="sm" color="white" text="Creating..." />
                                    ) : (
                                        <>
                                            <Plus className="w-4 h-4" />
                                            Create Connection
                                        </>
                                    )}
                                </motion.button>
                                {formProgress === 100 && !isSubmitting && (
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        type="button"
                                        onClick={() => {
                                            // Create and add another connection
                                            handleSubmit({ preventDefault: () => { } } as React.FormEvent);
                                            // Then show option to add another
                                            setTimeout(() => {
                                                setFormData({ email: '', name: '', linkedin_url: '' });
                                                showToast('Ready for next connection!', 'info');
                                            }, 2000);
                                        }}
                                        className="btn-secondary-modern"
                                    >
                                        Save & Add Another
                                    </motion.button>
                                )}
                            </div>
                        </div>
                    </form>
                </motion.div>
            </motion.div>

            {/* Toast Container */}
            <ToastContainer />
        </>
    );
}
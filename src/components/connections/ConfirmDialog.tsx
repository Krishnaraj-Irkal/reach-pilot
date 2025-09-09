import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import { useEffect } from 'react';

interface ConfirmDialogProps {
    isOpen: boolean;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    dangerous?: boolean;
    loading?: boolean;
}

export default function ConfirmDialog({
    isOpen,
    title,
    description,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    onConfirm,
    onCancel,
    dangerous = false,
    loading = false
}: ConfirmDialogProps) {
    // Close on escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onCancel();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onCancel]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50"
                        onClick={onCancel}
                    />

                    {/* Dialog */}
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{
                                type: "spring",
                                stiffness: 300,
                                damping: 30
                            }}
                            className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="p-6 pb-4">
                                <div className="flex items-start gap-4">
                                    {dangerous && (
                                        <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full 
                                                      flex items-center justify-center">
                                            <AlertTriangle className="w-5 h-5 text-red-600" />
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-slate-900 mb-2">
                                            {title}
                                        </h3>
                                        <p className="text-sm text-slate-600 leading-relaxed">
                                            {description}
                                        </p>
                                    </div>
                                    <button
                                        onClick={onCancel}
                                        className="flex-shrink-0 p-1 text-slate-400 hover:text-slate-600 
                                                 transition-colors rounded-lg hover:bg-slate-100"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="px-6 py-4 bg-slate-50 flex items-center justify-end gap-3">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={onCancel}
                                    disabled={loading}
                                    className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 
                                             transition-colors disabled:opacity-50"
                                >
                                    {cancelText}
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={onConfirm}
                                    disabled={loading}
                                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all 
                                              disabled:opacity-50 min-w-[80px] flex items-center justify-center gap-2
                                              ${dangerous
                                            ? 'bg-red-600 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500/20'
                                            : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500/20'
                                        }`}
                                >
                                    {loading && (
                                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            />
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            />
                                        </svg>
                                    )}
                                    {confirmText}
                                </motion.button>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
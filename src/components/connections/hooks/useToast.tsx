import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, XCircle, Info, AlertTriangle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
    duration?: number;
}

interface ToastContextValue {
    showToast: (message: string, type?: ToastType, duration?: number) => void;
    ToastContainer: () => JSX.Element;
}

export function useToast(): ToastContextValue {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: ToastType = 'success', duration = 4000) => {
        const id = Math.random().toString(36).substring(2, 9);
        const toast: Toast = { id, message, type, duration };

        setToasts(prev => [...prev, toast]);

        if (duration > 0) {
            setTimeout(() => {
                setToasts(prev => prev.filter(t => t.id !== id));
            }, duration);
        }
    }, []);

    const dismissToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const ToastContainer = useCallback(() => (
        <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
            <AnimatePresence>
                {toasts.map((toast) => (
                    <ToastComponent
                        key={toast.id}
                        toast={toast}
                        onDismiss={dismissToast}
                    />
                ))}
            </AnimatePresence>
        </div>
    ), [toasts, dismissToast]);

    return { showToast, ToastContainer };
}

interface ToastComponentProps {
    toast: Toast;
    onDismiss: (id: string) => void;
}

function ToastComponent({ toast, onDismiss }: ToastComponentProps) {
    const getIcon = () => {
        switch (toast.type) {
            case 'success':
                return <CheckCircle className="w-5 h-5 text-emerald-500" />;
            case 'error':
                return <XCircle className="w-5 h-5 text-red-500" />;
            case 'warning':
                return <AlertTriangle className="w-5 h-5 text-amber-500" />;
            case 'info':
            default:
                return <Info className="w-5 h-5 text-blue-500" />;
        }
    };

    const getBgColor = () => {
        switch (toast.type) {
            case 'success':
                return 'bg-emerald-50 border-emerald-200';
            case 'error':
                return 'bg-red-50 border-red-200';
            case 'warning':
                return 'bg-amber-50 border-amber-200';
            case 'info':
            default:
                return 'bg-blue-50 border-blue-200';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 300, scale: 0.3 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.5 }}
            transition={{
                type: "spring",
                stiffness: 500,
                damping: 30,
                mass: 1
            }}
            className={`flex items-center gap-3 p-4 rounded-xl border shadow-sm ${getBgColor()}`}
        >
            {getIcon()}
            <p className="flex-1 text-sm font-medium text-slate-700">
                {toast.message}
            </p>
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onDismiss(toast.id)}
                className="flex-shrink-0 text-slate-400 hover:text-slate-600 transition-colors"
            >
                <X className="w-4 h-4" />
            </motion.button>
        </motion.div>
    );
}
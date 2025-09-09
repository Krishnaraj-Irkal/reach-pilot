import { ReactNode } from 'react';

interface FormFieldProps {
    label: string;
    required?: boolean;
    icon?: ReactNode;
    error?: string;
    helper?: string;
    children: ReactNode;
}

export default function FormField({
    label,
    required = false,
    icon,
    error,
    helper,
    children
}: FormFieldProps) {
    return (
        <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-900">
                <div className="flex items-center gap-2">
                    {icon && <span className="text-slate-500">{icon}</span>}
                    <span>{label}</span>
                    {required && <span className="text-red-500">*</span>}
                </div>
            </label>

            <div className="relative">
                {children}
            </div>

            {error && (
                <p className="text-sm text-red-600 flex items-center gap-2">
                    <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {error}
                </p>
            )}

            {helper && !error && (
                <p className="text-sm text-slate-500">{helper}</p>
            )}
        </div>
    );
}
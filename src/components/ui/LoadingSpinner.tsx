interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    color?: 'primary' | 'secondary' | 'white';
    text?: string;
    showText?: boolean;
}

export default function LoadingSpinner({
    size = 'md',
    color = 'primary',
    text = 'Loading...',
    showText = true
}: LoadingSpinnerProps) {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-8 h-8',
        lg: 'w-12 h-12'
    };

    const colorClasses = {
        primary: 'border-blue-600',
        secondary: 'border-gray-600',
        white: 'border-white'
    };

    const textSizeClasses = {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg'
    };

    return (
        <div className="flex flex-col items-center justify-center space-y-2">
            <div className="relative">
                <div
                    className={`${sizeClasses[size]} border-4 border-t-transparent ${colorClasses[color]} rounded-full animate-spin`}
                    style={{
                        borderTopColor: 'transparent',
                        animation: 'spin 1s linear infinite'
                    }}
                />
                <div
                    className={`absolute inset-0 ${sizeClasses[size]} border-4 border-transparent rounded-full animate-pulse`}
                    style={{
                        borderTopColor: color === 'primary' ? '#3b82f6' : color === 'secondary' ? '#4b5563' : '#ffffff',
                        animation: 'pulse 2s ease-in-out infinite'
                    }}
                />
            </div>
            {showText && (
                <span className={`${textSizeClasses[size]} ${color === 'white' ? 'text-white' : 'text-gray-600'} font-medium animate-pulse`}>
                    {text}
                </span>
            )}
        </div>
    );
}
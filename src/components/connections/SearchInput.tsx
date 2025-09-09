import { motion } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { forwardRef } from 'react';

interface SearchInputProps {
    value: string;
    onChange: (value: string) => void;
    onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    placeholder?: string;
    className?: string;
    showSuggestions?: boolean;
    suggestions?: string[];
    onSuggestionSelect?: (suggestion: string) => void;
}

const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
    ({
        value,
        onChange,
        onKeyDown,
        placeholder = "Search...",
        className = "",
        showSuggestions = false,
        suggestions = [],
        onSuggestionSelect
    }, ref) => {
        const handleClear = () => {
            onChange('');
        };

        return (
            <div className={`relative ${className}`}>
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        ref={ref}
                        type="text"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        onKeyDown={onKeyDown}
                        placeholder={placeholder}
                        className="w-full pl-12 pr-12 py-3 text-base bg-white border border-slate-200 rounded-xl 
                                 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 
                                 transition-all duration-200 
                                 placeholder:text-slate-400
                                 hover:border-slate-300"
                    />
                    {value && (
                        <motion.button
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={handleClear}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 
                                     text-slate-400 hover:text-slate-600 transition-colors
                                     p-1 rounded-full hover:bg-slate-100"
                        >
                            <X className="w-4 h-4" />
                        </motion.button>
                    )}
                </div>

                {/* Search Suggestions */}
                {showSuggestions && suggestions.length > 0 && value && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 
                                 rounded-xl shadow-lg z-10 max-h-64 overflow-y-auto"
                    >
                        {suggestions.map((suggestion, index) => (
                            <motion.button
                                key={suggestion}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.15, delay: index * 0.03 }}
                                onClick={() => onSuggestionSelect?.(suggestion)}
                                className="w-full px-4 py-3 text-left text-sm hover:bg-slate-50 
                                         transition-colors duration-150 first:rounded-t-xl last:rounded-b-xl
                                         flex items-center gap-3"
                            >
                                <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                <span className="flex-1 truncate">{suggestion}</span>
                            </motion.button>
                        ))}
                    </motion.div>
                )}
            </div>
        );
    }
);

SearchInput.displayName = 'SearchInput';

export default SearchInput;
import React from 'react';
import PropTypes from 'prop-types';
import { Loader2 } from 'lucide-react';

/**
 * LoadingSpinner Component
 * Displays an animated spinner with optional text
 */
const LoadingSpinner = ({ size = 'md', text }) => {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        lg: 'w-8 h-8'
    };

    return (
        <div className="flex flex-col items-center justify-center gap-2 p-4">
            <Loader2
                className={`${sizeClasses[size]} animate-spin text-blue-600`}
                aria-label="Loading"
            />
            {text && <p className="text-sm text-gray-600 font-medium">{text}</p>}
        </div>
    );
};

LoadingSpinner.propTypes = {
    size: PropTypes.oneOf(['sm', 'md', 'lg']),
    text: PropTypes.string
};

export default LoadingSpinner;

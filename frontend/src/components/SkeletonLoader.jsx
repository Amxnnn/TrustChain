import React from 'react';
import PropTypes from 'prop-types';

/**
 * Displays loading placeholders for different content types
 */
const SkeletonLoader = ({ type = 'text', count = 1 }) => {
    const renderSkeleton = (index) => {
        switch (type) {
            case 'card':
                return (
                    <div key={index} className="bg-white rounded-xl shadow-md p-5 border border-gray-100 animate-pulse">
                        <div className="flex justify-between items-start mb-4">
                            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                            <div className="h-6 bg-gray-200 rounded w-16"></div>
                        </div>
                        <div className="space-y-3">
                            <div className="h-4 bg-gray-200 rounded w-full"></div>
                            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                        </div>
                        <div className="mt-4 flex gap-2">
                            <div className="h-8 bg-gray-200 rounded w-24"></div>
                            <div className="h-8 bg-gray-200 rounded w-24"></div>
                        </div>
                    </div>
                );

            case 'list':
                return (
                    <div key={index} className="flex gap-4 p-4 animate-pulse">
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex-shrink-0"></div>
                        <div className="flex-1 space-y-2 py-1">
                            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        </div>
                    </div>
                );

            case 'text':
            default:
                return (
                    <div key={index} className="animate-pulse space-y-2 mb-2">
                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                    </div>
                );
        }
    };

    return (
        <div className="w-full">
            {Array.from({ length: count }).map((_, index) => renderSkeleton(index))}
        </div>
    );
};

SkeletonLoader.propTypes = {
    type: PropTypes.oneOf(['card', 'list', 'text']),
    count: PropTypes.number
};

export default SkeletonLoader;

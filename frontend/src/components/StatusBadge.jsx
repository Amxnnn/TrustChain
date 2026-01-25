import React from 'react';
import PropTypes from 'prop-types';
import { Package, Truck, Warehouse, Store, CheckCircle, AlertCircle } from 'lucide-react';

/**
 * StatusBadge Component
 * Displays a colorful badge with icon for product status
 */
const StatusBadge = ({ status, size = 'md' }) => {
    const getStatusConfig = (status) => {
        switch (status) {
            case 'Manufactured':
                return {
                    color: 'bg-blue-100 text-blue-800 border-blue-200',
                    icon: Package
                };
            case 'In Transit':
                return {
                    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
                    icon: Truck
                };
            case 'At Warehouse':
                return {
                    color: 'bg-purple-100 text-purple-800 border-purple-200',
                    icon: Warehouse
                };
            case 'At Retailer':
                return {
                    color: 'bg-orange-100 text-orange-800 border-orange-200',
                    icon: Store
                };
            case 'Delivered':
                return {
                    color: 'bg-green-100 text-green-800 border-green-200',
                    icon: CheckCircle
                };
            default:
                return {
                    color: 'bg-gray-100 text-gray-800 border-gray-200',
                    icon: AlertCircle
                };
        }
    };

    const config = getStatusConfig(status);
    const Icon = config.icon;

    const sizeClasses = {
        sm: 'text-xs px-2 py-0.5 gap-1',
        md: 'text-sm px-2.5 py-0.5 gap-1.5',
        lg: 'text-base px-3 py-1 gap-2'
    };

    const iconSizes = {
        sm: 12,
        md: 16,
        lg: 18
    };

    return (
        <span className={`inline-flex items-center font-medium rounded-full border ${config.color} ${sizeClasses[size]}`}>
            <Icon size={iconSizes[size]} />
            {status}
        </span>
    );
};

StatusBadge.propTypes = {
    status: PropTypes.string.isRequired,
    size: PropTypes.oneOf(['sm', 'md', 'lg'])
};

export default StatusBadge;

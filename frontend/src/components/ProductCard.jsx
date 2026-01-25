import React from 'react';
import PropTypes from 'prop-types';
import { Package, MapPin, Calendar, ArrowRight, QrCode } from 'lucide-react';
import StatusBadge from './StatusBadge';

const ProductCard = ({ product, onClick }) => {
    // Format timestamp (assuming milliseconds or seconds, handling both roughly)
    const formatDate = (timestamp) => {
        if (!timestamp) return 'N/A';
        const date = new Date(Number(timestamp) * 1000); // Contract usually returns seconds
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const truncate = (str, len = 20) => {
        if (!str) return '';
        return str.length > len ? str.substring(0, len) + '...' : str;
    }

    return (
        <div
            className="group bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col h-full"
            onClick={onClick}
        >
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wide">
                            ID: #{Number(product.id)}
                        </span>
                        {product.category && (
                            <span className="text-gray-400 text-xs px-1">•</span>
                        )}
                        {product.category && (
                            <span className="text-gray-500 text-xs font-medium">{product.category}</span>
                        )}
                    </div>
                    <h3 className="font-bold text-lg text-gray-900 leading-tight group-hover:text-blue-600 transition-colors">
                        {product.name || `Product #${Number(product.id)}`}
                    </h3>
                </div>
                <div className="bg-gray-50 p-2 rounded-lg group-hover:bg-blue-50 transition-colors">
                    <Package size={20} className="text-gray-400 group-hover:text-blue-600" />
                </div>
            </div>

            {/* Details Grid */}
            <div className="space-y-3 mb-6 flex-grow">
                {/* Status */}
                <div>
                    <StatusBadge status={product.status || 'N/A'} size="sm" />
                </div>

                {/* Location */}
                <div className="flex items-start gap-2 text-sm text-gray-600">
                    <MapPin size={16} className="mt-0.5 text-gray-400 shrink-0" />
                    <span className="line-clamp-1">{product.currentLocation || 'Unknown Location'}</span>
                </div>

                {/* Timestamp */}
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar size={16} className="text-gray-400" />
                    <span>{formatDate(product.timestamp)}</span>
                </div>
            </div>

            {/* Footer Actions */}
            <div className="pt-4 border-t border-gray-50 mt-auto flex justify-between items-center">
                <button
                    className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors"
                    onClick={(e) => {
                        e.stopPropagation();
                        // Logic to open QR modal could go here or passed down
                    }}
                >
                    <QrCode size={16} />
                    <span className="hidden sm:inline">QR Code</span>
                </button>

                <span className="flex items-center gap-1 text-sm font-medium text-blue-600 group-hover:translate-x-1 transition-transform">
                    View Details <ArrowRight size={16} />
                </span>
            </div>
        </div>
    );
};

ProductCard.propTypes = {
    product: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        name: PropTypes.string,
        category: PropTypes.string,
        status: PropTypes.string,
        currentLocation: PropTypes.string,
        manufacturer: PropTypes.string,
        timestamp: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    }).isRequired,
    onClick: PropTypes.func
};

export default ProductCard;

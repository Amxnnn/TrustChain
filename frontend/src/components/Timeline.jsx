import React from 'react';
import PropTypes from 'prop-types';
import { MapPin, Calendar, User, Truck } from 'lucide-react';

const Timeline = ({ events = [] }) => {
    if (!events || events.length === 0) {
        return (
            <div className="text-center py-10 px-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <Truck className="mx-auto h-10 w-10 text-gray-300 mb-3" />
                <p className="text-gray-500 font-medium">No tracking history available yet.</p>
            </div>
        );
    }

    // Helper to format date relative (e.g. "2 hours ago") or absolute
    const formatDate = (timestamp) => {
        if (!timestamp) return '';
        const date = new Date(Number(timestamp) * 1000);
        return date.toLocaleString();
    };

    const getEventIcon = (status) => {
        return <MapPin size={18} className="text-white" />;
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Manufactured': return 'bg-blue-500 ring-blue-100';
            case 'In Transit': return 'bg-yellow-500 ring-yellow-100';
            case 'Delivered': return 'bg-green-500 ring-green-100';
            default: return 'bg-purple-500 ring-purple-100';
        }
    };

    return (
        <div className="relative space-y-8 pl-4 sm:pl-0 sm:before:block sm:before:absolute sm:before:inset-0 sm:before:ml-5 sm:before:-translate-x-px md:before:mx-auto md:before:translate-x-0 sm:before:h-full sm:before:w-0.5 sm:before:bg-gradient-to-b sm:before:from-transparent sm:before:via-slate-300 sm:before:to-transparent">
            {events.map((event, index) => {
                const isLeft = index % 2 === 0;
                const colorClass = getStatusColor(event.status);

                return (
                    <div key={index} className={`relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group ${isLeft ? 'md:flex-row-reverse' : ''}`}>

                        <div className={`absolute left-0 sm:left-5 md:left-1/2 md:-translate-x-1/2 -translate-y-1/2 md:translate-y-0 flex items-center justify-center p-2 rounded-full ring-4 ring-white shadow-sm ${colorClass} z-10`}>
                            {getEventIcon(event.status)}
                        </div>

                        {/* Content Card */}
                        <div className={`w-full ml-10 sm:ml-16 md:w-[calc(50%-40px)] md:mx-0 p-5 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow`}>
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-bold text-gray-900">{event.location || 'Unknown Location'}</h4>
                                <span className="text-xs font-medium px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                                    {event.status}
                                </span>
                            </div>

                            {event.notes && (
                                <p className="text-gray-600 text-sm mb-3 bg-gray-50 p-2 rounded">{event.notes}</p>
                            )}

                            <div className="flex flex-col gap-1 mt-3 pt-3 border-t border-gray-50">
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <Calendar size={12} />
                                    {formatDate(event.timestamp)}
                                </div>
                                {event.updatedBy && (
                                    <div className="flex items-center gap-2 text-xs text-gray-400">
                                        <User size={12} />
                                        <span className="font-mono">By: {event.updatedBy.substring(0, 6)}...{event.updatedBy.substring(38)}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

Timeline.propTypes = {
    events: PropTypes.arrayOf(PropTypes.shape({
        location: PropTypes.string,
        timestamp: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        status: PropTypes.string,
        updatedBy: PropTypes.string,
        notes: PropTypes.string
    }))
};

export default Timeline;

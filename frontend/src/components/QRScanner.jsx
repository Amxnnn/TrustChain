import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { X, Camera } from 'lucide-react';
import toast from 'react-hot-toast';

/**
 * QRScanner Component
 * Opens a modal to scan QR codes using the device camera
 */
const QRScanner = ({ onScan, onError, onClose }) => {
    // We use a ref to prevent double rendering of the scanner in strict mode
    const scannerRef = useRef(null);
    const [initError, setInitError] = useState(null);

    useEffect(() => {
        // Small delay to ensure modal is rendered
        const timeoutId = setTimeout(() => {
            try {
                if (scannerRef.current) {
                    // Already initialized
                    return;
                }

                const scanner = new Html5QrcodeScanner(
                    "qr-reader",
                    {
                        fps: 10,
                        qrbox: { width: 250, height: 250 },
                        aspectRatio: 1.0,
                        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
                        showTorchButtonIfSupported: true
                    },
                /* verbose= */ false
                );

                scannerRef.current = scanner;

                const onScanSuccess = (decodedText) => {
                    // Stop scanning and cleanup
                    scanner.clear().then(() => {
                        onScan(decodedText);
                        onClose();
                    }).catch((err) => {
                        console.error("Failed to clear scanner", err);
                        onScan(decodedText);
                        onClose();
                    });
                };

                const onScanFailure = (errorMessage) => {
                    // handle scan failure, usually better to ignore frame errors
                    // onError(errorMessage); 
                };

                scanner.render(onScanSuccess, onScanFailure);

            } catch (error) {
                console.error("Error initializing scanner:", error);
                setInitError(error.message);
                toast.error("Failed to start camera");
            }
        }, 100);

        // Cleanup function
        return () => {
            clearTimeout(timeoutId);
            if (scannerRef.current) {
                scannerRef.current.clear().catch(error => {
                    console.error("Failed to clear html5-qrcode scanner during cleanup", error);
                });
                scannerRef.current = null;
            }
        };
    }, [onScan, onClose]);

    return (
        <div className="fixed inset-0 z-[100] bg-black bg-opacity-80 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative">
                {/* Header */}
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="flex items-center gap-2 font-semibold text-gray-800">
                        <Camera className="text-blue-600" size={20} />
                        Scan QR Code
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full hover:bg-gray-200 transition-colors text-gray-500"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Scanner Area */}
                <div className="p-0 bg-black min-h-[300px] flex items-center justify-center relative">
                    {initError ? (
                        <div className="text-white text-center p-6">
                            <p className="mb-4">Camera Error</p>
                            <p className="text-sm text-gray-400">{initError}</p>
                        </div>
                    ) : (
                        <div id="qr-reader" className="w-full h-full text-white"></div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 text-center bg-gray-50 border-t border-gray-100">
                    <p className="text-sm text-gray-500">
                        Position the QR code within the frame to scan
                    </p>
                </div>
            </div>
        </div>
    );
};

QRScanner.propTypes = {
    onScan: PropTypes.func.isRequired,
    onError: PropTypes.func,
    onClose: PropTypes.func.isRequired
};

export default QRScanner;

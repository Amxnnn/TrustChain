import React from 'react';
import PropTypes from 'prop-types';
import { QRCodeCanvas } from 'qrcode.react';
import { Download, Copy } from 'lucide-react';
import toast from 'react-hot-toast';

/**
 * QRCodeDisplay Component
 * Generates a QR code for a given value with download/copy options
 */
const QRCodeDisplay = ({ value, size = 200, includeDownload = true }) => {
    const downloadQR = () => {
        const canvas = document.querySelector('#qr-code-canvas');
        if (!canvas) return;

        const url = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `product-${value}.png`;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('QR Code downloaded!');
    };

    const copyValue = () => {
        navigator.clipboard.writeText(value);
        toast.success('Product ID copied to clipboard!');
    };

    return (
        <div className="flex flex-col items-center bg-[#111] p-8 rounded-3xl border border-white/10 shadow-xl w-fit mx-auto">
            <div className="bg-white p-4 rounded-xl mb-6 shadow-inner">
                <QRCodeCanvas
                    id="qr-code-canvas"
                    value={value}
                    size={size}
                    level={"H"}
                    includeMargin={false}
                />
            </div>

            <div className="flex flex-col items-center mb-6 w-full max-w-[280px]">
                <span className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-2">Product ID</span>
                <p className="font-mono text-sm text-white bg-white/5 px-4 py-3 rounded-lg border border-white/10 w-full break-all text-center">
                    {value}
                </p>
            </div>

            {includeDownload && (
                <div className="flex gap-4 w-full">
                    <button
                        onClick={downloadQR}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold text-black bg-[#ccff00] rounded-xl hover:opacity-90 transition-opacity"
                        title="Download QR Code"
                    >
                        <Download size={18} />
                        Download
                    </button>
                    <button
                        onClick={copyValue}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-white bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors"
                        title="Copy ID"
                    >
                        <Copy size={18} />
                        Copy
                    </button>
                </div>
            )}
        </div>
    );
};

QRCodeDisplay.propTypes = {
    value: PropTypes.string.isRequired,
    size: PropTypes.number,
    includeDownload: PropTypes.bool
};

export default QRCodeDisplay;

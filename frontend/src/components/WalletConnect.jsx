import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { Wallet, Loader2, Copy, LogOut, ExternalLink, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

const WalletConnect = () => {
    const {
        wallet,
        loading,
        error,
        connectWallet,
        disconnectWallet,
        switchNetwork
    } = useWallet();

    const [showDropdown, setShowDropdown] = useState(false);

    // Helpers
    const truncateAddress = (address) => {
        if (!address) return '';
        return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
    };

    const copyToClipboard = () => {
        if (wallet.address) {
            navigator.clipboard.writeText(wallet.address);
            toast.success('Address copied!');
        }
    };

    const isWrongNetwork = wallet.isConnected && wallet.chainId !== 11155111; // Sepolia check

    // Not Connected State
    if (!wallet.isConnected) {
        return (
            <div className="relative">
                <button
                    onClick={connectWallet}
                    disabled={loading}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-full font-medium transition-all shadow-md hover:shadow-lg disabled:opacity-70"
                >
                    {loading ? (
                        <Loader2 size={18} className="animate-spin" />
                    ) : (
                        <Wallet size={18} />
                    )}
                    {loading ? 'Connecting...' : 'Connect Wallet'}
                </button>
                {error && (
                    <div className="absolute top-full mt-2 right-0 w-64 p-3 bg-red-50 text-red-600 text-xs rounded-lg border border-red-100 shadow-xl z-50">
                        <p className="font-semibold mb-1">Connection Failed</p>
                        <p>{error}</p>
                    </div>
                )}
            </div>
        );
    }

    // Connected State
    return (
        <div className="relative">
            {/* Main Button */}
            <button
                onClick={() => setShowDropdown(!showDropdown)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                className={`flex items-center gap-3 px-4 py-2 rounded-full border transition-all shadow-sm
          ${isWrongNetwork
                        ? 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100'
                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
            >
                <div className={`w-2 h-2 rounded-full ${isWrongNetwork ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></div>
                <span className="font-mono font-medium">{truncateAddress(wallet.address)}</span>
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
                <div className="absolute top-full right-0 mt-3 w-72 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">

                    {/* Header */}
                    <div className="p-4 bg-gray-50 border-b border-gray-100">
                        <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Connected Wallet</p>
                        <div className="flex items-center justify-between">
                            <p className="font-mono font-bold text-gray-800">{truncateAddress(wallet.address)}</p>
                            <button onClick={copyToClipboard} className="text-gray-400 hover:text-blue-600 transition-colors p-1" title="Copy Address">
                                <Copy size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Network Warning */}
                    {isWrongNetwork && (
                        <div className="p-3 bg-red-50 border-b border-red-100 text-sm text-red-700">
                            <div className="flex items-center gap-2 mb-2 font-medium">
                                <AlertTriangle size={16} />
                                Wrong Network
                            </div>
                            <button
                                onClick={switchNetwork}
                                className="w-full py-1.5 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700 transition-colors"
                            >
                                Switch to Sepolia
                            </button>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="p-2">
                        <a
                            href={`https://sepolia.etherscan.io/address/${wallet.address}`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors text-sm"
                        >
                            <ExternalLink size={16} className="text-gray-400" />
                            View on Etherscan
                        </a>

                        <button
                            onClick={disconnectWallet}
                            className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-red-50 text-red-600 transition-colors text-sm font-medium"
                        >
                            <LogOut size={16} />
                            Disconnect
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WalletConnect;

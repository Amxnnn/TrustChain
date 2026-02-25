import React from 'react';
import { X, ExternalLink } from 'lucide-react';

const WalletModal = ({ isOpen, onClose, onConnect }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-md p-6 relative shadow-2xl shadow-black/50">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>

                <h2 className="text-2xl font-bold text-white mb-2 font-['Space_Grotesk']">Connect Wallet</h2>
                <p className="text-gray-400 text-sm mb-6">Select a wallet to connect to TrustChain</p>

                <div className="space-y-3">
                    {/* MetaMask Option */}
                    <button
                        onClick={() => onConnect('metamask')}
                        className="w-full bg-[#1a1a1a] hover:bg-[#252525] border border-white/10 hover:border-[#ccff00]/50 rounded-xl p-4 flex items-center justify-between transition-all group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center p-1">
                                <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" alt="MetaMask" className="w-full h-full object-contain" />
                            </div>
                            <div className="text-left">
                                <h3 className="text-white font-bold group-hover:text-[#ccff00] transition-colors">MetaMask</h3>
                                <p className="text-xs text-gray-500">Connect using browser extension</p>
                            </div>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-gray-400 group-hover:text-white group-hover:bg-[#ccff00]/20 transition-all">
                            <ExternalLink size={14} />
                        </div>
                    </button>

                    {/* Phantom Option */}
                    <button
                        onClick={() => onConnect('phantom')}
                        className="w-full bg-[#1a1a1a] hover:bg-[#252525] border border-white/10 hover:border-[#ccff00]/50 rounded-xl p-4 flex items-center justify-between transition-all group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-[#AB9FF2]/20 flex items-center justify-center p-1">
                                <img src="/images/Phantom-Icon_.png" alt="Phantom" className="w-full h-full object-contain" />
                            </div>
                            <div className="text-left">
                                <h3 className="text-white font-bold group-hover:text-[#ccff00] transition-colors">Phantom</h3>
                                <p className="text-xs text-gray-500">Connect using Phantom Wallet</p>
                            </div>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-gray-400 group-hover:text-white group-hover:bg-[#ccff00]/20 transition-all">
                            <ExternalLink size={14} />
                        </div>
                    </button>
                </div>

                <div className="mt-6 pt-4 border-t border-white/5 text-center">
                    <p className="text-xs text-gray-500">
                        By connecting your wallet, you agree to our Terms of Service and Privacy Policy.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default WalletModal;

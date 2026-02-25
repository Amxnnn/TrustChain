import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';
import { Wallet, Home, Package, RefreshCw, CheckCircle, LayoutDashboard } from 'lucide-react';
import WalletModal from './WalletModal';

const Navbar = () => {
    const { wallet, connectWallet, disconnectWallet } = useWallet();
    const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
    const location = useLocation();

    const handleConnect = async (walletType) => {
        setIsWalletModalOpen(false);
        try {
            await connectWallet(walletType);
        } catch (error) {
            console.error("Connection failed:", error);
        }
    };

    const formatAddress = (addr) => {
        return addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : '';
    };

    const isActive = (path) => location.pathname === path;

    return (
        <>
            <nav className="absolute top-0 left-0 w-full p-6 md:px-12 md:py-8 flex justify-between items-center z-50">
                <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
                    <Link to="/" className="text-3xl font-bold tracking-tighter text-white">
                        TrustChain
                    </Link>
                </div>

                <div className="hidden md:flex items-center gap-1 bg-white/5 backdrop-blur-md border border-white/10 px-2 py-2 rounded-full text-sm text-gray-300 font-medium absolute left-1/2 -translate-x-1/2 shadow-lg shadow-black/20 hover:border-white/20 transition-all">
                    <Link to="/" className={`flex items-center gap-2 px-5 py-2.5 rounded-full transition-all hover:scale-105 ${isActive('/') ? 'bg-white/10 text-white' : 'hover:bg-white/10 hover:text-white'}`}>
                        <Home size={16} /> Home
                    </Link>
                    <Link to="/register" className={`flex items-center gap-2 px-5 py-2.5 rounded-full transition-all hover:scale-105 ${isActive('/register') ? 'bg-white/10 text-white' : 'hover:bg-white/10 hover:text-white'}`}>
                        <Package size={16} /> Register
                    </Link>
                    <Link to="/update" className={`flex items-center gap-2 px-5 py-2.5 rounded-full transition-all hover:scale-105 ${isActive('/update') ? 'bg-white/10 text-white' : 'hover:bg-white/10 hover:text-white'}`}>
                        <RefreshCw size={16} /> Update
                    </Link>
                    <Link to="/verify" className={`flex items-center gap-2 px-5 py-2.5 rounded-full transition-all hover:scale-105 ${isActive('/verify') ? 'bg-white/10 text-white' : 'hover:bg-white/10 hover:text-white'}`}>
                        <CheckCircle size={16} /> Verify
                    </Link>
                    <Link to="/dashboard" className={`flex items-center gap-2 px-5 py-2.5 rounded-full transition-all hover:scale-105 ${isActive('/dashboard') ? 'bg-white/10 text-white' : 'hover:bg-white/10 hover:text-white'}`}>
                        <LayoutDashboard size={16} /> Dashboard
                    </Link>
                </div>

                {/* wallet button */}
                {wallet.isConnected ? (
                    <button
                        onClick={disconnectWallet}
                        className="flex items-center gap-2 bg-[#1a1a1a]/80 backdrop-blur-md border border-white/20 px-5 py-2.5 rounded-full font-mono text-sm text-[#ccff00] shadow-sm transform hover:scale-105 transition-transform cursor-pointer group hover:bg-[#ccff00]/10 hover:border-[#ccff00]/30"
                        title="Click to Disconnect"
                    >
                        <div className="w-2 h-2 rounded-full bg-[#ccff00] animate-pulse shadow-[0_0_10px_#ccff00] group-hover:bg-red-500 group-hover:shadow-[0_0_10px_#ef4444] transition-colors"></div>
                        <span className="group-hover:hidden">{formatAddress(wallet.address)}</span>
                        <span className="hidden group-hover:inline text-red-400">Disconnect</span>
                    </button>
                ) : (
                    <button onClick={() => setIsWalletModalOpen(true)} className="bg-[#ccff00] text-black pl-6 pr-2 py-2 rounded-full font-bold text-sm flex items-center gap-3 hover:bg-[#b3e600] transition-all group shadow-[0_0_20px_rgba(204,255,0,0.3)] hover:shadow-[0_0_30px_rgba(204,255,0,0.5)] active:scale-95">
                        Connect Wallet
                        <div className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center group-hover:rotate-45 transition-transform">
                            <Wallet size={18} />
                        </div>
                    </button>
                )}
            </nav>

            <WalletModal
                isOpen={isWalletModalOpen}
                onClose={() => setIsWalletModalOpen(false)}
                onConnect={handleConnect}
            />
        </>
    );
};

export default Navbar;

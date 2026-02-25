import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Package, MapPin, CheckCircle, LayoutDashboard, Menu, X, Box } from 'lucide-react';
import WalletConnect from './WalletConnect';

const Header = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const location = useLocation();
    const [scrolled, setScrolled] = useState(false);

    // Check scroll position for styling
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile menu when route changes
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [location.pathname]);

    const navLinks = [
        { path: '/', label: 'Home', icon: Home },
        { path: '/register', label: 'Register', icon: Package },
        { path: '/update', label: 'Update', icon: MapPin },
        { path: '/verify', label: 'Verify', icon: CheckCircle },
        { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ];

    const isActive = (path) => {
        if (path === '/' && location.pathname !== '/') return false;
        return location.pathname.startsWith(path);
    };

    return (
        <header
            className={`sticky top-0 z-50 transition-all duration-300 ${scrolled || mobileMenuOpen
                    ? 'bg-white/90 backdrop-blur-lg shadow-sm pt-2 pb-2 supports-[backdrop-filter]:bg-white/60'
                    : 'bg-transparent pt-4 pb-4'
                }`}
        >
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center">

                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="bg-gradient-to-br from-blue-600 to-purple-600 text-white p-2 rounded-lg group-hover:shadow-lg transition-all duration-300">
                            <Box size={24} />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-bold text-xl tracking-tight text-gray-900 leading-none">TrustChain</span>
                            <span className="text-[10px] font-semibold tracking-widest text-blue-600 uppercase">Decentralized</span>
                        </div>
                    </Link>

                    <nav className="hidden md:flex items-center gap-1 bg-gray-100/50 p-1 rounded-full backdrop-blur-sm border border-white/20">
                        {navLinks.map((link) => {
                            const Icon = link.icon;
                            const active = isActive(link.path);

                            return (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
                    ${active
                                            ? 'bg-white text-blue-600 shadow-sm'
                                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/50'
                                        }`}
                                >
                                    <Icon size={16} />
                                    {link.label}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="flex items-center gap-3">
                        <div className="hidden md:block">
                            <WalletConnect />
                        </div>
                        <button
                            className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            aria-label="Toggle menu"
                        >
                            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>
            {mobileMenuOpen && (
                <div className="absolute top-full left-0 w-full bg-white border-b border-gray-100 shadow-xl md:hidden animate-in slide-in-from-top-2">
                    <div className="container mx-auto px-4 py-4 space-y-4">
                        <nav className="flex flex-col gap-2">
                            {navLinks.map((link) => {
                                const Icon = link.icon;
                                const active = isActive(link.path);
                                return (
                                    <Link
                                        key={link.path}
                                        to={link.path}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors
                                ${active
                                                ? 'bg-blue-50 text-blue-600'
                                                : 'text-gray-600 hover:bg-gray-50'
                                            }`}
                                    >
                                        <Icon size={20} />
                                        <span className="font-medium">{link.label}</span>
                                    </Link>
                                );
                            })}
                        </nav>

                        <div className="pt-4 border-t border-gray-100">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Wallet Connection</p>
                            <WalletConnect />
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;

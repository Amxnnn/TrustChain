import React, { useState, useEffect } from 'react';
import { useWallet } from '../context/WalletContext';
import { fetchFromIPFS } from '../utils/ipfs';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import { LayoutDashboard, ArrowUpRight, Box, Clock, MapPin, Eye, Edit } from 'lucide-react';

const Dashboard = () => {
    const { wallet, contract } = useWallet();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (wallet.isConnected && contract) {
            fetchUserProducts();
        }
    }, [wallet.isConnected, contract]);

    const fetchUserProducts = async () => {
        try {
            setLoading(true);
            const filter = contract.filters.ProductCreated(null, null, wallet.address);
            const events = await contract.queryFilter(filter);
            events.sort((a, b) => b.blockNumber - a.blockNumber);

            const productList = events.map(event => ({
                id: event.args.id.toString(),
                ipfsHash: event.args.ipfsHash,
                timestamp: Number(event.args.timestamp)
            }));

            const detailedProducts = await Promise.all(
                productList.map(async (p) => {
                    try {
                        const metadata = await fetchFromIPFS(p.ipfsHash);
                        return { ...p, ...metadata };
                    } catch {
                        return { ...p, name: 'Failed to load name' };
                    }
                })
            );

            setProducts(detailedProducts);

        } catch (err) {
            console.error(err);
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    if (!wallet.isConnected) {
        return (
            <div className="min-h-screen bg-[#050505] text-white font-['Space_Grotesk']">
                <Navbar />
                <div className="flex flex-col items-center justify-center h-[80vh] text-center px-4">
                    <div className="w-20 h-20 bg-[#1a1a1a] rounded-full flex items-center justify-center mb-6">
                        <LayoutDashboard size={40} className="text-gray-600" />
                    </div>
                    <h2 className="text-3xl font-bold mb-4">Connect Your Wallet</h2>
                    <p className="text-gray-400 mb-8 max-w-md">Connect your wallet to access your dashboard and manage your registered products.</p>
                    <button
                        onClick={() => document.getElementById('navbar-connect-btn')?.click()} // Fallback if user doesn't use navbar
                        className="bg-[#ccff00] text-black px-8 py-3 rounded-full font-bold hover:opacity-90 transition-opacity"
                    >
                        Connect Now
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white font-['Space_Grotesk']">
            <Navbar />

            <div className="container mx-auto px-4 pt-32 pb-20 max-w-6xl">
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                    <div>
                        <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
                        <p className="text-gray-400">Manage your supply chain portfolio and track product lifecycles.</p>
                    </div>
                    <Link to="/register" className="bg-[#ccff00] text-black px-6 py-3 rounded-full font-bold hover:opacity-90 transition-opacity flex items-center gap-2 shadow-[0_0_20px_rgba(204,255,0,0.2)]">
                        Register New Product <ArrowUpRight size={20} />
                    </Link>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="bg-[#0a0a0a] border border-white/10 p-6 rounded-3xl relative overflow-hidden group hover:border-[#ccff00]/30 transition-colors">
                        <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Box size={100} />
                        </div>
                        <h3 className="text-gray-400 font-medium mb-1">Total Products</h3>
                        <p className="text-4xl font-bold text-white">{products.length}</p>
                    </div>
                    {/* Placeholder stats for layout visual balance */}
                    <div className="bg-[#0a0a0a] border border-white/10 p-6 rounded-3xl relative overflow-hidden group hover:border-[#ccff00]/30 transition-colors hidden md:block">
                        <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Clock size={100} />
                        </div>
                        <h3 className="text-gray-400 font-medium mb-1">Recent Activity</h3>
                        <p className="text-4xl font-bold text-white">Active</p>
                    </div>
                    <div className="bg-[#0a0a0a] border border-white/10 p-6 rounded-3xl relative overflow-hidden group hover:border-[#ccff00]/30 transition-colors hidden md:block">
                        <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                            <MapPin size={100} />
                        </div>
                        <h3 className="text-gray-400 font-medium mb-1">Network Status</h3>
                        <p className="text-4xl font-bold text-[#ccff00]">Sepolia</p>
                    </div>
                </div>

                <h2 className="text-2xl font-bold mb-6 text-white border-b border-white/5 pb-4">Your Inventory</h2>

                {loading ? (
                    <div className="py-20 flex justify-center">
                        <LoadingSpinner />
                    </div>
                ) : (
                    <>
                        {products.length === 0 ? (
                            <div className="bg-[#0a0a0a] border border-dashed border-white/10 rounded-3xl p-16 text-center">
                                <Box size={48} className="mx-auto text-gray-600 mb-4 opacity-50" />
                                <h3 className="text-xl font-bold text-white mb-2">No Products Found</h3>
                                <p className="text-gray-400 mb-8">You haven't registered any products on the blockchain yet.</p>
                                <Link to="/register" className="inline-block bg-white/10 text-white px-8 py-3 rounded-full font-bold hover:bg-white/20 transition-colors">
                                    Create First Product
                                </Link>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {products.map(p => (
                                    <div key={p.id} className="bg-[#0a0a0a] p-6 rounded-2xl border border-white/5 hover:border-[#ccff00]/30 transition-all hover:translate-x-1 group flex flex-col md:flex-row justify-between items-center gap-6">
                                        <div className="flex items-center gap-6 w-full md:w-auto">
                                            {p.images && p.images[0] ? (
                                                <img src={p.images[0]} alt="" className="w-16 h-16 rounded-xl object-cover bg-white/5" />
                                            ) : (
                                                <div className="w-16 h-16 rounded-xl bg-white/5 flex items-center justify-center text-gray-600">
                                                    <Box size={24} />
                                                </div>
                                            )}

                                            <div>
                                                <div className="flex items-center gap-3 mb-1">
                                                    <span className="bg-[#ccff00]/10 text-[#ccff00] text-xs font-bold px-2 py-1 rounded-md font-mono">#{p.id}</span>
                                                    <h3 className="font-bold text-lg text-white group-hover:text-[#ccff00] transition-colors">{p.name || 'Unknown Product'}</h3>
                                                </div>
                                                <div className="flex flex-col md:flex-row gap-1 md:gap-4 text-sm text-gray-500">
                                                    <span className="flex items-center gap-1"><Clock size={12} /> {new Date(p.timestamp * 1000).toLocaleDateString()}</span>
                                                    <span className="flex items-center gap-1"><MapPin size={12} /> {p.origin}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex gap-3 w-full md:w-auto">
                                            <Link
                                                to={`/update`} // Ideally specific ID, but page logic uses search
                                                className="flex-1 md:flex-none px-6 py-2 border border-white/10 rounded-full text-sm font-medium hover:bg-white/5 transition-colors flex items-center justify-center gap-2"
                                            >
                                                <Edit size={14} /> Update
                                            </Link>
                                            <Link
                                                to={`/verify/${p.id}`}
                                                className="flex-1 md:flex-none px-6 py-2 bg-white text-black border border-white rounded-full text-sm font-bold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                                            >
                                                <Eye size={14} /> View
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Dashboard;

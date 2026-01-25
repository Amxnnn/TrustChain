import React, { useState, useEffect } from 'react';
import { useWallet } from '../context/WalletContext';
import { ethers } from 'ethers';
import { getProductDetails, getProductUpdateCount, getProductUpdate, getContract } from '../utils/contract';
import { fetchFromIPFS } from '../utils/ipfs';
import { toast } from 'react-hot-toast';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import { CheckCircle, Search, MapPin, Calendar, Box, Truck, User } from 'lucide-react';

const VerifyProduct = () => {
    const { provider } = useWallet();
    const { id } = useParams();
    const [productId, setProductId] = useState(id || '');

    const [product, setProduct] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Auto-verify if ID is in URL and provider is ready
    useEffect(() => {
        if (provider && id) {
            handleVerify(id);
        }
    }, [provider, id]);

    const handleVerify = async (searchId = productId) => {
        if (!searchId) return;

        // Ensure ID is a clean string
        const cleanId = searchId.toString().trim();

        if (!provider) {
            toast.error("Please connect your wallet to verify products.");
            return;
        }

        try {
            setLoading(true);
            setError(null);
            setProduct(null);
            setHistory([]);

            console.log("Verifying ID:", cleanId);

            const contract = getContract(provider);
            const details = await getProductDetails(cleanId, provider);
            console.log("Details fetched:", details);

            const metadata = await fetchFromIPFS(details.ipfsHash);
            console.log("Metadata fetched:", metadata);

            setProduct({
                id: cleanId,
                ...metadata,
                manufacturer: details.manufacturer,
                timestamp: details.timestamp,
                ipfsHash: details.ipfsHash
            });

            const count = await getProductUpdateCount(cleanId, provider);
            console.log("Update count:", count);

            const updates = [];

            for (let i = 0; i < count; i++) {
                const updateHash = await getProductUpdate(cleanId, i, provider);
                const updateData = await fetchFromIPFS(updateHash);
                if (updateData) {
                    updates.push(updateData);
                }
            }

            updates.sort((a, b) => b.timestamp - a.timestamp);
            setHistory(updates);

        } catch (err) {
            console.error("Verification Error:", err);
            setError(`Verification failed: ${err.message || "Product not found"}`);
            toast.error('Verification failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white font-['Space_Grotesk']">
            <Navbar />

            <div className="container mx-auto px-4 pt-40 pb-20 max-w-4xl">
                <div className="mb-12 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">Verify Authenticity</h1>
                    <p className="text-gray-400 text-lg">Trace the full lifecycle of any product on the blockchain.</p>
                </div>

                {/* Search Bar */}
                <div className="max-w-xl mx-auto flex gap-4 mb-16">
                    <div className="relative flex-1">
                        <input
                            type="text"
                            placeholder="Enter Product ID to Verify"
                            className="w-full h-16 pl-12 pr-4 bg-[#0a0a0a] rounded-2xl border border-white/10 text-white focus:border-[#ccff00] focus:ring-1 focus:ring-[#ccff00] outline-none text-lg transition-all"
                            value={productId}
                            onChange={(e) => setProductId(e.target.value)}
                        />
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                            <Search size={20} />
                        </div>
                    </div>
                    <button
                        onClick={() => handleVerify(productId)}
                        disabled={loading || !productId}
                        className="h-16 bg-[#ccff00] text-black px-8 rounded-2xl font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(204,255,0,0.3)] min-w-[140px] flex justify-center items-center"
                    >
                        {loading ? <LoadingSpinner size="sm" color="text-black" /> : 'Verify'}
                    </button>
                </div>

                {error && (
                    <div className="max-w-xl mx-auto bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-center mb-8">
                        {error}
                    </div>
                )}

                {/* Product Content */}
                {product && (
                    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">

                        {/* Status Badge */}
                        <div className="flex justify-center mb-8">
                            <div className="bg-green-500/10 text-green-400 border border-green-500/20 px-6 py-2 rounded-full flex items-center gap-2 font-bold uppercase tracking-wide text-sm shadow-[0_0_20px_rgba(34,197,94,0.1)]">
                                <CheckCircle size={18} /> Authentic Blockchain Record
                            </div>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8 mb-12">
                            {/* Main Details Card */}
                            <div className="md:col-span-2 bg-[#0a0a0a] rounded-3xl border border-white/10 overflow-hidden shadow-2xl group hover:border-[#ccff00]/30 transition-colors">
                                <div className="p-8 border-b border-white/5 bg-gradient-to-br from-[#111] to-[#0a0a0a]">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h2 className="text-3xl font-bold text-white mb-2">{product.name}</h2>
                                            <p className="text-[#ccff00] font-mono">ID: #{product.id}</p>
                                        </div>
                                        {/* Optional Category Badge */}
                                        <div className="bg-[#222] px-3 py-1 rounded-lg text-xs text-gray-400 font-bold uppercase">{product.category}</div>
                                    </div>
                                </div>
                                <div className="p-8 space-y-6">
                                    <div>
                                        <span className="text-gray-500 text-xs uppercase tracking-widest font-bold flex items-center gap-2 mb-2">
                                            <Box size={14} /> Description
                                        </span>
                                        <p className="text-gray-300 leading-relaxed">{product.description || 'No description provided.'}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-8">
                                        <div>
                                            <span className="text-gray-500 text-xs uppercase tracking-widest font-bold flex items-center gap-2 mb-2">
                                                <MapPin size={14} /> Origin
                                            </span>
                                            <p className="text-white font-medium">{product.origin}</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 text-xs uppercase tracking-widest font-bold flex items-center gap-2 mb-2">
                                                <Calendar size={14} /> Registered On
                                            </span>
                                            <p className="text-white font-medium">{new Date(product.timestamp * 1000).toLocaleDateString()}</p>
                                        </div>
                                    </div>

                                    <div>
                                        <span className="text-gray-500 text-xs uppercase tracking-widest font-bold flex items-center gap-2 mb-2">
                                            <User size={14} /> Manufacturer
                                        </span>
                                        <div className="bg-[#111] p-3 rounded-xl border border-white/5 font-mono text-xs text-gray-400 break-all hover:text-white transition-colors">
                                            {product.manufacturer}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Sidebar / Images */}
                            <div className="space-y-6">
                                {product.images && product.images.length > 0 ? (
                                    <div className="bg-[#0a0a0a] p-2 rounded-3xl border border-white/10 shadow-lg">
                                        <img src={product.images[0]} alt="Product" className="w-full aspect-square object-cover rounded-2xl" />
                                    </div>
                                ) : (
                                    <div className="bg-[#0a0a0a] rounded-3xl border border-white/10 flex flex-col items-center justify-center aspect-square text-gray-600">
                                        <Box size={40} className="mb-2 opacity-50" />
                                        <p className="text-sm font-medium">No Image</p>
                                    </div>
                                )}

                                <div className="bg-[#0a0a0a] p-6 rounded-3xl border border-white/10">
                                    <h3 className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-4">Verification Stats</h3>
                                    <div className="flex justify-between items-center py-2 border-b border-white/5">
                                        <span className="text-gray-500 text-sm">Updates</span>
                                        <span className="text-white font-mono">{history.length}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2">
                                        <span className="text-gray-500 text-sm">Status</span>
                                        <span className="text-[#ccff00] text-sm">Active</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Timeline */}
                        <div className="max-w-3xl mx-auto">
                            <h3 className="text-2xl font-bold mb-8 text-white flex items-center gap-3">
                                <Truck className="text-[#ccff00]" /> Journey History
                            </h3>

                            {history.length === 0 ? (
                                <div className="bg-[#111] p-8 rounded-2xl border border-dashed border-white/10 text-center text-gray-500">
                                    No journey updates recorded yet. Product is at origin.
                                </div>
                            ) : (
                                <div className="border-l-2 border-[#ccff00]/20 ml-6 space-y-10 pl-8 pb-4">
                                    {history.map((update, idx) => (
                                        <div key={idx} className="relative group">
                                            {/* Dot */}
                                            <div className="absolute -left-[41px] top-1 w-5 h-5 rounded-full bg-[#050505] border-4 border-[#ccff00] shadow-[0_0_10px_#ccff00] group-hover:scale-110 transition-transform"></div>

                                            <div className="bg-[#0a0a0a] p-6 rounded-2xl border border-white/10 hover:border-[#ccff00]/30 transition-all hover:-translate-y-1 shadow-lg">
                                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4">
                                                    <div>
                                                        <h4 className="text-lg font-bold text-white mb-1">{update.location}</h4>
                                                        <span className="text-xs text-gray-500 font-mono">
                                                            {new Date(update.timestamp).toLocaleString()}
                                                        </span>
                                                    </div>
                                                    <span className={`mt-2 sm:mt-0 inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border 
                                                    ${update.status === 'Delivered' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-[#ccff00]/10 text-[#ccff00] border-[#ccff00]/20'}`}>
                                                        {update.status}
                                                    </span>
                                                </div>

                                                {update.notes && (
                                                    <div className="bg-[#111] p-4 rounded-xl text-gray-300 text-sm mb-4 border border-white/5 italic">
                                                        "{update.notes}"
                                                    </div>
                                                )}

                                                <div className="flex items-center gap-2 text-xs text-gray-600 font-mono">
                                                    <User size={12} />
                                                    Updated by: <span className="text-gray-500 truncate max-w-[200px]">{update.updatedBy}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VerifyProduct;

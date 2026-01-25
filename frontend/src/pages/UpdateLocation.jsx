import React, { useState, useEffect } from 'react';
import { useWallet } from '../context/WalletContext';
import { getProductDetails, updateProduct } from '../utils/contract';
import { fetchFromIPFS, uploadUpdateToIPFS } from '../utils/ipfs';
import { toast } from 'react-hot-toast';
import { STATUS_OPTIONS } from '../utils/constants';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import { RefreshCw, MapPin, FileText, Activity, AlertTriangle, ArrowRight, Search, Package } from 'lucide-react';

const UpdateLocation = () => {
    const { wallet, signer, isStakeholder, provider } = useWallet();
    const [productId, setProductId] = useState('');
    const [currentProduct, setCurrentProduct] = useState(null);
    const [location, setLocation] = useState('');
    const [status, setStatus] = useState('In Transit');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [processing, setProcessing] = useState(false);

    // Initial check but render styling regardless
    const accessDenied = wallet.isConnected && !isStakeholder;

    const fetchProduct = async () => {
        if (!productId) return;
        setLoading(true);
        setCurrentProduct(null);
        try {
            const { ipfsHash, manufacturer } = await getProductDetails(productId, provider);
            const data = await fetchFromIPFS(ipfsHash);

            if (data) {
                setCurrentProduct({
                    id: productId,
                    ...data,
                    manufacturer
                });
            } else {
                toast.error("Failed to load product metadata");
            }
        } catch (error) {
            console.error("Error fetching product:", error);
            toast.error("Product not found or error loading");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!wallet.isConnected || !signer) {
            toast.error("Please connect wallet");
            return;
        }

        try {
            setProcessing(true);
            const updateData = {
                location: location,
                status: status,
                notes: notes,
                timestamp: Date.now(),
                updatedBy: wallet.address
            };

            const ipfsHash = await uploadUpdateToIPFS(updateData);
            console.log("Update IPFS Hash:", ipfsHash);

            const { txHash } = await updateProduct(productId, ipfsHash, signer);

            toast.success("Location updated successfully!");
            console.log("Tx Hash:", txHash);

            setLocation('');
            setNotes('');
            setStatus('In Transit');

        } catch (error) {
            console.error("Update failed:", error);
            toast.error(error.message || "Failed to update location");
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white font-['Space_Grotesk']">
            <Navbar />

            <div className="container mx-auto px-4 pt-40 pb-20 max-w-2xl">
                <div className="mb-10 text-center">
                    <h1 className="text-4xl font-bold mb-4 tracking-tight">Update Status</h1>
                    <p className="text-gray-400">Record a new location or status change on the blockchain.</p>
                </div>

                {accessDenied && (
                    <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-2xl mb-8 flex items-center gap-4 text-red-400">
                        <AlertTriangle size={24} />
                        <div>
                            <h3 className="font-bold text-white">Access Restricted</h3>
                            <p className="text-sm">Only authorized stakeholders can update product status.</p>
                        </div>
                    </div>
                )}

                <div className="bg-[#0a0a0a] rounded-3xl border border-white/10 overflow-hidden shadow-2xl p-8 space-y-8">
                    {/* Search Section */}
                    {!currentProduct && (
                        <div className="space-y-4">
                            <label className="block text-sm font-medium text-gray-400">Enter Product ID</label>
                            <div className="flex gap-4">
                                <div className="relative flex-1">
                                    <input
                                        type="text"
                                        className="w-full h-14 pl-12 pr-4 bg-[#111] rounded-xl border border-white/10 text-white focus:border-[#ccff00] focus:ring-1 focus:ring-[#ccff00] transition-all outline-none placeholder:text-gray-600"
                                        placeholder="Product ID..."
                                        value={productId}
                                        onChange={(e) => setProductId(e.target.value)}
                                    />
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                                        <Search size={18} />
                                    </div>
                                </div>
                                <button
                                    onClick={fetchProduct}
                                    disabled={loading || !productId}
                                    className="h-14 bg-[#ccff00] text-black px-6 rounded-xl font-bold hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-2"
                                >
                                    {loading ? <LoadingSpinner size="sm" color="text-black" /> : 'Load'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Product Summary Card */}
                    {currentProduct && (
                        <div className="bg-[#111] p-6 rounded-2xl border border-white/5 flex items-center justify-between gap-4 mb-6 relative group">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-[#ccff00]/10 flex items-center justify-center text-[#ccff00] shrink-0">
                                    <Package size={24} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-3">
                                        <h3 className="font-bold text-lg text-white">{currentProduct.name}</h3>
                                        <span className="inline-block px-2 py-0.5 bg-white/10 text-white text-xs rounded font-mono truncate max-w-[200px]" title={currentProduct.id}>#{currentProduct.id}</span>
                                    </div>
                                    <p className="text-gray-400 text-sm">{currentProduct.origin}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setCurrentProduct(null)}
                                className="text-gray-500 hover:text-white transition-colors text-sm underline"
                            >
                                Change
                            </button>
                        </div>
                    )}

                    {/* Update Form */}
                    <form onSubmit={handleSubmit} className={`space-y-6 ${currentProduct ? "opacity-100" : "opacity-30 pointer-events-none blur-sm select-none"}`}>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                                <MapPin size={16} className="text-[#ccff00]" /> New Location
                            </label>
                            <input
                                className="w-full px-4 py-3 bg-[#111] rounded-xl border border-white/10 text-white focus:border-[#ccff00] focus:ring-1 focus:ring-[#ccff00] transition-all outline-none placeholder:text-gray-600"
                                placeholder="e.g. Distribution Center, NY"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                                <Activity size={16} className="text-[#ccff00]" /> Status
                            </label>
                            <div className="relative">
                                <select
                                    className="w-full px-4 py-3 bg-[#111] rounded-xl border border-white/10 text-white focus:border-[#ccff00] focus:ring-1 focus:ring-[#ccff00] transition-all outline-none appearance-none cursor-pointer"
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                >
                                    {STATUS_OPTIONS.map(opt => (
                                        <option key={opt.value} value={opt.value} className="bg-[#111]">{opt.label}</option>
                                    ))}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                                    <RefreshCw size={16} />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                                <FileText size={16} className="text-[#ccff00]" /> Notes (Optional)
                            </label>
                            <textarea
                                className="w-full px-4 py-3 bg-[#111] rounded-xl border border-white/10 text-white focus:border-[#ccff00] focus:ring-1 focus:ring-[#ccff00] transition-all outline-none placeholder:text-gray-600 resize-none"
                                placeholder="Any additional comments..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                rows={3}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={processing || !currentProduct || accessDenied}
                            className="w-full bg-[#ccff00] text-black py-4 rounded-xl font-bold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_20px_rgba(204,255,0,0.2)] flex items-center justify-center gap-2"
                        >
                            {processing ? (
                                <>
                                    <LoadingSpinner size="sm" color="text-black" />
                                    <span>Updating Blockchain...</span>
                                </>
                            ) : (
                                <>
                                    Update Location <ArrowRight size={20} />
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default UpdateLocation;

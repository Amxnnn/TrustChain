import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';
import { uploadProductToIPFS } from '../utils/ipfs';
import { createProduct } from '../utils/contract';
import toast from 'react-hot-toast';
import QRCodeDisplay from '../components/QRCodeDisplay';
import LoadingSpinner from '../components/LoadingSpinner';
import { Package, Upload, CheckCircle, ArrowRight, AlertTriangle, X, ChevronRight } from 'lucide-react';
import { CATEGORY_OPTIONS } from '../utils/constants';
import Navbar from '../components/Navbar';

const RegisterProduct = () => {
    const { wallet, signer, isStakeholder } = useWallet();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        origin: '',
        description: '',
        category: 'Electronics',
        images: []
    });

    const [loading, setLoading] = useState(false);
    const [uploadStep, setUploadStep] = useState(null); // 'ipfs' | 'blockchain' | 'confirming'
    const [success, setSuccess] = useState(null);
    const [errors, setErrors] = useState({});
    const [imageFiles, setImageFiles] = useState([]);

    // Redirect if not connected
    useEffect(() => {
        if (!wallet.isConnected) {
            toast.error('Please connect your wallet');
            navigate('/');
        }
    }, [wallet.isConnected, navigate]);

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name || formData.name.length < 3) {
            newErrors.name = 'Product name must be at least 3 characters';
        }
        if (!formData.origin || formData.origin.length < 3) {
            newErrors.origin = 'Origin must be at least 3 characters';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        const MAX_IMAGES = 5;
        const MAX_SIZE = 5 * 1024 * 1024; // 5MB

        if (files.length + imageFiles.length > MAX_IMAGES) {
            toast.error(`Maximum ${MAX_IMAGES} images allowed`);
            return;
        }

        const validFiles = files.filter(file => {
            if (file.size > MAX_SIZE) {
                toast.error(`${file.name} is too large (max 5MB)`);
                return false;
            }
            return true;
        });

        setImageFiles(prev => [...prev, ...validFiles]);
        const newPreviews = validFiles.map(file => URL.createObjectURL(file));
        setFormData(prev => ({
            ...prev,
            images: [...prev.images, ...newPreviews]
        }));
    };

    const removeImage = (index) => {
        URL.revokeObjectURL(formData.images[index]);
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
        setImageFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            toast.error('Please fix form errors');
            return;
        }

        try {
            setLoading(true);
            setUploadStep('ipfs');

            const productData = {
                name: formData.name,
                origin: formData.origin,
                description: formData.description,
                category: formData.category,
                manufacturer: wallet.address,
                timestamp: Math.floor(Date.now() / 1000),
                images: []
            };

            const ipfsHash = await uploadProductToIPFS(productData);
            console.log('IPFS Hash:', ipfsHash);

            setUploadStep('blockchain');
            const { productId, txHash } = await createProduct(ipfsHash, signer);

            setSuccess({ productId, txHash, ipfsHash });
            toast.success('Product registered successfully!');

        } catch (error) {
            console.error('Registration error:', error);
            toast.error(error.message || 'Failed to register product');
        } finally {
            setLoading(false);
            setUploadStep(null);
        }
    };

    const getLoadingText = () => {
        switch (uploadStep) {
            case 'ipfs': return 'Uploading metadata to IPFS...';
            case 'blockchain': return 'Awaiting wallet signature...';
            default: return 'Processing...';
        }
    };

    // --- SUCCESS VIEW ---
    if (success) {
        return (
            <div className="min-h-screen bg-[#050505] text-white font-['Space_Grotesk']">
                <Navbar />
                <div className="container mx-auto px-4 pt-32 pb-20 max-w-2xl animate-in fade-in zoom-in duration-300">
                    <div className="bg-[#0a0a0a] rounded-3xl p-8 border border-[#ccff00]/20 text-center relative overflow-hidden shadow-[0_0_50px_rgba(204,255,0,0.05)]">
                        <div className="w-20 h-20 bg-[#ccff00]/10 text-[#ccff00] rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_rgba(204,255,0,0.2)]">
                            <CheckCircle size={40} />
                        </div>

                        <h2 className="text-3xl font-bold mb-2 text-white">Registration Successful!</h2>
                        <p className="text-gray-400 mb-8 max-w-md mx-auto">Your product has been securely recorded on the blockchain.</p>

                        <div className="bg-[#111] p-6 rounded-2xl border border-white/5 mb-8 flex flex-col items-center">
                            <QRCodeDisplay value={success.productId.toString()} size={160} />
                        </div>

                        <div className="space-y-3">
                            <a
                                href={`https://sepolia.etherscan.io/tx/${success.txHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block w-full py-3 bg-[#ccff00] text-black rounded-full font-bold hover:opacity-90 transition-opacity"
                            >
                                View on Etherscan
                            </a>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => navigate(`/verify`)}
                                    className="py-3 bg-[#1a1a1a] text-white border border-white/10 rounded-full font-medium hover:bg-white/5 transition-colors"
                                >
                                    View Details
                                </button>
                                <button
                                    onClick={() => {
                                        setSuccess(null);
                                        setFormData({ name: '', origin: '', description: '', category: 'Electronics', images: [] });
                                        setImageFiles([]);
                                    }}
                                    className="py-3 bg-transparent border border-white/10 text-white rounded-full font-medium hover:bg-white/5 transition-colors"
                                >
                                    Register Another
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white font-['Space_Grotesk']">
            <Navbar />

            <div className="container mx-auto px-4 pt-40 pb-20 max-w-3xl">
                <div className="mb-10 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">Register New Product</h1>
                    <p className="text-gray-400 text-lg">Create a permanent, immutable record on the blockchain.</p>
                </div>

                <form onSubmit={handleSubmit} className="bg-[#0a0a0a] rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
                    <div className="p-8 md:p-10 space-y-8">
                        {/* Section Header */}
                        <div className="flex items-center gap-3 pb-6 border-b border-white/5">
                            <div className="w-10 h-10 rounded-full bg-[#ccff00]/10 flex items-center justify-center text-[#ccff00]">
                                <Package size={20} />
                            </div>
                            <h2 className="text-xl font-bold text-white">Product Details</h2>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Product Name <span className="text-[#ccff00]">*</span></label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="e.g. iPhone 15 Pro"
                                    className={`w-full px-4 py-3 bg-[#111] rounded-xl border ${errors.name ? 'border-red-500/50' : 'border-white/10'} text-white focus:border-[#ccff00] focus:ring-1 focus:ring-[#ccff00] transition-all outline-none placeholder:text-gray-600`}
                                />
                                {errors.name && <p className="text-red-400 text-xs mt-1 ml-1">{errors.name}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Category <span className="text-[#ccff00]">*</span></label>
                                <div className="relative">
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-[#111] rounded-xl border border-white/10 text-white focus:border-[#ccff00] focus:ring-1 focus:ring-[#ccff00] transition-all outline-none appearance-none cursor-pointer"
                                    >
                                        {CATEGORY_OPTIONS.map(opt => (
                                            <option key={opt} value={opt} className="bg-[#111] text-white py-2">{opt}</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                                        <ChevronRight size={16} className="rotate-90" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Manufacturing Location <span className="text-[#ccff00]">*</span></label>
                            <input
                                type="text"
                                name="origin"
                                value={formData.origin}
                                onChange={handleInputChange}
                                placeholder="e.g. Foxconn Facility, Shenzhen, China"
                                className={`w-full px-4 py-3 bg-[#111] rounded-xl border ${errors.origin ? 'border-red-500/50' : 'border-white/10'} text-white focus:border-[#ccff00] focus:ring-1 focus:ring-[#ccff00] transition-all outline-none placeholder:text-gray-600`}
                            />
                            {errors.origin && <p className="text-red-400 text-xs mt-1 ml-1">{errors.origin}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Description (Optional)</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows="4"
                                maxLength={500}
                                placeholder="Add detailed product specifications..."
                                className="w-full px-4 py-3 bg-[#111] rounded-xl border border-white/10 text-white focus:border-[#ccff00] focus:ring-1 focus:ring-[#ccff00] transition-all outline-none resize-none placeholder:text-gray-600"
                            ></textarea>
                            <div className="text-right text-xs text-gray-500 mt-2">
                                {formData.description.length}/500
                            </div>
                        </div>

                        {/* Media Section */}
                        <div className="space-y-4 pt-6 border-t border-white/5">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                <Upload size={18} className="text-[#ccff00]" />
                                Product Images
                            </h2>

                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                {formData.images.map((src, index) => (
                                    <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-white/10 group">
                                        <img src={src} alt="Preview" className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(index)}
                                            className="absolute top-1 right-1 bg-red-500/80 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
                                        >
                                            <X size={12} />
                                        </button>
                                    </div>
                                ))}

                                {formData.images.length < 5 && (
                                    <label className="aspect-square flex flex-col items-center justify-center border border-dashed border-white/20 rounded-xl cursor-pointer hover:border-[#ccff00]/50 hover:bg-[#ccff00]/5 transition-all bg-[#0f0f0f]">
                                        <div className="w-8 h-8 rounded-full bg-[#ccff00]/10 text-[#ccff00] flex items-center justify-center mb-2">
                                            <Upload size={16} />
                                        </div>
                                        <span className="text-xs font-medium text-gray-400">Upload</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            onChange={handleImageUpload}
                                            className="hidden"
                                        />
                                    </label>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-8 bg-[#111] border-t border-white/5 flex items-center justify-end gap-6">
                        <button
                            type="button"
                            onClick={() => navigate('/')}
                            className="font-medium text-gray-400 hover:text-white transition-colors"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className="h-12 px-8 bg-[#ccff00] hover:opacity-90 text-black rounded-full font-bold shadow-[0_0_20px_rgba(204,255,0,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <LoadingSpinner size="sm" color="text-black" />
                                    <span>{getLoadingText()}</span>
                                </>
                            ) : (
                                <>
                                    Register Product <ArrowRight size={20} />
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RegisterProduct;

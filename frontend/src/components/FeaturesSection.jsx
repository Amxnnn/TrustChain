import React from 'react';
import { Scan } from 'lucide-react';

const FeatureCard = ({ title, description }) => {
    return (
        <div className="relative bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 flex flex-col justify-end h-[320px] overflow-hidden group hover:border-[#ccff00]/30 transition-colors">
            {/* Top Left Grid Icon */}
            <div className="absolute top-6 left-6 text-gray-600">
                <Scan size={24} strokeWidth={1.5} />
            </div>

            {/* Text Content - Bottom Left */}
            <div className="relative z-10 max-w-[85%]">
                <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
            </div>
        </div>
    );
};

const FeaturesSection = () => {
    return (
        <section className="w-full bg-[#050505] text-white py-24 px-6 md:px-20 relative z-10">
            <div className="max-w-7xl mx-auto">
                <div className="mb-20 max-w-3xl">
                    <h2 className="text-5xl md:text-6xl font-bold mb-8 tracking-tighter leading-none">
                        Unlock the Real Power <br />
                        of a <span className="text-[#ccff00]">Next Gen Wallet</span>
                    </h2>
                    <p className="text-gray-400 text-xl font-light max-w-xl">
                        Your assets, your rules secured by passkeys, powered by intent.
                        TrustChain simplifies multichain exploration without compromise.
                        All-in-one, lightning fast, radically secure.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FeatureCard
                        title="True Ownership"
                        description="Your keys, your assets. Total control without compromise."
                    />
                    <FeatureCard
                        title="Blazing Fast Transactions"
                        description="Optimized for speed across every supported network."
                    />
                    <FeatureCard
                        title="Effortless Multichain Access"
                        description="Manage assets across multiple chains—seamlessly."
                    />
                </div>
            </div>
        </section>
    );
};

export default FeaturesSection;

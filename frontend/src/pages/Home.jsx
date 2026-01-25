import React, { useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere } from '@react-three/drei';
import { ArrowUpRight, Package } from 'lucide-react';
import Navbar from '../components/Navbar';

const Globe = () => {
    const meshRef = useRef();

    // Create random points for the particle effect
    const particles = useMemo(() => {
        const count = 2000;
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(Math.random() * 2 - 1);
            const r = 2.5; // Radius

            positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = r * Math.cos(phi);

            // White/Grey colors
            colors[i * 3] = 0.7;
            colors[i * 3 + 1] = 0.7;
            colors[i * 3 + 2] = 0.7;
        }

        return { positions, colors };
    }, []);

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.y += 0.001;
            meshRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.1) * 0.1;
        }
    });

    return (
        <group rotation={[0, 0, Math.PI / 6]}>
            {/* Main transparent sphere for volume */}
            <Sphere args={[2.5, 64, 64]}>
                <meshBasicMaterial color="#000000" transparent opacity={0.8} />
            </Sphere>

            {/* Wireframe outer shell */}
            <Sphere args={[2.5, 32, 32]}>
                <meshBasicMaterial color="#333333" wireframe transparent opacity={0.3} />
            </Sphere>

            {/* Particle layer */}
            <points ref={meshRef}>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        count={particles.positions.length / 3}
                        array={particles.positions}
                        itemSize={3}
                    />
                    <bufferAttribute
                        attach="attributes-color"
                        count={particles.colors.length / 3}
                        array={particles.colors}
                        itemSize={3}
                    />
                </bufferGeometry>
                <pointsMaterial
                    size={0.02}
                    vertexColors
                    transparent
                    opacity={0.8}
                    sizeAttenuation={true}
                />
            </points>

            {/* Connecting lines for typical "network" look */}
            <Sphere args={[2.51, 16, 16]}>
                <meshBasicMaterial color="#444444" wireframe transparent opacity={0.15} />
            </Sphere>
        </group>
    );
};

const Home = () => {
    const { wallet } = useWallet();

    const formatAddress = (addr) => {
        return addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : '';
    };

    return (
        <div className="relative w-full min-h-screen bg-[#050505] text-white overflow-x-hidden font-['Space_Grotesk']">

            <Navbar />

            {/* 3D Background - Fixed for scroll effect */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <Canvas camera={{ position: [0, 0, 8], fov: 40 }}>
                    <ambientLight intensity={0.5} />
                    <pointLight position={[10, 10, 10]} intensity={1} />
                    <Globe />
                    <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.8} />
                </Canvas>
            </div>

            {/* Hero Section - Full Height */}
            <div className="relative z-10 w-full h-screen flex items-end md:items-center px-6 md:px-20 pb-20 md:pb-0 pointer-events-none">
                <div className="max-w-4xl text-left pointer-events-auto mt-20 md:mt-0">
                    <h1 className="text-6xl md:text-8xl font-bold leading-[1.1] mb-8 tracking-tighter">
                        Explore the Next <br />
                        Evolution of <span className="text-white">Web3 Wallets</span>
                    </h1>

                    <p className="text-gray-400 text-xl md:text-2xl max-w-2xl mb-12 leading-relaxed font-light">
                        Secure, lightning-fast, and designed for seamless DeFi, NFTs, and multichain interaction.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-6 items-start">
                        {wallet.isConnected ? (
                            <Link
                                to="/dashboard"
                                className="bg-[#ccff00] text-black pl-8 pr-2 rounded-full font-bold text-lg flex items-center gap-4 hover:opacity-90 transition-opacity group shadow-[0_0_25px_rgba(204,255,0,0.4)] h-[68px]"
                            >
                                Go to Dashboard
                                <div className="w-11 h-11 rounded-full bg-black text-white flex items-center justify-center group-hover:rotate-45 transition-transform">
                                    <ArrowUpRight size={22} />
                                </div>
                            </Link>
                        ) : (
                            <button
                                className="bg-[#ccff00] text-black pl-8 pr-2 rounded-full font-bold text-lg flex items-center gap-4 hover:opacity-90 transition-opacity group shadow-[0_0_25px_rgba(204,255,0,0.4)] h-[68px]"
                                onClick={() => document.getElementById('navbar-connect-btn')?.click()} // Dirty hack? No.
                            >
                                Get Started
                                <div className="w-11 h-11 rounded-full bg-black text-white flex items-center justify-center group-hover:rotate-45 transition-transform">
                                    <ArrowUpRight size={22} />
                                </div>
                            </button>
                        )}

                        <Link to="/register" className="px-10 rounded-full font-bold text-lg bg-black border border-white/20 text-white flex items-center justify-center gap-3 hover:bg-white/5 transition-colors shadow-lg shadow-black/20 h-[68px]">
                            <Package size={22} /> Register
                        </Link>
                    </div>
                </div>
            </div>


        </div>
    );
};

export default Home;

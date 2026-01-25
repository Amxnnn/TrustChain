import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';
import { connectWallet, switchToSepolia, getContract, isStakeholder as checkIsStakeholder } from '../utils/contract';
import { SEPOLIA_CHAIN_ID } from '../utils/constants';

const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
    const [wallet, setWallet] = useState({
        address: null,
        chainId: null,
        isConnected: false
    });

    const [contract, setContract] = useState(null);
    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isStakeholder, setIsStakeholder] = useState(false);

    // Initial Auto-Connect & Event Listeners
    useEffect(() => {
        const checkConnection = async () => {
            const shouldConnect = localStorage.getItem('walletConnected') === 'true';
            const storedProvider = localStorage.getItem('walletProvider') || 'metamask';

            if (shouldConnect) {
                // Determine if we can connect based on provider availability
                const isMetamask = window.ethereum;
                const isPhantom = window.phantom?.ethereum;

                if (storedProvider === 'metamask' && isMetamask) {
                    await connectWalletHandler('metamask', true);
                } else if (storedProvider === 'phantom' && isPhantom) {
                    await connectWalletHandler('phantom', true);
                } else {
                    // Cleanup if conditions aren't met
                    localStorage.removeItem('walletConnected');
                    localStorage.removeItem('walletProvider');
                }
            }
        };

        checkConnection();

        // Event Listeners (MetaMask / Standard EIP-1193)
        if (window.ethereum) {
            window.ethereum.on('accountsChanged', handleAccountChange);
            window.ethereum.on('chainChanged', handleChainChange);
        }

        return () => {
            if (window.ethereum) {
                window.ethereum.removeListener('accountsChanged', handleAccountChange);
                window.ethereum.removeListener('chainChanged', handleChainChange);
            }
        };
    }, []);

    const handleAccountChange = async (accounts) => {
        if (accounts.length === 0) {
            disconnectWallet();
            toast.error("Wallet disconnected.");
        } else {
            // Re-connect with new account using stored provider preference
            const storedProvider = localStorage.getItem('walletProvider') || 'metamask';
            await connectWalletHandler(storedProvider, true);
            toast.success("Account changed.");
        }
    };

    const handleChainChange = (chainIdHex) => {
        // ChainId comes as hex string
        const chainId = parseInt(chainIdHex, 16);
        setWallet(prev => ({ ...prev, chainId }));

        if (chainId !== SEPOLIA_CHAIN_ID) {
            toast.error("Please switch to Sepolia Network.");
        } else {
            window.location.reload();
        }
    };

    /**
     * Connect Wallet Handler
     * @param {string} walletType - 'metamask' or 'phantom'
     * @param {boolean} silent - If true, don't show success toast (used for auto-connect)
     */
    const connectWalletHandler = async (walletType = 'metamask', silent = false) => {
        setLoading(true);
        setError(null);

        try {
            // Basic checks before calling utils
            if (walletType === 'metamask' && !window.ethereum) {
                throw new Error('Please install MetaMask extension');
            }
            if (walletType === 'phantom' && !window.phantom?.ethereum) {
                throw new Error('Please install Phantom Wallet extension');
            }

            // 1. Connect logic from utils
            const { provider: newProvider, signer: newSigner, address, chainId } = await connectWallet(walletType);

            // 2. Create contract instance
            const contractInstance = getContract(newSigner);

            // 3. Check stakeholder status (don't block connection if this fails, just log it)
            let stakeholderStatus = false;
            try {
                stakeholderStatus = await checkIsStakeholder(address, newProvider);
            } catch (e) {
                console.warn("Failed to check stakeholder status:", e);
            }

            // 4. Update state
            setProvider(newProvider);
            setSigner(newSigner);
            setContract(contractInstance);
            setWallet({
                address,
                chainId,
                isConnected: true
            });
            setIsStakeholder(stakeholderStatus);

            // Persistence
            localStorage.setItem('walletConnected', 'true');
            localStorage.setItem('walletProvider', walletType);

            if (!silent) {
                toast.success("Wallet connected successfully!");
            }

        } catch (err) {
            console.error("Connection Error:", err);
            const errorMessage = err.message || "Failed to connect wallet";
            setError(errorMessage);
            if (!silent) {
                toast.error(errorMessage);
            }
            // Ensure clean state on failure
            if (!silent) disconnectWallet();
        } finally {
            setLoading(false);
        }
    };

    const disconnectWallet = () => {
        setWallet({
            address: null,
            chainId: null,
            isConnected: false
        });
        setProvider(null);
        setSigner(null);
        setContract(null);
        setIsStakeholder(false);
        setError(null);

        localStorage.removeItem('walletConnected');
        localStorage.removeItem('walletProvider');
    };

    const switchNetworkHandler = async () => {
        try {
            setLoading(true);
            const storedProviderType = localStorage.getItem('walletProvider') || 'metamask';

            // Resolve the actual provider object
            let providerInstance = window.ethereum;
            if (storedProviderType === 'phantom' && window.phantom?.ethereum) {
                providerInstance = window.phantom.ethereum;
            }

            await switchToSepolia(providerInstance);
        } catch (err) {
            console.error("Network switch error:", err);
            toast.error(err.message || "Failed to switch network.");
        } finally {
            setLoading(false);
        }
    };

    const value = {
        wallet,
        contract,
        provider,
        signer,
        loading,
        error,
        isStakeholder,
        connectWallet: (walletType) => connectWalletHandler(walletType, false),
        disconnectWallet,
        switchNetwork: switchNetworkHandler
    };

    return (
        <WalletContext.Provider value={value}>
            {children}
        </WalletContext.Provider>
    );
};

export const useWallet = () => {
    const context = useContext(WalletContext);
    if (!context) {
        throw new Error('useWallet must be used within WalletProvider');
    }
    return context;
};

export default WalletProvider;

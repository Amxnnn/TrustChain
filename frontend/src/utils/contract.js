import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI, SEPOLIA_CHAIN_ID, SEPOLIA_CHAIN_HEX } from './constants';

/**
 * Connect to MetaMask wallet and setup provider/signer
 * @returns {Promise<{provider: ethers.BrowserProvider, signer: ethers.JsonRpcSigner, address: string, chainId: number}>}
 */
/**
 * Connect to Wallet (MetaMask or Phantom)
 * @param {string} walletType - 'metamask' or 'phantom'
 * @returns {Promise<{provider: ethers.BrowserProvider, signer: ethers.JsonRpcSigner, address: string, chainId: number}>}
 */
export const connectWallet = async (walletType = 'metamask') => {
    try {
        let providerInstance;

        if (walletType === 'phantom') {
            // Check for Phantom
            const isPhantomInstalled = window.phantom?.ethereum?.isPhantom;
            if (!isPhantomInstalled) {
                window.open('https://phantom.app/', '_blank');
                throw new Error("Phantom wallet is not installed. Please install it.");
            }
            providerInstance = window.phantom.ethereum;
        } else {
            // MetaMask Selection Logic
            if (window.ethereum) {
                // Check if multiple providers are injected (e.g. MetaMask + Phantom both installed)
                if (window.ethereum.providers) {
                    // Find the one that is explicitly MetaMask
                    providerInstance = window.ethereum.providers.find(p => p.isMetaMask);
                }

                // If no providers array, or not found, fall back to window.ethereum
                // But check if it's actually Phantom disguised as Ethereum
                if (!providerInstance) {
                    if (window.ethereum.isPhantom) {
                        // Phantom is intercepting window.ethereum
                        // Try to see if we can find MetaMask another way, or warn user.
                        // For now, let's assume if providers isn't present, user might only have Phantom installed or main provider is Phantom.
                        // If user clicked MetaMask but only Phantom is responding, we should warn.
                        throw new Error("Phantom Wallet is intercepting MetaMask. Please disable 'Prioritize Phantom' in Phantom settings or use the Phantom option.");
                    }
                    providerInstance = window.ethereum;
                }
            } else {
                throw new Error("MetaMask is not installed. Please install it.");
            }
        }

        // Request account access
        const accounts = await providerInstance.request({ method: 'eth_requestAccounts' });

        if (!accounts || accounts.length === 0) {
            throw new Error("No accounts found. Please unlock your wallet.");
        }

        const address = accounts[0];

        // Create provider and signer
        const provider = new ethers.BrowserProvider(providerInstance);
        const signer = await provider.getSigner();

        // Check network
        const network = await provider.getNetwork();
        const chainId = Number(network.chainId);

        if (chainId !== SEPOLIA_CHAIN_ID) {
            try {
                // Pass providerInstance explicitly to switch logic if needed, but for now assuming standard request works on providerInstance
                await switchToSepolia(providerInstance);
            } catch (switchError) {
                console.error("Failed to switch network:", switchError);
                throw new Error(`Please switch your wallet to Sepolia Testnet (Chain ID: ${SEPOLIA_CHAIN_ID}). Current: ${chainId}`);
            }
        }

        console.log(`Wallet connected (${walletType}):`, { address, chainId });
        return { provider, signer, address, chainId };
    } catch (error) {
        console.error("Error connecting wallet:", error);
        if (error.code === 4001) {
            throw new Error("User rejected the connection request.");
        }
        throw error;
    }
};

/**
 * Switch the connected wallet to Sepolia network
 * @param {Object} provider - The ethereum provider instance (window.ethereum or window.phantom.ethereum)
 */
export const switchToSepolia = async (provider = window.ethereum) => {
    try {
        await provider.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: SEPOLIA_CHAIN_HEX }],
        });
    } catch (switchError) {
        // Phantom may throw "You are not in Testnet mode" or similar if trying to add/switch to a testnet while in Mainnet mode.
        // It might not return standard 4902 code.
        const isPhantomError = switchError.message?.toLowerCase().includes("testnet mode") || switchError.message?.toLowerCase().includes("chain");

        if (switchError.code === 4902 || isPhantomError) {
            try {
                await provider.request({
                    method: 'wallet_addEthereumChain',
                    params: [
                        {
                            chainId: SEPOLIA_CHAIN_HEX,
                            chainName: 'Sepolia Test Network',
                            rpcUrls: ['https://sepolia.infura.io/v3/'],
                            nativeCurrency: { name: 'SepoliaETH', symbol: 'ETH', decimals: 18 },
                            blockExplorerUrls: ['https://sepolia.etherscan.io'],
                        },
                    ],
                });
            } catch (addError) {
                console.error("Error adding Sepolia network:", addError);
                if (addError.message?.includes("Testnet mode")) {
                    throw new Error("Please enable 'Testnet Mode' in your Phantom Wallet settings (Settings > Developer Settings > Testnet Mode).");
                }
                throw new Error("Failed to add Sepolia network. Please switch manually in your wallet.");
            }
        } else {
            console.error("Error switching to Sepolia:", switchError);
            if (switchError.message?.includes("Testnet mode")) {
                throw new Error("Please enable 'Testnet Mode' in your Phantom Wallet settings (Settings > Developer Settings > Testnet Mode).");
            }
            throw switchError;
        }
    }
};

/**
 * Get the contract instance
 * @param {ethers.Signer | ethers.Provider} signerOrProvider 
 * @returns {ethers.Contract}
 */
export const getContract = (signerOrProvider) => {
    try {
        return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signerOrProvider);
    } catch (error) {
        console.error("Error creating contract instance:", error);
        throw new Error("Failed to initialize contract instance.");
    }
};

/**
 * Create a new product on the blockchain
 * @param {string} ipfsHash - IPFS hash of the product data
 * @param {ethers.Signer} signer - The signer to authorize the transaction
 * @returns {Promise<{productId: number, txHash: string, receipt: ethers.TransactionReceipt}>}
 */
export const createProduct = async (ipfsHash, signer) => {
    try {
        const contract = getContract(signer);
        console.log(`Creating product with IPFS: ${ipfsHash}`);

        const tx = await contract.createProduct(ipfsHash);
        console.log('Transaction sent:', tx.hash);

        const receipt = await tx.wait();
        console.log('Transaction confirmed:', receipt);

        // Parse logs to find ProductCreated event
        // The logs in receipt are raw, we need to parse them using the interface
        let productId = null;

        for (const log of receipt.logs) {
            try {
                const parsedLog = contract.interface.parseLog(log);
                if (parsedLog && parsedLog.name === 'ProductCreated') {
                    productId = parsedLog.args.id;
                    break;
                }
            } catch (e) {
                // Ignore logs that don't match the interface
                continue;
            }
        }

        if (productId === null) {
            throw new Error("ProductCreated event not found in transaction logs.");
        }

        return { productId: productId.toString(), txHash: tx.hash, receipt };
    } catch (error) {
        console.error('Error creating product:', error);
        if (error.code === 'ACTION_REJECTED') {
            throw new Error("Transaction rejected by user.");
        }
        throw new Error(`Failed to create product: ${error.message}`);
    }
};

/**
 * Update an existing product
 * @param {number|string} productId - ID of the product
 * @param {string} ipfsHash - New IPFS hash
 * @param {ethers.Signer} signer - Signer
 * @returns {Promise<{txHash: string, receipt: ethers.TransactionReceipt}>}
 */
export const updateProduct = async (productId, ipfsHash, signer) => {
    try {
        const contract = getContract(signer);
        console.log(`Updating product ${productId} with IPFS: ${ipfsHash}`);

        const tx = await contract.updateProduct(productId, ipfsHash);
        console.log('Update transaction sent:', tx.hash);

        const receipt = await tx.wait();
        console.log('Update transaction confirmed:', receipt);

        return { txHash: tx.hash, receipt };
    } catch (error) {
        console.error('Error updating product:', error);
        if (error.code === 'ACTION_REJECTED') {
            throw new Error("Transaction rejected by user.");
        }
        throw new Error(`Failed to update product: ${error.message}`);
    }
};

/**
 * Get details of a product
 * @param {number|string} productId 
 * @param {ethers.Provider} provider 
 * @returns {Promise<{ipfsHash: string, manufacturer: string, timestamp: number}>}
 */
export const getProductDetails = async (productId, provider) => {
    try {
        const contract = getContract(provider);
        const cleanId = productId.toString().trim();
        const result = await contract.getProduct(cleanId);

        // contract.getProduct returns (string ipfsHash, address manufacturer, uint256 timestamp)
        // result is usually a Result object which is array-like
        const ipfsHash = result[0];
        const manufacturer = result[1];
        const timestamp = Number(result[2]);

        if (manufacturer === ethers.ZeroAddress) {
            throw new Error("Product not found.");
        }

        return { ipfsHash, manufacturer, timestamp };
    } catch (error) {
        console.error(`Error fetching product ${productId}:`, error);
        // Check for specific revert reasons if possible, but generic error here
        if (error.message.includes("Product does not exist")) {
            throw new Error("Product not found.");
        }
        throw new Error(`Failed to get product details: ${error.message}`);
    }
};

/**
 * Get the number of updates for a product
 * @param {number|string} productId 
 * @param {ethers.Provider} provider 
 * @returns {Promise<number>}
 */
export const getProductUpdateCount = async (productId, provider) => {
    try {
        const contract = getContract(provider);
        const count = await contract.getUpdateCount(productId);
        return Number(count);
    } catch (error) {
        console.error(`Error fetching update count for ${productId}:`, error);
        throw new Error(`Failed to get update count: ${error.message}`);
    }
};

/**
 * Get a specific update hash
 * @param {number|string} productId 
 * @param {number} updateIndex 
 * @param {ethers.Provider} provider 
 * @returns {Promise<string>}
 */
export const getProductUpdate = async (productId, updateIndex, provider) => {
    try {
        const contract = getContract(provider);
        const hash = await contract.getUpdateHash(productId, updateIndex);
        return hash;
    } catch (error) {
        console.error(`Error fetching update ${updateIndex} for ${productId}:`, error);
        throw new Error(`Failed to get update hash: ${error.message}`);
    }
};

/**
 * Get all updates for a product
 * @param {number|string} productId 
 * @param {ethers.Provider} provider 
 * @returns {Promise<string[]>}
 */
export const getAllProductUpdates = async (productId, provider) => {
    try {
        const count = await getProductUpdateCount(productId, provider);
        const updates = [];

        // Fetch all updates (could be optimized with Promise.all for parallel fetching if RPC supports it well)
        // Doing sequential to avoid rate limits on public RPCs sometimes
        for (let i = 0; i < count; i++) {
            const hash = await getProductUpdate(productId, i, provider);
            updates.push(hash);
        }

        return updates;
    } catch (error) {
        console.error(`Error fetching all updates for ${productId}:`, error);
        throw new Error(`Failed to get all product updates: ${error.message}`);
    }
};

/**
 * Add a stakeholder (Owner only)
 * @param {string} stakeholderAddress 
 * @param {ethers.Signer} signer 
 * @returns {Promise<ethers.TransactionReceipt>}
 */
export const addStakeholder = async (stakeholderAddress, signer) => {
    try {
        if (!ethers.isAddress(stakeholderAddress)) {
            throw new Error("Invalid address format.");
        }

        const contract = getContract(signer);
        console.log(`Adding stakeholder: ${stakeholderAddress}`);

        const tx = await contract.addStakeholder(stakeholderAddress);
        console.log('Add stakeholder tx sent:', tx.hash);

        const receipt = await tx.wait();
        console.log('Add stakeholder tx confirmed:', receipt);

        return receipt;
    } catch (error) {
        console.error('Error adding stakeholder:', error);
        if (error.code === 'ACTION_REJECTED') {
            throw new Error("Transaction rejected by user.");
        }
        if (error.message.includes("Ownable: caller is not the owner")) {
            throw new Error("Only the contract owner can add stakeholders.");
        }
        throw new Error(`Failed to add stakeholder: ${error.message}`);
    }
};

/**
 * Check if an address is a stakeholder
 * @param {string} address 
 * @param {ethers.Provider} provider 
 * @returns {Promise<boolean>}
 */
export const isStakeholder = async (address, provider) => {
    try {
        const contract = getContract(provider);
        const isStakeholder = await contract.stakeholders(address);
        return isStakeholder;
    } catch (error) {
        console.error(`Error checking stakeholder status for ${address}:`, error);
        throw new Error(`Failed to check stakeholder status: ${error.message}`);
    }
};

/**
 * Get total product count
 * @param {ethers.Provider} provider 
 * @returns {Promise<number>}
 */
export const getProductCount = async (provider) => {
    try {
        const contract = getContract(provider);
        const count = await contract.productCount();
        return Number(count);
    } catch (error) {
        console.error('Error fetching product count:', error);
        throw new Error(`Failed to get product count: ${error.message}`);
    }
};

/**
 * Listen to ProductCreated events
 * @param {ethers.Contract} contract 
 * @param {Function} callback 
 * @returns {Function} cleanup function
 */
export const listenToProductCreated = (contract, callback) => {
    try {
        contract.on('ProductCreated', callback);
        return () => contract.off('ProductCreated', callback);
    } catch (error) {
        console.error("Error setting up ProductCreated listener:", error);
        return () => { };
    }
};

/**
 * Listen to ProductUpdated events
 * @param {ethers.Contract} contract 
 * @param {Function} callback 
 * @returns {Function} cleanup function
 */
export const listenToProductUpdated = (contract, callback) => {
    try {
        contract.on('ProductUpdated', callback);
        return () => contract.off('ProductUpdated', callback);
    } catch (error) {
        console.error("Error setting up ProductUpdated listener:", error);
        return () => { };
    }
};

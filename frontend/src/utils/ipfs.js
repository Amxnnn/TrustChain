import axios from 'axios';

const PINATA_API_KEY = import.meta.env.VITE_PINATA_API_KEY;
const PINATA_SECRET = import.meta.env.VITE_PINATA_SECRET_KEY;
const PINATA_URL = 'https://api.pinata.cloud/pinning/pinJSONToIPFS';

/**
 * Uploads product data to IPFS via Pinata.
 * @param {Object} productData - The product details { name, origin, description, category, manufacturer, timestamp }.
 * @returns {Promise<string>} - The IPFS CID.
 */
export const uploadProductToIPFS = async (productData) => {
    try {
        if (!PINATA_API_KEY || !PINATA_SECRET) {
            throw new Error("Pinata credentials not found in environment variables");
        }

        const body = {
            pinataContent: productData,
            pinataMetadata: {
                name: `Product-${productData.name}-${Date.now()}`,
                keyvalues: {
                    type: "product",
                    manufacturer: productData.manufacturer
                }
            }
        };

        const response = await axios.post(PINATA_URL, body, {
            headers: {
                'pinata_api_key': PINATA_API_KEY,
                'pinata_secret_api_key': PINATA_SECRET
            }
        });

        return response.data.IpfsHash;
    } catch (error) {
        console.error('IPFS upload failed:', error);
        throw error;
    }
};

/**
 * Uploads update data to IPFS via Pinata.
 * @param {Object} updateData - The update details { location, status, notes, timestamp, updatedBy }.
 * @returns {Promise<string>} - The IPFS CID.
 */
export const uploadUpdateToIPFS = async (updateData) => {
    try {
        if (!PINATA_API_KEY || !PINATA_SECRET) {
            throw new Error("Pinata credentials not found in environment variables");
        }

        const body = {
            pinataContent: updateData,
            pinataMetadata: {
                name: `Update-${updateData.timestamp}`,
                keyvalues: {
                    type: "update",
                    updatedBy: updateData.updatedBy
                }
            }
        };

        const response = await axios.post(PINATA_URL, body, {
            headers: {
                'pinata_api_key': PINATA_API_KEY,
                'pinata_secret_api_key': PINATA_SECRET
            }
        });

        return response.data.IpfsHash;
    } catch (error) {
        console.error('IPFS update upload failed:', error);
        throw error;
    }
};

/**
 * Fetches data from IPFS using multiple gateways with fallback and caching.
 * @param {string} cid - The IPFS CID.
 * @returns {Promise<Object>} - The parsed JSON data.
 */
export const fetchFromIPFS = async (cid) => {
    if (!cid) return null;

    // Check cache first
    const cached = sessionStorage.getItem(`ipfs_${cid}`);
    if (cached) {
        try {
            return JSON.parse(cached);
        } catch (e) {
            console.warn("Invalid cache data", e);
            sessionStorage.removeItem(`ipfs_${cid}`);
        }
    }

    const gateways = [
        `https://gateway.pinata.cloud/ipfs/${cid}`,
        `https://ipfs.io/ipfs/${cid}`,
        `https://cloudflare-ipfs.com/ipfs/${cid}`
    ];

    for (const url of gateways) {
        try {
            const response = await axios.get(url, { timeout: 5000 });
            const data = response.data;

            // Cache the result
            sessionStorage.setItem(`ipfs_${cid}`, JSON.stringify(data));
            return data;
        } catch (error) {
            console.warn(`Failed to fetch from ${url}:`, error.message);
            // Continue to next gateway
        }
    }

    throw new Error(`Failed to fetch CID: ${cid} from all gateways`);
};

/**
 * Fetches full product history including all updates from the smart contract.
 * @param {number} productId - The product ID.
 * @param {Object} contract - The ethers.js contract instance.
 * @returns {Promise<Object>} - { product: Object, updates: Array }
 */
export const fetchProductHistory = async (productId, contract) => {
    try {
        // 1. Get product details from contract
        const productOnChain = await contract.getProduct(productId);
        // productOnChain = [ipfsHash, manufacturer, timestamp]

        // 2. Fetch product metadata from IPFS
        const productMetadata = await fetchFromIPFS(productOnChain[0]);

        const product = {
            id: productId,
            ...productMetadata,
            manufacturer: productOnChain[1],
            createdAt: Number(productOnChain[2])
        };

        // 3. Get update count
        const updateCount = await contract.getUpdateCount(productId);
        const updates = [];

        // 4. Fetch all updates
        for (let i = 0; i < updateCount; i++) {
            const updateHash = await contract.getUpdateHash(productId, i);
            const updateData = await fetchFromIPFS(updateHash);
            if (updateData) {
                updates.push(updateData);
            }
        }

        return { product, updates };
    } catch (error) {
        console.error("Failed to fetch product history:", error);
        throw error;
    }
};

/**
 * Validates if a string is a valid IPFS CID (basic check).
 * @param {string} hash 
 * @returns {boolean}
 */
export const validateIPFSHash = (hash) => {
    return hash && (hash.startsWith('Qm') || hash.startsWith('bafy')) && hash.length > 40;
};

/**
 * Formats an IPFS CID into a viewable URL.
 * @param {string} cid 
 * @returns {string}
 */
export const formatIPFSUrl = (cid) => {
    return `https://gateway.pinata.cloud/ipfs/${cid}`;
};

/**
 * Clears the IPFS data cache from session storage.
 */
export const clearIPFSCache = () => {
    Object.keys(sessionStorage).forEach(key => {
        if (key.startsWith('ipfs_')) {
            sessionStorage.removeItem(key);
        }
    });
};

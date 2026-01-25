/**
 * Truncate Ethereum address
 * @param {string} address - Full address
 * @returns {string} - Truncated (0x1234...5678)
 */
export const truncateAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

/**
 * Format timestamp to readable date
 * @param {number} timestamp - Unix timestamp (seconds or milliseconds)
 * @returns {string} - Formatted date
 */
export const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    // Handle both seconds and milliseconds
    const ms = timestamp.toString().length === 10 ? timestamp * 1000 : Number(timestamp);
    return new Date(ms).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
};

/**
 * Format relative time (e.g., "2 hours ago")
 * @param {number} timestamp - Unix timestamp
 * @returns {string}
 */
export const formatRelativeTime = (timestamp) => {
    if (!timestamp) return '';
    const ms = timestamp.toString().length === 10 ? timestamp * 1000 : Number(timestamp);
    const now = Date.now();
    const diff = now - ms;

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
};

/**
 * Copy text to clipboard
 * @param {string} text
 * @returns {Promise<boolean>}
 */
export const copyToClipboard = async (text) => {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        console.error('Failed to copy:', err);
        return false;
    }
};

/**
 * Validate Ethereum address
 * @param {string} address
 * @returns {boolean}
 */
export const isValidAddress = (address) => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
};

/**
 * Get status color for badge
 * @param {string} status
 * @returns {string} - Tailwind color class
 */
export const getStatusColor = (status) => {
    const colors = {
        'Manufactured': 'bg-blue-100 text-blue-800',
        'In Transit': 'bg-yellow-100 text-yellow-800',
        'At Warehouse': 'bg-purple-100 text-purple-800',
        'At Retailer': 'bg-orange-100 text-orange-800',
        'Delivered': 'bg-green-100 text-green-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
};

/**
 * Format IPFS gateway URL
 * @param {string} cid - IPFS hash
 * @returns {string} - Full URL
 */
export const getIPFSUrl = (cid) => {
    return `https://gateway.pinata.cloud/ipfs/${cid}`;
};

/**
 * Get Etherscan transaction URL
 * @param {string} txHash
 * @returns {string}
 */
export const getEtherscanUrl = (txHash) => {
    return `https://sepolia.etherscan.io/tx/${txHash}`;
};

/**
 * Validate product ID
 * @param {string|number} id
 * @returns {boolean}
 */
export const isValidProductId = (id) => {
    const num = Number(id);
    return !isNaN(num) && num >= 0 && Number.isInteger(num);
};

// Simple test script to verify contract interaction
import { ethers } from 'ethers';

const CONTRACT_ADDRESS = "0xa6Fa7EcA65B66592AC3878C4A7C0Fc7dBBb9701E";
const RPC_URL = "https://sepolia.infura.io/v3/b5832a823c924767b4587399887d9885"; // Added public RPC key for testing if env is missing

async function testContract() {
    console.log('Testing contract connection...');

    // Use user's RPC if available, otherwise default
    const provider = new ethers.JsonRpcProvider(RPC_URL);

    // Simple ABI for testing
    const abi = [
        "function productCount() view returns (uint256)",
        "function getProduct(uint256) view returns (string, address, uint256)"
    ];

    const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, provider);

    try {
        const count = await contract.productCount();
        console.log('Total products:', count.toString());

        if (count > 0) {
            // Try to fetch first product if exists
            // Note: Product IDs usually start at 1 based on previous implementation
            const product = await contract.getProduct(1);
            console.log('Product 1 IPFS Hash:', product[0]);
            console.log('Manufacturer:', product[1]);
            console.log('Timestamp:', product[2].toString());
        }

        console.log('✅ Contract connection successful!');
    } catch (error) {
        console.error('❌ Contract test failed:', error.message);
    }
}

testContract();

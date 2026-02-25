import ContractABI from '../../../artifacts/contracts/SupplyChain.sol/SupplyChain.json';

export const CONTRACT_ADDRESS = "0x70ccA07C9b86127Bca4736c2B2F0BFAa3aeb0057";
export const CONTRACT_ABI = ContractABI.abi;

export const SEPOLIA_CHAIN_ID = 11155111;
export const SEPOLIA_CHAIN_HEX = '0xaa36a7';

export const STATUS_OPTIONS = [
    { value: 'Manufactured', label: 'Manufactured', color: 'blue' },
    { value: 'In Transit', label: 'In Transit', color: 'yellow' },
    { value: 'At Warehouse', label: 'At Warehouse', color: 'purple' },
    { value: 'At Retailer', label: 'At Retailer', color: 'orange' },
    { value: 'Delivered', label: 'Delivered', color: 'green' }
];

export const CATEGORY_OPTIONS = [
    'Electronics',
    'Food & Beverage',
    'Pharmaceuticals',
    'Textiles',
    'Automotive',
    'Other'
];


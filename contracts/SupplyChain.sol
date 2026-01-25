// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SupplyChain {
    
    struct Product {
        string ipfsHash;
        address manufacturer;
        uint256 timestamp;
        bool exists;
    }
   
    mapping(uint256 => Product) public products;
    mapping(uint256 => string[]) public updateHashes;
    mapping(address => bool) public stakeholders;
    address public owner;
    uint256 public productCount;
   
    event ProductCreated(uint256 indexed id, string ipfsHash, address indexed manufacturer, uint256 timestamp);
    event ProductUpdated(uint256 indexed id, string ipfsHash, address indexed updatedBy, uint256 timestamp);
    event StakeholderAdded(address indexed stakeholder);

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }
    
    modifier onlyStakeholder() {
        require(stakeholders[msg.sender]);
        _;
    }
    
    constructor() {
        owner = msg.sender;
        stakeholders[msg.sender] = true;
    }

    function addStakeholder(address _addr) external onlyOwner {
        stakeholders[_addr] = true;
        emit StakeholderAdded(_addr);
    }
    
    function createProduct(string calldata _ipfsHash) external onlyStakeholder returns (uint256) {
        productCount++;
        // Generate a pseudo-random unique ID using timestamp, sender and nonce
        uint256 id = uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender, productCount)));
        
        products[id] = Product(_ipfsHash, msg.sender, block.timestamp, true);
        emit ProductCreated(id, _ipfsHash, msg.sender, block.timestamp);
        return id;
    }
    
    function updateProduct(uint256 _id, string calldata _ipfsHash) external onlyStakeholder {
        require(products[_id].exists);
        updateHashes[_id].push(_ipfsHash);
        emit ProductUpdated(_id, _ipfsHash, msg.sender, block.timestamp);
    }
    
    function getProduct(uint256 _id) external view returns (string memory, address, uint256) {
        Product memory p = products[_id];
        return (p.ipfsHash, p.manufacturer, p.timestamp);
    }
    
    function getUpdateCount(uint256 _id) external view returns (uint256) {
        return updateHashes[_id].length;
    }
   
    function getUpdateHash(uint256 _id, uint256 _index) external view returns (string memory) {
        return updateHashes[_id][_index];
    }
}
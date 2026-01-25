const hre = require("hardhat");

async function main() {
    const CONTRACT_ADDRESS = "0xa6Fa7EcA65B66592AC3878C4A7C0Fc7dBBb9701E";
    const IPFS_HASH = "QmTestIPFSHash123";

    console.log(`Connecting to SupplyChain at ${CONTRACT_ADDRESS}...`);
    const SupplyChain = await hre.ethers.getContractFactory("SupplyChain");
    const supplyChain = SupplyChain.attach(CONTRACT_ADDRESS);

    console.log(`Creating product with IPFS hash: ${IPFS_HASH}...`);
    const tx = await supplyChain.createProduct(IPFS_HASH);
    console.log(`Transaction sent: ${tx.hash}`);

    console.log("Waiting for confirmation...");
    await tx.wait();
    console.log("Transaction confirmed!");

    console.log("Fetching product #1...");
    // Note: If other people have used this contract, ID might not be 1.
    // Ideally we would parse the event to get the ID, but for this specific request we assume ID 1 as per instructions.
    // However, safe practice is to read the latest ID or listen to event, but I will follow specific instruction to "Read getProduct(1)".
    const product = await supplyChain.getProduct(1);

    console.log("Product Details:");
    console.log(`- IPFS Hash: ${product[0]}`);
    console.log(`- Manufacturer: ${product[1]}`);
    console.log(`- Timestamp: ${product[2]}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

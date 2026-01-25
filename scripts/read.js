const hre = require("hardhat");

async function main() {
    const CONTRACT_ADDRESS = "0xa6Fa7EcA65B66592AC3878C4A7C0Fc7dBBb9701E";

    console.log(`Connecting to SupplyChain at ${CONTRACT_ADDRESS}...`);
    const SupplyChain = await hre.ethers.getContractFactory("SupplyChain");
    const supplyChain = SupplyChain.attach(CONTRACT_ADDRESS);

    console.log("Fetching product #1...");
    const product = await supplyChain.getProduct(1);

    console.log("Product Details:");
    console.log(`- IPFS Hash: ${product[0]}`);
    console.log(`- Manufacturer: ${product[1]}`);
    console.log(`- Timestamp: ${product[2]}`);
    process.exit(0);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

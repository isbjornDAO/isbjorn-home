import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Starting deployment...");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // 1. Deploy MockERC8004 (Identity Registry)
  console.log("Deploying MockERC8004...");
  const MockERC8004 = await ethers.getContractFactory("MockERC8004");
  const identityRegistry = await MockERC8004.deploy();
  await identityRegistry.waitForDeployment();
  const identityRegistryAddress = await identityRegistry.getAddress();
  console.log("✅ MockERC8004 deployed to:", identityRegistryAddress);

  // 2. Deploy NodeRegistry
  console.log("Deploying NodeRegistry...");
  const NodeRegistry = await ethers.getContractFactory("NodeRegistry");
  const nodeRegistry = await NodeRegistry.deploy();
  await nodeRegistry.waitForDeployment();
  const nodeRegistryAddress = await nodeRegistry.getAddress();
  console.log("✅ NodeRegistry deployed to:", nodeRegistryAddress);

  // 3. Deploy DonationContract
  console.log("Deploying DonationContract...");
  const DonationContract = await ethers.getContractFactory("DonationContract");
  const donationContract = await DonationContract.deploy(nodeRegistryAddress, identityRegistryAddress);
  await donationContract.waitForDeployment();
  const donationContractAddress = await donationContract.getAddress();
  console.log("✅ DonationContract deployed to:", donationContractAddress);

  // 4. Setup Permissions
  // Allow DonationContract to register nodes in NodeRegistry (if needed, though currently it's public or owner restricted?)
  // In NodeRegistry.sol, registerNode is public but returns ID. 
  // If we wanted to restrict it, we would do it here.
  
  console.log("🎉 Deployment Complete!");
  console.log({
    identityRegistry: identityRegistryAddress,
    nodeRegistry: nodeRegistryAddress,
    donationContract: donationContractAddress,
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

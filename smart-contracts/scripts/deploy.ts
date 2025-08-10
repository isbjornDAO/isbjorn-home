import { ethers } from "hardhat";
import { writeFileSync } from "fs";
import { join } from "path";

async function main() {
  console.log("🚀 Deploying Isbjorn Smart Contracts to Avalanche...");
  
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);
  
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "AVAX");
  
  const network = await ethers.provider.getNetwork();
  console.log("🌐 Network:", network.name, "ChainId:", network.chainId);
  
  // USDC.e contract address on Avalanche
  const USDC_ADDRESS = network.chainId === 43114n 
    ? "0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664"  // Mainnet
    : "0x5425890298aed601595a70AB815c96711a31Bc65";  // Fuji Testnet
  
  // Treasury address (should be a multisig in production)
  const TREASURY_ADDRESS = process.env.TREASURY_ADDRESS || deployer.address;
  
  // MultiSig owners
  const MULTISIG_OWNERS = [
    deployer.address,
    process.env.ADMIN_ADDRESS_1 || deployer.address,
    process.env.ADMIN_ADDRESS_2 || deployer.address,
    process.env.ADMIN_ADDRESS_3 || deployer.address,
    process.env.ADMIN_ADDRESS_4 || deployer.address,
  ].filter((addr, index, self) => self.indexOf(addr) === index); // Remove duplicates
  
  const REQUIRED_SIGNATURES = 3;
  
  console.log("📋 Configuration:");
  console.log("  USDC Address:", USDC_ADDRESS);
  console.log("  Treasury Address:", TREASURY_ADDRESS);
  console.log("  MultiSig Owners:", MULTISIG_OWNERS);
  console.log("  Required Signatures:", REQUIRED_SIGNATURES);
  
  // Deploy AdminMultiSig first
  console.log("\n🔐 Deploying AdminMultiSig...");
  const AdminMultiSig = await ethers.getContractFactory("AdminMultiSig");
  const adminMultiSig = await AdminMultiSig.deploy(MULTISIG_OWNERS, REQUIRED_SIGNATURES);
  await adminMultiSig.waitForDeployment();
  const adminMultiSigAddress = await adminMultiSig.getAddress();
  console.log("✅ AdminMultiSig deployed to:", adminMultiSigAddress);
  
  // Deploy DonationTracker
  console.log("\n📊 Deploying DonationTracker...");
  const DonationTracker = await ethers.getContractFactory("DonationTracker");
  const donationTracker = await DonationTracker.deploy(adminMultiSigAddress);
  await donationTracker.waitForDeployment();
  const donationTrackerAddress = await donationTracker.getAddress();
  console.log("✅ DonationTracker deployed to:", donationTrackerAddress);
  
  // Deploy ProjectDistribution
  console.log("\n💰 Deploying ProjectDistribution...");
  const ProjectDistribution = await ethers.getContractFactory("ProjectDistribution");
  const projectDistribution = await ProjectDistribution.deploy(
    USDC_ADDRESS,
    TREASURY_ADDRESS,
    adminMultiSigAddress
  );
  await projectDistribution.waitForDeployment();
  const projectDistributionAddress = await projectDistribution.getAddress();
  console.log("✅ ProjectDistribution deployed to:", projectDistributionAddress);
  
  // Grant roles to ProjectDistribution contract
  console.log("\n🔑 Setting up permissions...");
  
  try {
    console.log("Granting OPERATOR_ROLE to ProjectDistribution...");
    const operatorRole = await donationTracker.OPERATOR_ROLE();
    const tx1 = await donationTracker.grantRole(operatorRole, projectDistributionAddress);
    await tx1.wait();
    console.log("✅ OPERATOR_ROLE granted");
    
    console.log("Granting DISTRIBUTOR_ROLE to deployer...");
    const distributorRole = await projectDistribution.DISTRIBUTOR_ROLE();
    const tx2 = await projectDistribution.grantRole(distributorRole, deployer.address);
    await tx2.wait();
    console.log("✅ DISTRIBUTOR_ROLE granted");
    
  } catch (error) {
    console.log("⚠️  Permission setup will be handled by multisig");
  }
  
  // Verify deployments
  console.log("\n🔍 Verifying deployments...");
  
  const donationTrackerCode = await ethers.provider.getCode(donationTrackerAddress);
  const projectDistributionCode = await ethers.provider.getCode(projectDistributionAddress);
  const adminMultiSigCode = await ethers.provider.getCode(adminMultiSigAddress);
  
  console.log("DonationTracker bytecode length:", donationTrackerCode.length);
  console.log("ProjectDistribution bytecode length:", projectDistributionCode.length);
  console.log("AdminMultiSig bytecode length:", adminMultiSigCode.length);
  
  // Save deployment addresses
  const deploymentInfo = {
    network: network.name,
    chainId: network.chainId.toString(),
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    contracts: {
      DonationTracker: {
        address: donationTrackerAddress,
        constructorArgs: [adminMultiSigAddress]
      },
      ProjectDistribution: {
        address: projectDistributionAddress,
        constructorArgs: [USDC_ADDRESS, TREASURY_ADDRESS, adminMultiSigAddress]
      },
      AdminMultiSig: {
        address: adminMultiSigAddress,
        constructorArgs: [MULTISIG_OWNERS, REQUIRED_SIGNATURES]
      }
    },
    configuration: {
      usdcAddress: USDC_ADDRESS,
      treasuryAddress: TREASURY_ADDRESS,
      multisigOwners: MULTISIG_OWNERS,
      requiredSignatures: REQUIRED_SIGNATURES
    }
  };
  
  const deploymentsDir = join(__dirname, "../deployments");
  const filename = `deployment-${network.name}-${Date.now()}.json`;
  
  try {
    writeFileSync(join(deploymentsDir, filename), JSON.stringify(deploymentInfo, null, 2));
    console.log(`📄 Deployment info saved to: deployments/${filename}`);
  } catch (error) {
    console.log("📄 Deployment info:");
    console.log(JSON.stringify(deploymentInfo, null, 2));
  }
  
  console.log("\n✨ Deployment Summary:");
  console.log("================================");
  console.log("🔐 AdminMultiSig:", adminMultiSigAddress);
  console.log("📊 DonationTracker:", donationTrackerAddress);
  console.log("💰 ProjectDistribution:", projectDistributionAddress);
  console.log("================================");
  
  console.log("\n📋 Next Steps:");
  console.log("1. Verify contracts on Snowtrace");
  console.log("2. Update backend environment variables");
  console.log("3. Setup project registrations");
  console.log("4. Test donation flow end-to-end");
  console.log("5. Transfer ownership to production multisig");
  
  // Environment variables for backend
  console.log("\n🔧 Environment Variables for Backend:");
  console.log(`DONATION_TRACKER_ADDRESS=${donationTrackerAddress}`);
  console.log(`PROJECT_DISTRIBUTION_ADDRESS=${projectDistributionAddress}`);
  console.log(`ADMIN_MULTISIG_ADDRESS=${adminMultiSigAddress}`);
  console.log(`AVALANCHE_CHAIN_ID=${network.chainId}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
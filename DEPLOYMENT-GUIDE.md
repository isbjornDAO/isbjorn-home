# 🚀 L1 Testnet Deployment Guide

## Overview
This guide will help you deploy the Isbjorn smart contracts to Avalanche Fuji testnet and connect them to your frontend.

## Prerequisites
- Node.js 18+ and npm
- MetaMask or other Web3 wallet
- Test AVAX tokens (get from [Avalanche Faucet](https://faucet.avax.network/))

## 🏗️ Smart Contract Deployment

### 1. Navigate to Smart Contracts Directory
```bash
cd smart-contracts
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Compile Contracts
```bash
npm run compile
```

### 4. Deploy to Fuji Testnet
```bash
npm run deploy:fuji:test
```

This will:
- Generate a test wallet
- Deploy AdminMultiSig contract
- Deploy DonationTracker contract  
- Deploy ProjectDistribution contract
- Set up permissions and roles
- Save deployment info to `deployment-fuji.json`

### 5. Fund the Test Wallet
The deployment script will show you a private key. Use this to:
1. Import the wallet into MetaMask
2. Get test AVAX from the [Avalanche Faucet](https://faucet.avax.network/)
3. Fund the wallet with at least 0.1 AVAX

### 6. Re-run Deployment
Once funded, run the deployment again:
```bash
npm run deploy:fuji:test
```

## 🔗 Frontend Integration

### 1. Update Contract Addresses
After successful deployment, update your frontend with the contract addresses from `deployment-fuji.json`:

```typescript
// In your frontend environment or config
const BLOCKCHAIN_CONFIG = {
  rpcUrl: 'https://api.avax-test.network/ext/bc/C/rpc',
  chainId: 43113,
  contracts: {
    donationTracker: '0x...', // From deployment-fuji.json
    projectDistribution: '0x...', // From deployment-fuji.json
    usdc: '0x5425890298aed601595a70AB815c96711a31Bc65' // Fuji USDC.e
  }
};
```

### 2. Configure Blockchain Service
```typescript
import { blockchainService } from './services/blockchainService';

// Set the contract configuration
await blockchainService.setContracts(BLOCKCHAIN_CONFIG);
```

### 3. Test Wallet Connection
1. Open your frontend in a browser
2. Click "Connect Wallet" button
3. Approve MetaMask connection
4. Switch to Fuji testnet if prompted

## 🧪 Testing the Integration

### 1. Test Donation Recording
```typescript
// Record a donation on the blockchain
const tx = await blockchainService.recordDonation(
  'donation-123',
  '0x...', // donor address
  '0x...', // project address
  '100.00', // amount in USDC
  'Test Charity',
  'Test Company'
);
```

### 2. Test Project Registration
```typescript
// Register a new project
const tx = await blockchainService.registerProject(
  'project-123',
  'Test Project',
  '0x...' // project wallet address
);
```

### 3. Test Fund Distribution
```typescript
// Distribute funds to a project
const tx = await blockchainService.distributeFunds(
  'project-123',
  '50.00', // amount in USDC
  'Monthly distribution'
);
```

## 🔍 Verification

### 1. Check on Snowtrace
- View your contracts on [Snowtrace Testnet](https://testnet.snowtrace.io/)
- Search for the contract addresses from `deployment-fuji.json`

### 2. Check Contract State
```typescript
// Get total donation stats
const stats = await blockchainService.getTotalStats();
console.log('Total donations:', stats.totalDonations);
console.log('Total amount:', stats.totalAmount);

// Get specific donation
const donation = await blockchainService.getDonation('donation-123');
console.log('Donation:', donation);
```

## 🚨 Troubleshooting

### Common Issues

1. **"Provider not initialized"**
   - Check that the blockchain service is properly imported
   - Ensure the provider is initialized in the constructor

2. **"Wallet not connected"**
   - Make sure MetaMask is installed and unlocked
   - Check that the user approved the connection

3. **"Wrong network"**
   - The app will automatically prompt to switch to Fuji testnet
   - If not, manually add Fuji testnet to MetaMask

4. **"Insufficient funds"**
   - Ensure the test wallet has enough AVAX for gas fees
   - Get more test AVAX from the faucet

5. **"Contract not found"**
   - Verify contract addresses are correct
   - Ensure contracts were deployed successfully

### Getting Help
- Check the browser console for detailed error messages
- Verify contract deployment on Snowtrace testnet
- Ensure all environment variables are set correctly

## 🎯 Next Steps

After successful deployment and testing:

1. **Production Deployment**
   - Deploy to Avalanche mainnet
   - Use real USDC token address
   - Set up proper multisig governance

2. **Security Audit**
   - Conduct smart contract security audit
   - Implement additional safety measures

3. **Monitoring**
   - Set up blockchain event monitoring
   - Implement transaction tracking

4. **User Experience**
   - Add transaction status indicators
   - Implement error handling and user feedback

---

**🎉 Congratulations!** You now have a fully functional L1 testnet integration with Avalanche Fuji!

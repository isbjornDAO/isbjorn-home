#!/bin/bash

# Deploy Iggy L1 Subnet script
# Requires avalanche-cli installed

echo "🚀 Starting Iggy L1 Subnet Deployment..."

# Check if avalanche-cli is installed
if ! command -v avalanche &> /dev/null; then
    echo "❌ avalanche-cli could not be found. Please install it first."
    exit 1
fi

SUBNET_NAME="IggyL1"
CHAIN_ID=99999
TOKEN_SYMBOL="IGGY"

echo "📦 Creating subnet configuration for $SUBNET_NAME..."

# Create subnet
avalanche subnet create $SUBNET_NAME \
    --force \
    --custom \
    --chainId $CHAIN_ID \
    --tokenSymbol $TOKEN_SYMBOL \
    --file ./smart-contracts/genesis.json

if [ $? -eq 0 ]; then
    echo "✅ Subnet configuration created successfully."
else
    echo "❌ Failed to create subnet configuration."
    exit 1
fi

echo "🚀 Deploying subnet to local network..."

# Deploy subnet
avalanche subnet deploy $SUBNET_NAME \
    --local \
    --avalanchego-version v1.10.18

if [ $? -eq 0 ]; then
    echo "✅ Subnet deployed successfully!"
    echo "📋 Network details:"
    avalanche subnet list
else
    echo "❌ Failed to deploy subnet."
    exit 1
fi

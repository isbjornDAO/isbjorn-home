#!/bin/bash

# Function to clean npm cache and node_modules
clean_node_environment() {
    echo "🧹 Cleaning npm cache..."
    npm cache clean --force
    
    echo "🗑️  Removing node_modules directory..."
    rm -rf node_modules
    
    echo "🗑️  Removing package-lock.json..."
    rm -f package-lock.json
    
    echo "♻️  Clearing npm cache verify..."
    npm cache verify
    
    echo "📦 Reinstalling dependencies..."
    npm install
    
    echo "✨ Environment cleanup complete!"
}

# Function to check file system integrity
check_fs_integrity() {
    echo "🔍 Checking for file system corruption in node_modules..."
    find node_modules -type f -exec file {} \; | grep -i "corrupt"
}

# Main execution
echo "=== Node.js Development Environment Cleanup ==="
echo "This script will:"
echo "1. Clean npm cache"
echo "2. Remove node_modules and package-lock.json"
echo "3. Verify npm cache"
echo "4. Reinstall dependencies"
echo "5. Check for file corruption"

read -p "Do you want to proceed? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]
then
    clean_node_environment
    check_fs_integrity
fi
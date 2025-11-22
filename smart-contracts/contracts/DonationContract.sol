// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

interface INodeRegistry {
    function registerNode(address operator, uint256 amount) external returns (uint256);
}

interface IERC8004 {
    function hasRole(bytes32 role, address account) external view returns (bool);
}

contract DonationContract is ReentrancyGuard, Ownable, Pausable {
    // Events
    event DonationReceived(address indexed donor, uint256 amount, string businessId, uint256 timestamp);
    event ValidatorFunded(uint256 indexed nodeId, uint256 amount, uint256 timestamp);
    event TaxReceiptRequested(address indexed donor, uint256 amount, string businessId);

    // State variables
    INodeRegistry public nodeRegistry;
    IERC8004 public identityRegistry;
    
    uint256 public constant VALIDATOR_COST = 2000 ether; // 2,000 AVAX
    uint256 public validatorPool;
    
    mapping(address => uint256) public donorBalances;
    mapping(address => string) public donorBusinessIds;

    constructor(address _nodeRegistry, address _identityRegistry) {
        nodeRegistry = INodeRegistry(_nodeRegistry);
        identityRegistry = IERC8004(_identityRegistry);
    }

    /**
     * @dev Main donation function. Accepts AVAX and records the donation.
     * @param businessId The unique identifier for the business (for tax receipts).
     */
    function donate(string calldata businessId) external payable nonReentrant whenNotPaused {
        require(msg.value > 0, "Donation must be greater than 0");
        
        // Update balances
        donorBalances[msg.sender] += msg.value;
        donorBusinessIds[msg.sender] = businessId;
        validatorPool += msg.value;
        
        // Emit events
        emit DonationReceived(msg.sender, msg.value, businessId, block.timestamp);
        emit TaxReceiptRequested(msg.sender, msg.value, businessId);
        
        // Check if we can fund a new validator
        if (validatorPool >= VALIDATOR_COST) {
            _deployValidator();
        }
    }

    /**
     * @dev Internal function to deploy a validator when the pool is full.
     */
    function _deployValidator() internal {
        // In a real scenario, this would interact with the P-Chain or a liquid staking contract.
        // Here we mock it by calling our NodeRegistry.
        
        uint256 amountToDeploy = VALIDATOR_COST;
        validatorPool -= amountToDeploy;
        
        // Register the node (mock ID returned)
        uint256 nodeId = nodeRegistry.registerNode(address(this), amountToDeploy);
        
        emit ValidatorFunded(nodeId, amountToDeploy, block.timestamp);
    }

    // Admin functions
    function setNodeRegistry(address _nodeRegistry) external onlyOwner {
        nodeRegistry = INodeRegistry(_nodeRegistry);
    }

    function setIdentityRegistry(address _identityRegistry) external onlyOwner {
        identityRegistry = IERC8004(_identityRegistry);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }
    
    function withdraw() external onlyOwner {
        (bool success, ) = payable(owner()).call{value: address(this).balance}("");
        require(success, "Transfer failed");
    }
}

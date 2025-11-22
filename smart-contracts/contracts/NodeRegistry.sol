// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";

contract NodeRegistry is Ownable {
    struct ValidatorNode {
        uint256 id;
        address operator;
        uint256 stakeAmount;
        uint256 deployTime;
        bool isActive;
        uint256 totalRewards;
    }

    ValidatorNode[] public nodes;
    mapping(address => uint256[]) public operatorNodes;

    event NodeRegistered(uint256 indexed nodeId, address indexed operator, uint256 stakeAmount);
    event RewardsUpdated(uint256 indexed nodeId, uint256 newRewards);

    /**
     * @dev Registers a new validator node.
     * @param operator The address operating the node (usually DonationContract).
     * @param amount The amount staked.
     */
    function registerNode(address operator, uint256 amount) external returns (uint256) {
        uint256 nodeId = nodes.length;
        
        nodes.push(ValidatorNode({
            id: nodeId,
            operator: operator,
            stakeAmount: amount,
            deployTime: block.timestamp,
            isActive: true,
            totalRewards: 0
        }));
        
        operatorNodes[operator].push(nodeId);
        
        emit NodeRegistered(nodeId, operator, amount);
        
        return nodeId;
    }

    /**
     * @dev Updates the rewards for a specific node (mocking oracle data).
     */
    function updateRewards(uint256 nodeId, uint256 rewards) external onlyOwner {
        require(nodeId < nodes.length, "Invalid node ID");
        nodes[nodeId].totalRewards += rewards;
        emit RewardsUpdated(nodeId, nodes[nodeId].totalRewards);
    }

    function getNodeCount() external view returns (uint256) {
        return nodes.length;
    }

    function getNodesByOperator(address operator) external view returns (uint256[] memory) {
        return operatorNodes[operator];
    }
}

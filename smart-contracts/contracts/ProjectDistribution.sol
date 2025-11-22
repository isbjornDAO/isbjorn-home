// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract ProjectDistribution is ReentrancyGuard, Pausable, AccessControl {
    using SafeERC20 for IERC20;
    
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant DISTRIBUTOR_ROLE = keccak256("DISTRIBUTOR_ROLE");
    
    uint256 private _distributionIds;
    
    IERC20 public immutable usdcToken;
    address public treasury;
    
    struct Project {
        string id;
        string name;
        address walletAddress;
        bool isActive;
        uint256 totalReceived;
        uint256 totalDistributed;
        uint256 pendingAmount;
    }
    
    struct Distribution {
        uint256 id;
        string projectId;
        address projectAddress;
        uint256 amount;
        uint256 timestamp;
        string reason;
        bool executed;
    }
    
    struct Milestone {
        string projectId;
        string title;
        uint256 targetAmount;
        uint256 achievedAmount;
        uint256 releaseAmount;
        bool completed;
        bool distributed;
    }
    
    mapping(string => Project) public projects;
    mapping(uint256 => Distribution) public distributions;
    mapping(string => Milestone[]) public projectMilestones;
    mapping(string => bool) public projectExists;
    
    string[] public projectIds;
    uint256 public totalProjectCount;
    uint256 public totalDistributed;
    uint256 public totalPending;
    
    event ProjectRegistered(
        string indexed projectId,
        string name,
        address indexed walletAddress
    );
    
    event FundsReceived(
        string indexed projectId,
        uint256 amount,
        address indexed from
    );
    
    event FundsDistributed(
        uint256 indexed distributionId,
        string indexed projectId,
        address indexed projectAddress,
        uint256 amount,
        string reason
    );
    
    event MilestoneCompleted(
        string indexed projectId,
        string title,
        uint256 releaseAmount
    );
    
    event ProjectDeactivated(string indexed projectId);
    event TreasuryUpdated(address indexed oldTreasury, address indexed newTreasury);
    
    constructor(
        address _usdcToken,
        address _treasury,
        address _admin
    ) {
        require(_usdcToken != address(0), "ProjectDistribution: Invalid USDC token");
        require(_treasury != address(0), "ProjectDistribution: Invalid treasury");
        require(_admin != address(0), "ProjectDistribution: Invalid admin");
        
        usdcToken = IERC20(_usdcToken);
        treasury = _treasury;
        
        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(ADMIN_ROLE, _admin);
        _grantRole(DISTRIBUTOR_ROLE, _admin);
    }
    
    function registerProject(
        string memory projectId,
        string memory name,
        address walletAddress
    ) external onlyRole(ADMIN_ROLE) {
        require(bytes(projectId).length > 0, "ProjectDistribution: Invalid project ID");
        require(bytes(name).length > 0, "ProjectDistribution: Invalid project name");
        require(walletAddress != address(0), "ProjectDistribution: Invalid wallet address");
        require(!projectExists[projectId], "ProjectDistribution: Project already exists");
        
        projects[projectId] = Project({
            id: projectId,
            name: name,
            walletAddress: walletAddress,
            isActive: true,
            totalReceived: 0,
            totalDistributed: 0,
            pendingAmount: 0
        });
        
        projectExists[projectId] = true;
        projectIds.push(projectId);
        totalProjectCount++;
        
        emit ProjectRegistered(projectId, name, walletAddress);
    }
    
    function receiveFunds(string memory projectId, uint256 amount) 
        external 
        onlyRole(DISTRIBUTOR_ROLE) 
        whenNotPaused 
    {
        require(projectExists[projectId], "ProjectDistribution: Project not found");
        require(amount > 0, "ProjectDistribution: Amount must be greater than 0");
        
        Project storage project = projects[projectId];
        require(project.isActive, "ProjectDistribution: Project is not active");
        
        project.totalReceived += amount;
        project.pendingAmount += amount;
        totalPending += amount;
        
        emit FundsReceived(projectId, amount, msg.sender);
        
        _checkAndProcessMilestones(projectId);
    }
    
    function distributeFunds(
        string memory projectId,
        uint256 amount,
        string memory reason
    ) external onlyRole(DISTRIBUTOR_ROLE) whenNotPaused nonReentrant {
        require(projectExists[projectId], "ProjectDistribution: Project not found");
        require(amount > 0, "ProjectDistribution: Amount must be greater than 0");
        
        Project storage project = projects[projectId];
        require(project.isActive, "ProjectDistribution: Project is not active");
        require(project.pendingAmount >= amount, "ProjectDistribution: Insufficient pending funds");
        
        uint256 contractBalance = usdcToken.balanceOf(address(this));
        require(contractBalance >= amount, "ProjectDistribution: Insufficient contract balance");
        
        _distributionIds++;
        uint256 distributionId = _distributionIds;
        
        distributions[distributionId] = Distribution({
            id: distributionId,
            projectId: projectId,
            projectAddress: project.walletAddress,
            amount: amount,
            timestamp: block.timestamp,
            reason: reason,
            executed: false
        });
        
        project.pendingAmount -= amount;
        project.totalDistributed += amount;
        totalPending -= amount;
        totalDistributed += amount;
        
        usdcToken.safeTransfer(project.walletAddress, amount);
        
        distributions[distributionId].executed = true;
        
        emit FundsDistributed(
            distributionId,
            projectId,
            project.walletAddress,
            amount,
            reason
        );
    }
    
    function addMilestone(
        string memory projectId,
        string memory title,
        uint256 targetAmount,
        uint256 releaseAmount
    ) external onlyRole(ADMIN_ROLE) {
        require(projectExists[projectId], "ProjectDistribution: Project not found");
        require(targetAmount > 0, "ProjectDistribution: Target amount must be greater than 0");
        require(releaseAmount > 0, "ProjectDistribution: Release amount must be greater than 0");
        
        projectMilestones[projectId].push(Milestone({
            projectId: projectId,
            title: title,
            targetAmount: targetAmount,
            achievedAmount: 0,
            releaseAmount: releaseAmount,
            completed: false,
            distributed: false
        }));
    }
    
    function _checkAndProcessMilestones(string memory projectId) internal {
        Milestone[] storage milestones = projectMilestones[projectId];
        Project storage project = projects[projectId];
        
        for (uint i = 0; i < milestones.length; i++) {
            Milestone storage milestone = milestones[i];
            
            if (!milestone.completed && 
                project.totalReceived >= milestone.targetAmount) {
                milestone.completed = true;
                milestone.achievedAmount = project.totalReceived;
                
                emit MilestoneCompleted(
                    projectId,
                    milestone.title,
                    milestone.releaseAmount
                );
                
                if (!milestone.distributed && project.pendingAmount >= milestone.releaseAmount) {
                    _autoDistribute(projectId, milestone.releaseAmount, 
                        string(abi.encodePacked("Milestone: ", milestone.title)));
                    milestone.distributed = true;
                }
            }
        }
    }
    
    function _autoDistribute(
        string memory projectId,
        uint256 amount,
        string memory reason
    ) internal {
        Project storage project = projects[projectId];
        uint256 contractBalance = usdcToken.balanceOf(address(this));
        
        if (contractBalance >= amount && project.pendingAmount >= amount) {
            _distributionIds++;
            uint256 distributionId = _distributionIds;
            
            distributions[distributionId] = Distribution({
                id: distributionId,
                projectId: projectId,
                projectAddress: project.walletAddress,
                amount: amount,
                timestamp: block.timestamp,
                reason: reason,
                executed: true
            });
            
            project.pendingAmount -= amount;
            project.totalDistributed += amount;
            totalPending -= amount;
            totalDistributed += amount;
            
            usdcToken.safeTransfer(project.walletAddress, amount);
            
            emit FundsDistributed(
                distributionId,
                projectId,
                project.walletAddress,
                amount,
                reason
            );
        }
    }
    
    function getProjectDetails(string memory projectId) 
        external 
        view 
        returns (Project memory) 
    {
        require(projectExists[projectId], "ProjectDistribution: Project not found");
        return projects[projectId];
    }
    
    function getProjectMilestones(string memory projectId) 
        external 
        view 
        returns (Milestone[] memory) 
    {
        return projectMilestones[projectId];
    }
    
    function getAllProjects() external view returns (string[] memory) {
        return projectIds;
    }
    
    function deactivateProject(string memory projectId) 
        external 
        onlyRole(ADMIN_ROLE) 
    {
        require(projectExists[projectId], "ProjectDistribution: Project not found");
        projects[projectId].isActive = false;
        emit ProjectDeactivated(projectId);
    }
    
    function updateTreasury(address newTreasury) 
        external 
        onlyRole(ADMIN_ROLE) 
    {
        require(newTreasury != address(0), "ProjectDistribution: Invalid treasury");
        address oldTreasury = treasury;
        treasury = newTreasury;
        emit TreasuryUpdated(oldTreasury, newTreasury);
    }
    
    function emergencyWithdraw(address to, uint256 amount) 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
        nonReentrant 
    {
        require(to != address(0), "ProjectDistribution: Invalid recipient");
        uint256 balance = usdcToken.balanceOf(address(this));
        require(balance >= amount, "ProjectDistribution: Insufficient balance");
        
        usdcToken.safeTransfer(to, amount);
    }
    
    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
    }
    
    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }
    
    function supportsInterface(bytes4 interfaceId) 
        public 
        view 
        override(AccessControl) 
        returns (bool) 
    {
        return super.supportsInterface(interfaceId);
    }
}
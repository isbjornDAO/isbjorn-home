// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract DonationTracker is ReentrancyGuard, Pausable, AccessControl {
    
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");
    
    uint256 private _donationIds;
    
    struct Donation {
        uint256 id;
        string donationId;
        address donor;
        address projectAddress;
        uint256 amount;
        uint256 timestamp;
        string projectName;
        string companyName;
        bool verified;
    }
    
    mapping(uint256 => Donation) public donations;
    mapping(string => uint256) public donationIdToIndex;
    mapping(address => uint256[]) public donorDonations;
    mapping(address => uint256) public projectTotalReceived;
    
    uint256 public totalDonationsTracked;
    uint256 public totalAmountTracked;
    
    event DonationRecorded(
        uint256 indexed id,
        string indexed donationId,
        address indexed donor,
        address projectAddress,
        uint256 amount,
        string projectName,
        string companyName
    );
    
    event DonationVerified(uint256 indexed id, string indexed donationId);
    event ProjectFunded(address indexed projectAddress, uint256 amount);
    
    constructor(address admin) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(ADMIN_ROLE, admin);
        _grantRole(OPERATOR_ROLE, admin);
    }
    
    function recordDonation(
        string memory donationId,
        address donor,
        address projectAddress,
        uint256 amount,
        string memory projectName,
        string memory companyName
    ) external onlyRole(OPERATOR_ROLE) whenNotPaused nonReentrant {
        require(bytes(donationId).length > 0, "DonationTracker: Invalid donation ID");
        require(donor != address(0), "DonationTracker: Invalid donor address");
        require(projectAddress != address(0), "DonationTracker: Invalid project address");
        require(amount > 0, "DonationTracker: Amount must be greater than 0");
        require(donationIdToIndex[donationId] == 0, "DonationTracker: Donation already recorded");
        
        _donationIds++;
        uint256 newId = _donationIds;
        
        donations[newId] = Donation({
            id: newId,
            donationId: donationId,
            donor: donor,
            projectAddress: projectAddress,
            amount: amount,
            timestamp: block.timestamp,
            projectName: projectName,
            companyName: companyName,
            verified: false
        });
        
        donationIdToIndex[donationId] = newId;
        donorDonations[donor].push(newId);
        projectTotalReceived[projectAddress] += amount;
        
        totalDonationsTracked++;
        totalAmountTracked += amount;
        
        emit DonationRecorded(
            newId,
            donationId,
            donor,
            projectAddress,
            amount,
            projectName,
            companyName
        );
    }
    
    function verifyDonation(string memory donationId) 
        external 
        onlyRole(OPERATOR_ROLE) 
        whenNotPaused 
    {
        uint256 id = donationIdToIndex[donationId];
        require(id > 0, "DonationTracker: Donation not found");
        require(!donations[id].verified, "DonationTracker: Donation already verified");
        
        donations[id].verified = true;
        
        emit DonationVerified(id, donationId);
    }
    
    function getDonationById(string memory donationId) 
        external 
        view 
        returns (Donation memory) 
    {
        uint256 id = donationIdToIndex[donationId];
        require(id > 0, "DonationTracker: Donation not found");
        return donations[id];
    }
    
    function getDonationsByDonor(address donor) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return donorDonations[donor];
    }
    
    function getProjectTotal(address projectAddress) 
        external 
        view 
        returns (uint256) 
    {
        return projectTotalReceived[projectAddress];
    }
    
    function getTotalStats() 
        external 
        view 
        returns (uint256 totalDonations, uint256 totalAmount) 
    {
        return (totalDonationsTracked, totalAmountTracked);
    }
    
    function getDonationsPaginated(uint256 offset, uint256 limit) 
        external 
        view 
        returns (Donation[] memory) 
    {
        require(limit > 0 && limit <= 100, "DonationTracker: Invalid limit");
        
        uint256 totalCount = _donationIds;
        if (offset >= totalCount) {
            return new Donation[](0);
        }
        
        uint256 end = offset + limit;
        if (end > totalCount) {
            end = totalCount;
        }
        
        Donation[] memory result = new Donation[](end - offset);
        for (uint256 i = offset; i < end; i++) {
            result[i - offset] = donations[i + 1];
        }
        
        return result;
    }
    
    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
    }
    
    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }
    
    function grantOperatorRole(address account) external onlyRole(ADMIN_ROLE) {
        grantRole(OPERATOR_ROLE, account);
    }
    
    function revokeOperatorRole(address account) external onlyRole(ADMIN_ROLE) {
        revokeRole(OPERATOR_ROLE, account);
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
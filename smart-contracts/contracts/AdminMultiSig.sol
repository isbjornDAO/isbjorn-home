// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract AdminMultiSig is ReentrancyGuard {
    uint256 public constant MAX_OWNERS = 10;
    uint256 public constant MIN_REQUIRED = 2;
    
    uint256 private _transactionIds;
    
    address[] public owners;
    mapping(address => bool) public isOwner;
    uint256 public requiredSignatures;
    
    struct Transaction {
        uint256 id;
        address to;
        uint256 value;
        bytes data;
        bool executed;
        uint256 confirmations;
        uint256 timestamp;
        string description;
    }
    
    mapping(uint256 => Transaction) public transactions;
    mapping(uint256 => mapping(address => bool)) public confirmations;
    
    event OwnerAdded(address indexed owner);
    event OwnerRemoved(address indexed owner);
    event RequirementChanged(uint256 required);
    
    event TransactionSubmitted(
        uint256 indexed transactionId,
        address indexed to,
        uint256 value,
        bytes data,
        string description
    );
    
    event TransactionConfirmed(
        uint256 indexed transactionId,
        address indexed owner
    );
    
    event TransactionRevoked(
        uint256 indexed transactionId,
        address indexed owner
    );
    
    event TransactionExecuted(
        uint256 indexed transactionId,
        address indexed to,
        uint256 value,
        bytes data
    );
    
    modifier onlyOwner() {
        require(isOwner[msg.sender], "AdminMultiSig: Not an owner");
        _;
    }
    
    modifier onlyWallet() {
        require(msg.sender == address(this), "AdminMultiSig: Not wallet");
        _;
    }
    
    modifier transactionExists(uint256 transactionId) {
        require(
            transactions[transactionId].to != address(0),
            "AdminMultiSig: Transaction does not exist"
        );
        _;
    }
    
    modifier notExecuted(uint256 transactionId) {
        require(
            !transactions[transactionId].executed,
            "AdminMultiSig: Transaction already executed"
        );
        _;
    }
    
    modifier notConfirmed(uint256 transactionId) {
        require(
            !confirmations[transactionId][msg.sender],
            "AdminMultiSig: Transaction already confirmed"
        );
        _;
    }
    
    constructor(address[] memory _owners, uint256 _requiredSignatures) {
        require(_owners.length > 0, "AdminMultiSig: Owners required");
        require(
            _requiredSignatures >= MIN_REQUIRED && 
            _requiredSignatures <= _owners.length,
            "AdminMultiSig: Invalid requirement"
        );
        require(_owners.length <= MAX_OWNERS, "AdminMultiSig: Too many owners");
        
        for (uint i = 0; i < _owners.length; i++) {
            address owner = _owners[i];
            require(owner != address(0), "AdminMultiSig: Invalid owner");
            require(!isOwner[owner], "AdminMultiSig: Duplicate owner");
            
            isOwner[owner] = true;
            owners.push(owner);
        }
        
        requiredSignatures = _requiredSignatures;
    }
    
    function submitTransaction(
        address to,
        uint256 value,
        bytes memory data,
        string memory description
    ) external onlyOwner returns (uint256) {
        require(to != address(0), "AdminMultiSig: Invalid destination");
        
        _transactionIds++;
        uint256 transactionId = _transactionIds;
        
        transactions[transactionId] = Transaction({
            id: transactionId,
            to: to,
            value: value,
            data: data,
            executed: false,
            confirmations: 0,
            timestamp: block.timestamp,
            description: description
        });
        
        emit TransactionSubmitted(transactionId, to, value, data, description);
        
        confirmTransaction(transactionId);
        
        return transactionId;
    }
    
    function confirmTransaction(uint256 transactionId)
        public
        onlyOwner
        transactionExists(transactionId)
        notExecuted(transactionId)
        notConfirmed(transactionId)
    {
        confirmations[transactionId][msg.sender] = true;
        transactions[transactionId].confirmations++;
        
        emit TransactionConfirmed(transactionId, msg.sender);
        
        if (isConfirmed(transactionId)) {
            executeTransaction(transactionId);
        }
    }
    
    function revokeConfirmation(uint256 transactionId)
        external
        onlyOwner
        transactionExists(transactionId)
        notExecuted(transactionId)
    {
        require(
            confirmations[transactionId][msg.sender],
            "AdminMultiSig: Transaction not confirmed"
        );
        
        confirmations[transactionId][msg.sender] = false;
        transactions[transactionId].confirmations--;
        
        emit TransactionRevoked(transactionId, msg.sender);
    }
    
    function executeTransaction(uint256 transactionId)
        public
        onlyOwner
        transactionExists(transactionId)
        notExecuted(transactionId)
        nonReentrant
    {
        require(isConfirmed(transactionId), "AdminMultiSig: Not enough confirmations");
        
        Transaction storage txn = transactions[transactionId];
        txn.executed = true;
        
        (bool success, ) = txn.to.call{value: txn.value}(txn.data);
        require(success, "AdminMultiSig: Transaction execution failed");
        
        emit TransactionExecuted(transactionId, txn.to, txn.value, txn.data);
    }
    
    function isConfirmed(uint256 transactionId) public view returns (bool) {
        return transactions[transactionId].confirmations >= requiredSignatures;
    }
    
    function getTransactionCount() external view returns (uint256) {
        return _transactionIds;
    }
    
    function getTransaction(uint256 transactionId)
        external
        view
        returns (Transaction memory)
    {
        return transactions[transactionId];
    }
    
    function getConfirmations(uint256 transactionId)
        external
        view
        returns (address[] memory)
    {
        address[] memory confirmationsArray = new address[](owners.length);
        uint256 count = 0;
        
        for (uint i = 0; i < owners.length; i++) {
            if (confirmations[transactionId][owners[i]]) {
                confirmationsArray[count] = owners[i];
                count++;
            }
        }
        
        address[] memory result = new address[](count);
        for (uint i = 0; i < count; i++) {
            result[i] = confirmationsArray[i];
        }
        
        return result;
    }
    
    function getTransactionsPaginated(uint256 offset, uint256 limit)
        external
        view
        returns (Transaction[] memory)
    {
        require(limit > 0 && limit <= 100, "AdminMultiSig: Invalid limit");
        
        uint256 totalCount = _transactionIds;
        if (offset >= totalCount) {
            return new Transaction[](0);
        }
        
        uint256 end = offset + limit;
        if (end > totalCount) {
            end = totalCount;
        }
        
        Transaction[] memory result = new Transaction[](end - offset);
        for (uint256 i = offset; i < end; i++) {
            result[i - offset] = transactions[i + 1];
        }
        
        return result;
    }
    
    function getOwners() external view returns (address[] memory) {
        return owners;
    }
    
    function addOwner(address owner)
        external
        onlyWallet
    {
        require(owner != address(0), "AdminMultiSig: Invalid owner");
        require(!isOwner[owner], "AdminMultiSig: Owner exists");
        require(owners.length < MAX_OWNERS, "AdminMultiSig: Max owners reached");
        
        isOwner[owner] = true;
        owners.push(owner);
        
        emit OwnerAdded(owner);
    }
    
    function removeOwner(address owner)
        external
        onlyWallet
    {
        require(isOwner[owner], "AdminMultiSig: Not an owner");
        require(owners.length > requiredSignatures, "AdminMultiSig: Cannot remove owner");
        
        isOwner[owner] = false;
        
        for (uint i = 0; i < owners.length; i++) {
            if (owners[i] == owner) {
                owners[i] = owners[owners.length - 1];
                owners.pop();
                break;
            }
        }
        
        emit OwnerRemoved(owner);
    }
    
    function changeRequirement(uint256 _requiredSignatures)
        external
        onlyWallet
    {
        require(
            _requiredSignatures >= MIN_REQUIRED &&
            _requiredSignatures <= owners.length,
            "AdminMultiSig: Invalid requirement"
        );
        
        requiredSignatures = _requiredSignatures;
        
        emit RequirementChanged(_requiredSignatures);
    }
    
    receive() external payable {}
}
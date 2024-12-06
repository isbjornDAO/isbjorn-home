// SPDX-License-Identifier: MIT
pragma solidity =0.6.12;

abstract contract Ownable {
    event OwnershipTransferred(address indexed user, address indexed newOwner);

    address public owner;

    modifier onlyOwner() virtual {
        require(msg.sender == owner, "Ownable: Unauthorized");
        _;
    }

    constructor(address _owner) public {
        require(_owner != address(0), "Ownable: Invalid owner");
        owner = _owner;
        emit OwnershipTransferred(address(0), _owner);
    }

    function transferOwnership(address _owner) public virtual onlyOwner {
        require(_owner != address(0), "Ownable: Invalid owner");
        owner = _owner;
        emit OwnershipTransferred(msg.sender, _owner);
    }

    function revokeOwnership() public virtual onlyOwner {
        owner = address(0);
        emit OwnershipTransferred(msg.sender, address(0));
    }
}

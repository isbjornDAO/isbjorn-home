//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./ERC20.sol";
import "./Ownable.sol";

contract Isbjorn is ERC20, Ownable {
    address public daoAddress;

    constructor() Ownable(msg.sender) ERC20("Isbjorn", "IGGY") {
        daoAddress = address(0x099035EcD2f4B87A0eE282Bd41418fC099C7dfb6);
        uint256 supply = 1_000_000_000 * (10 ** 18);
        _mint(daoAddress, supply);
    }

    receive() external payable {}

    function setDaoAddress(address newAddress) external onlyOwner {
        daoAddress = newAddress;
    }
}

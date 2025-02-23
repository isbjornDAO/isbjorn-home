// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./Clones.sol";
import "./Ownable.sol";
import "./PuppetMinter.sol";

contract PuppetMinterFactory is Ownable {
    address public buyerImplementation;
    address public nftContract;
    address public receiverAddress; // The address where NFTs will be sent
    uint256 public constant mintLimit = 10; // Max mint per address

    constructor(
        address _nftContract,
        address _receiverAddress
    ) Ownable(msg.sender) {
        nftContract = _nftContract;
        receiverAddress = _receiverAddress;
        buyerImplementation = address(new PuppetMinter());
    }

    // Set the receiver address
    function setReceiverAddress(address _receiverAddress) external onlyOwner {
        receiverAddress = _receiverAddress;
    }

    // Deploys multiple buyer contracts until NFTs are bought
    function deployBuyers(uint32 count) external onlyOwner {
        uint32 minted = 0;

        while (minted < count) {
            uint32 remaining = count - minted;
            uint32 mintAmount = remaining >= 10 ? 10 : remaining;

            address buyer = Clones.clone(buyerImplementation);
            PuppetMinter(buyer).initialize(nftContract, receiverAddress); // Call initialize on the clone
            PuppetMinter(buyer).mint(mintAmount); // Pass mintAmount as the parameter

            minted += mintAmount;
        }
    }
}

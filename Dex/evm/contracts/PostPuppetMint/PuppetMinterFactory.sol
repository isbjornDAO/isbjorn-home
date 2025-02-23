// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./Ownable.sol";
import "./PuppetMinter.sol";

contract PuppetMinterFactory is Ownable {
    address public nftContract =
        address(0xc1a5507194a1e70c35678f53c48c3934abbcc140);
    address public receiverAddress =
        address(0x099035EcD2f4B87A0eE282Bd41418fC099C7dfb6); // The address where NFTs will be sent
    uint256 public constant mintLimit = 10; // Max mint per address

    constructor() Ownable(msg.sender) {}

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

            PuppetMinter minter = new PuppetMinter();
            minter.initialize(nftContract, receiverAddress);
            require(minter.receiverAddress() == receiverAddress, "Init failed");

            uint256 beforeSupply = IPuppets(nftContract).totalSupply();
            minter.mint(mintAmount);
            uint256 afterSupply = IPuppets(nftContract).totalSupply();
            require(afterSupply == beforeSupply + mintAmount, "Mint failed");

            minted += mintAmount;
        }
    }

    function rescuePuppet(
        address puppetMinter,
        uint256 tokenId
    ) external onlyOwner {
        PuppetMinter minter = PuppetMinter(puppetMinter);
        minter.rescuePuppet(tokenId);
    }
}

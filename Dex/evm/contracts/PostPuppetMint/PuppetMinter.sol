// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./IPuppets.sol";
import "./Ownable.sol";

contract PuppetMinter is Ownable {
    IPuppets public puppets;
    address public receiverAddress;

    // Constructor is removed
    constructor() Ownable(msg.sender) {}

    // Initialize function to replace constructor for cloned instances
    function initialize(
        address _nftContract,
        address _receiverAddress
    ) external onlyOwner {
        puppets = IPuppets(_nftContract);
        receiverAddress = _receiverAddress;
    }

    // Mint and send NFTs to receiver address
    function mint(uint32 amount) external {
        uint256 startTokenId = puppets.totalSupply() + 1;
        puppets.publicMint(amount, IPuppets.MintPhase.P4);

        // Transfer the minted NFTs to receiver address
        for (uint256 i = 0; i < amount; i++) {
            uint256 tokenId = startTokenId + i;
            puppets.transferFrom(address(this), receiverAddress, tokenId);
        }
    }

    function rescuePuppet(uint256 tokenId) external onlyOwner {
        puppets.transferFrom(address(this), receiverAddress, tokenId);
    }
}

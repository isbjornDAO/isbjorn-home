// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import "./IERC721.sol";

contract PuppetDropper {
    IERC721 public puppets =
        IERC721(address(0xc1a5507194a1E70C35678f53c48C3934AbbCc140));

    function executeAirdrop(
        uint256 startTokenId,
        address[] calldata presaleAddresses,
        uint256[] calldata preSaleNumToDrop
    ) external {
        require(
            presaleAddresses.length == preSaleNumToDrop.length,
            "input size mismatch"
        );
        uint256 nextTokenId = startTokenId;
        for (uint256 i = 0; i < presaleAddresses.length; i++) {
            for (uint256 j = 0; j < preSaleNumToDrop[i]; j++) {
                puppets.safeTransferFrom(
                    msg.sender,
                    presaleAddresses[i],
                    nextTokenId
                );
                nextTokenId++;
            }
        }
    }

    function airDropSingle(address recipient, uint256 tokenId) external {
        puppets.safeTransferFrom(msg.sender, recipient, tokenId);
    }

    function airDropTwoForOne(uint256 startTokenId) external {
        uint256 nextTokenId = startTokenId;
        for (uint256 i = 351; i <= 517; i++) {
            address recipient = puppets.ownerOf(i);
            puppets.safeTransferFrom(msg.sender, recipient, nextTokenId);
            nextTokenId++;
        }
    }
}

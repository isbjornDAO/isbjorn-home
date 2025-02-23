// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import "./IERC721.sol";

contract PuppetDropper {
    IERC721 public puppets =
        IERC721(address(0xc1a5507194a1E70C35678f53c48C3934AbbCc140));

    function executeAirdrop(
        address[] calldata recipients,
        uint256[] calldata numToDrop,
        uint256 startTokenId
    ) external {
        require(recipients.length == numToDrop.length, "input size mismatch");
        uint256 nextTokenId = startTokenId;
        for (uint256 i = 0; i < recipients.length; i++) {
            for (uint256 j = 0; j < numToDrop[i]; j++) {
                puppets.safeTransferFrom(
                    msg.sender,
                    recipients[i],
                    nextTokenId
                );
                nextTokenId++;
            }
        }
    }
}

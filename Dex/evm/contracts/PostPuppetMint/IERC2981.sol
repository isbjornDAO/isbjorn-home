// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts (last updated v5.1.0) (token/common/IERC2981.sol)

pragma solidity ^0.8.20;

import {IERC165} from "./IERC165.sol";

/**
 * @dev Interface for the NFT Royalty Standard, as defined in EIP-2981.
 */
interface IERC2981 is IERC165 {
    /**
     * @dev Returns royalty information for a given tokenId and sale price.
     *
     * @param tokenId The identifier of the token.
     * @param salePrice The sale price of the token.
     * @return receiver The address of the royalty receiver.
     * @return royaltyAmount The royalty amount for the sale.
     */
    function royaltyInfo(
        uint256 tokenId,
        uint256 salePrice
    ) external view returns (address receiver, uint256 royaltyAmount);
}

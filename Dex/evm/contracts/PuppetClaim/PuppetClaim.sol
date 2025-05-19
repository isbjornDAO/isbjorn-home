// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./Ownable.sol";
import "./IERC721.sol";

contract PuppetClaim is Ownable {
    /// The sum of all value ever sent to the contract.
    /// Divide by the number of NFTs to get the total amount each NFT may have claimed.
    uint256 public totalDeposited;

    /// The sum of all value ever claimed across all NFTs.
    uint256 public totalClaimed;

    /// Amount actually claimed by each NFT.
    mapping(uint256 => uint256) public claimedAmountById;

    /// Bonus claim amount by each NFT.
    mapping(uint256 => uint256) public bonusClaimById;

    /// Address for the NFT used to claim.
    IERC721 public nftContract;

    /// Initial index for the ids, generally either 0 or 1.
    uint256 public nftInitialIndex;

    /// Number of NFTs in the collection.
    uint256 public nftTotalSupply;

    /// Are we open for claiming
    bool public paused = false;

    /// The amount claimed for each individual NFT.
    event ClaimPayout(address indexed owner, uint256 tokenId, uint256 amount);

    /// Admin deposit for bonus payouts (contract upgrades, etc)
    event AdminDeposit(uint256 amount);

    /// When the contract is funded, update the running total.
    receive() external payable {
        totalDeposited += msg.value;
    }

    /// Constructor that sets the claim NFT address.
    constructor(
        address _nftAddress,
        uint256 _nftInitialIndex,
        uint256 _nftTotalSupply
    ) Ownable(msg.sender) {
        nftContract = IERC721(_nftAddress);
        nftInitialIndex = _nftInitialIndex;
        nftTotalSupply = _nftTotalSupply;
    }

    function adminDeposit() public payable onlyOwner {
        emit AdminDeposit(msg.value);
    }

    function setBonusClaims(
        uint256[] memory tokenIds,
        uint256[] memory bonusAmounts
    ) public payable onlyOwner {
        require(
            tokenIds.length == bonusAmounts.length,
            "each token needs a bonus"
        );

        uint256 totalBonus;
        for (uint i; i < tokenIds.length; ++i) {
            bonusClaimById[tokenIds[i]] = bonusAmounts[i];
            totalBonus += bonusAmounts[i];
        }

        require(
            totalBonus <= msg.value,
            "didn't send enough AVAX to cover bonuses!"
        );
        emit AdminDeposit(msg.value);
    }

    /// Maximum amount that can be claimed by each NFT.
    function maxClaimPerToken() public view returns (uint256) {
        return totalDeposited / nftTotalSupply;
    }

    /// Very inefficient helper method to figure out what tokens are owned by an address,
    /// intended to be used by the UI via call().
    ///
    /// Will raise an exception if no tokens are owned.
    function ownedTokens(address user) public view returns (uint256[] memory) {
        uint256 ownedAmount = nftContract.balanceOf(user);
        require(ownedAmount > 0, "user does not own any nfts");

        uint256[] memory owned = new uint256[](ownedAmount);
        uint256 slot = 0;
        for (
            uint256 i = nftInitialIndex;
            i < nftTotalSupply + nftInitialIndex;
            ++i
        ) {
            try nftContract.ownerOf(i) returns (address tokenOwner) {
                if (tokenOwner == user) {
                    owned[slot] = i;
                    ++slot;
                }
            } catch {}
        }

        return owned;
    }

    /// Claim all pending rewards for the given tokenIds.
    /// Checks ownership of the tokens to ensure the caller owns them.
    /// Will also revert if nothing can be claimed.
    function claim(uint256[] memory tokenIds) external returns (uint256) {
        require(!paused, "claims are paused!");
        uint256 totalToSend;
        uint256 maxClaim = maxClaimPerToken();

        for (uint i; i < tokenIds.length; ++i) {
            uint256 tokenId = tokenIds[i];
            uint256 maxClaimForToken = maxClaim + bonusClaimById[tokenId];
            uint256 tokenToClaimAmount = maxClaimForToken -
                claimedAmountById[tokenId];
            uint256 tokenAlreadyClaimedAmount = claimedAmountById[tokenId];

            // Deliberately using LTE here; this prevents errors if the amount fetched in the UI is no longer
            // exactly the full amount, e.g. due to additional rake being collected.
            require(
                tokenAlreadyClaimedAmount + tokenToClaimAmount <=
                    maxClaimForToken,
                "attempted to claim more than available"
            );
            require(
                msg.sender == nftContract.ownerOf(tokenId),
                "you do not own this nft"
            );

            claimedAmountById[tokenId] =
                tokenAlreadyClaimedAmount +
                tokenToClaimAmount;
            totalToSend += tokenToClaimAmount;
            emit ClaimPayout(msg.sender, tokenId, tokenToClaimAmount);
        }

        require(
            address(this).balance >= totalToSend,
            "insufficient funds to claim"
        );
        require(totalToSend > 0, "Nothing to claim!");

        totalClaimed += totalToSend;

        (bool success, ) = payable(msg.sender).call{value: totalToSend}("");
        require(success, "failed to send claimed amount");

        return totalToSend;
    }

    /// Returns the amount that each NFT can claim, by token ID.
    function claimableAmount(
        uint256[] memory tokenIds
    ) external view returns (uint256[] memory claimable) {
        claimable = new uint256[](tokenIds.length);
        uint256 maxClaim = maxClaimPerToken();
        for (uint256 i; i < claimable.length; ++i) {
            claimable[i] =
                maxClaim +
                bonusClaimById[tokenIds[i]] -
                claimedAmountById[tokenIds[i]];
        }
        return claimable;
    }

    /// Returns an array of arrays, where each subarray contains the token ID and its claimable amount.
    function claimDetails(
        address user
    ) external view returns (uint256[][] memory) {
        uint256[] memory owned = ownedTokens(user);
        uint256[][] memory details = new uint256[][](owned.length);

        uint256 maxClaim = maxClaimPerToken();
        for (uint256 i; i < owned.length; ++i) {
            details[i] = new uint256[](2);
            details[i][0] = owned[i];
            details[i][1] =
                maxClaim +
                bonusClaimById[owned[i]] -
                claimedAmountById[owned[i]];
        }
        return details;
    }

    /// Withdraws AVAX to contract owner in case of emergency
    function withdrawFunds(uint256 amount) external onlyOwner {
        require(
            address(this).balance >= amount,
            "insufficient funds to withdraw"
        );
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success);
    }
}

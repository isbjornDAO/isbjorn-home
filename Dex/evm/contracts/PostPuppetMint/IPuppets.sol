// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./IERC721.sol";
import "./IERC2981.sol";
import "./IERC20.sol";

interface IPuppets is IERC721, IERC2981 {
    enum MintPhase {
        None,
        WL,
        P1,
        P2,
        P3,
        P4
    }

    struct PhaseDetails {
        uint96 price;
        uint32 startTime;
        uint256 phaseLimit;
    }

    function addToWhitelist(address[] calldata addresses) external;

    function removeFromWhitelist(address[] calldata addresses) external;

    function initPhases(uint32 _startTime) external;

    function setMintActive(bool status) external;

    function setPhaseDetails(
        MintPhase _phase,
        uint96 _price,
        uint32 _startTime,
        uint256 _phaseLimit
    ) external;

    function setRoyaltyReceiver(address royaltyReceiver_) external;

    function setRoyaltyAmount(uint96 royaltyAmount_) external;

    function setBaseURI(string calldata baseURI_) external;

    function setUnrevealURI(string calldata unrevealURI) external;

    function setBaseExtension(string memory newBaseExtension) external;

    function getMaxSupply() external view returns (uint256);

    function getCurrentPhase() external view returns (MintPhase);

    function totalSupply() external view returns (uint256);

    function tokenURI(uint256 tokenId) external view returns (string memory);

    function reveal() external;

    function rescueAvax(uint256 amount) external;

    function rescueERC20(address tokenAddress) external;

    function rescueNFT(address tokenAddress, uint256 tokenId) external;

    function wlMint() external payable;

    function publicMint(uint32 quantity, MintPhase phase) external payable;
}

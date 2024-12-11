// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.6.0 <0.8.0;

import "./IERC20.sol";

interface IRewarder {
    function onJoeReward(address user, uint256 newLpAmount) external;

    function pendingTokens(
        address user
    ) external view returns (uint256 pending);

    function rewardToken() external view returns (IERC20);
}

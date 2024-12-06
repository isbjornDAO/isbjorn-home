// SPDX-License-Identifier: GPL-3.0

pragma solidity =0.6.12;

interface IAchievementTracker {
    function recordSwap(
        address account,
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 amountOut
    ) external;

    function recordAddLiquidity(
        address account,
        address token0,
        address token1,
        uint256 amount0,
        uint256 amount1
    ) external;

    function recordRemoveLiquidity(
        address account,
        address token0,
        address token1,
        uint256 amount0,
        uint256 amount1
    ) external;
}

// SPDX-License-Identifier: GPL-3.0

pragma solidity =0.6.12;

interface IAchievementTracker {
    function recordSwapIn(
        address account,
        address tokenIn,
        uint256 amountIn
    ) external;

    function recordSwapOut(
        address account,
        address tokenOut,
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

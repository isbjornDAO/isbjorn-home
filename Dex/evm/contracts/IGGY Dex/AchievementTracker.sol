// SPDX-License-Identifier: GPL-3.0

pragma solidity =0.6.12;

import "./IAchievementTracker.sol";
import "./Ownable.sol";

contract AchievementTracker is IAchievementTracker, Ownable {
    struct TokenSwapStats {
        uint256 bought;
        uint256 sold;
        uint256 cumulativeVolume;
    }

    struct TokenLiquidityStats {
        uint256 totalSupplied;
        uint256 totalRemoved;
    }

    struct SwapStats {
        uint256 totalSwaps;
        mapping(address => TokenSwapStats) tokenStats;
    }

    struct LiquidityStats {
        uint256 totalLiquidityAdds;
        uint256 totalLiquidityRemovals;
        mapping(address => TokenLiquidityStats) tokenStats;
    }

    // Global Stats
    SwapStats public globalSwapStats;
    LiquidityStats public globalLiquidityStats;

    // Individual Stats
    mapping(address => SwapStats) public userSwapStats;
    mapping(address => LiquidityStats) public userLiquidityStats;

    address public isbjornRouter;

    modifier onlyIsbjorn() {
        require(
            msg.sender == isbjornRouter,
            "AchievementTracker: Unauthorized"
        );
        _;
    }

    constructor() public Ownable(msg.sender) {}

    function setIsbjornRouter(address _isbjbornRouter) external onlyOwner {
        isbjornRouter = _isbjbornRouter;
    }

    function recordSwap(
        address account,
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 amountOut
    ) external override onlyIsbjorn {
        // Update global stats
        globalSwapStats.totalSwaps++;
        globalSwapStats.tokenStats[tokenIn].sold += amountIn;
        globalSwapStats.tokenStats[tokenOut].bought += amountOut;
        globalSwapStats.tokenStats[tokenIn].cumulativeVolume += amountIn;
        globalSwapStats.tokenStats[tokenOut].cumulativeVolume += amountOut;

        // Update user stats
        userSwapStats[account].totalSwaps++;
        userSwapStats[account].tokenStats[tokenIn].sold += amountIn;
        userSwapStats[account].tokenStats[tokenOut].bought += amountOut;
        userSwapStats[account].tokenStats[tokenIn].cumulativeVolume += amountIn;
        userSwapStats[account]
            .tokenStats[tokenOut]
            .cumulativeVolume += amountOut;
    }

    function recordAddLiquidity(
        address account,
        address token0,
        address token1,
        uint256 amount0,
        uint256 amount1
    ) external override onlyIsbjorn {
        globalLiquidityStats.totalLiquidityAdds++;
        globalLiquidityStats.tokenStats[token0].totalSupplied += amount0;
        globalLiquidityStats.tokenStats[token1].totalSupplied += amount1;

        userLiquidityStats[account].totalLiquidityAdds++;
        userLiquidityStats[account].tokenStats[token0].totalSupplied += amount0;
        userLiquidityStats[account].tokenStats[token1].totalSupplied += amount1;
    }

    function recordRemoveLiquidity(
        address account,
        address token0,
        address token1,
        uint256 amount0,
        uint256 amount1
    ) external override onlyIsbjorn {
        globalLiquidityStats.totalLiquidityRemovals++;
        globalLiquidityStats.tokenStats[token0].totalRemoved += amount0;
        globalLiquidityStats.tokenStats[token1].totalRemoved += amount1;

        userLiquidityStats[account].totalLiquidityRemovals++;
        userLiquidityStats[account].tokenStats[token0].totalRemoved += amount0;
        userLiquidityStats[account].tokenStats[token1].totalRemoved += amount1;
    }
}

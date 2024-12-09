// SPDX-License-Identifier: GPL-3.0

pragma solidity =0.6.12;

import "./IAchievementTracker.sol";
import "./Ownable.sol";
import "./SoulBoundAchievements.sol";

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

    SoulboundAchievments public achievements;

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

    function recordSwapIn(
        address account,
        address tokenIn,
        uint256 amountIn
    ) external override onlyIsbjorn {
        globalSwapStats.tokenStats[tokenIn].sold += amountIn;
        globalSwapStats.tokenStats[tokenIn].cumulativeVolume += amountIn;

        userSwapStats[account].tokenStats[tokenIn].sold += amountIn;
        userSwapStats[account].tokenStats[tokenIn].cumulativeVolume += amountIn;
    }

    function recordSwapOut(
        address account,
        address tokenOut,
        uint256 amountOut
    ) external override onlyIsbjorn {
        globalSwapStats.totalSwaps++; //only count on out so no double count
        globalSwapStats.tokenStats[tokenOut].bought += amountOut;
        globalSwapStats.tokenStats[tokenOut].cumulativeVolume += amountOut;

        userSwapStats[account].totalSwaps++; //only count on out so no double count
        userSwapStats[account].tokenStats[tokenOut].bought += amountOut;
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

    function getGlobalTokenSwapStats(
        address token
    )
        external
        view
        returns (uint256 bought, uint256 sold, uint256 cumulativeVolume)
    {
        TokenSwapStats storage stats = globalSwapStats.tokenStats[token];
        return (stats.bought, stats.sold, stats.cumulativeVolume);
    }

    function getGlobalTotalSwaps() external view returns (uint256) {
        return globalSwapStats.totalSwaps;
    }

    function getGlobalTokenLiquidityStats(
        address token
    ) external view returns (uint256 totalSupplied, uint256 totalRemoved) {
        TokenLiquidityStats storage stats = globalLiquidityStats.tokenStats[
            token
        ];
        return (stats.totalSupplied, stats.totalRemoved);
    }

    function getGlobalLiquidityActions()
        external
        view
        returns (uint256 totalAdds, uint256 totalRemovals)
    {
        return (
            globalLiquidityStats.totalLiquidityAdds,
            globalLiquidityStats.totalLiquidityRemovals
        );
    }

    function getUserTokenSwapStats(
        address user,
        address token
    )
        external
        view
        returns (uint256 bought, uint256 sold, uint256 cumulativeVolume)
    {
        TokenSwapStats storage stats = userSwapStats[user].tokenStats[token];
        return (stats.bought, stats.sold, stats.cumulativeVolume);
    }

    function getUserTotalSwaps(address user) external view returns (uint256) {
        return userSwapStats[user].totalSwaps;
    }

    function getUserTokenLiquidityStats(
        address user,
        address token
    ) external view returns (uint256 totalSupplied, uint256 totalRemoved) {
        TokenLiquidityStats storage stats = userLiquidityStats[user].tokenStats[
            token
        ];
        return (stats.totalSupplied, stats.totalRemoved);
    }

    function getUserLiquidityActions(
        address user
    ) external view returns (uint256 totalAdds, uint256 totalRemovals) {
        return (
            userLiquidityStats[user].totalLiquidityAdds,
            userLiquidityStats[user].totalLiquidityRemovals
        );
    }
}

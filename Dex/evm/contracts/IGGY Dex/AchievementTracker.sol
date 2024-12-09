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

    // Global Stats
    SwapStats public globalSwapStats;
    LiquidityStats public globalLiquidityStats;

    // Individual Stats
    mapping(address => SwapStats) public userSwapStats;
    mapping(address => LiquidityStats) public userLiquidityStats;

    address public isbjornRouter;

    SoulboundAchievments public achievements;

    uint256 SWAP_1 = 1; // 1 swap
    uint256 SWAP_10 = 2; // 10 swaps
    uint256 SWAP_100 = 3; // 100 swaps
    uint256 SWAP_1K = 4; // 1,000 swaps
    uint256 SWAP_10K = 5; // 10,000 swaps
    uint256 SWAP_100K = 6; // 100,000 swaps
    uint256 SWAP_1M = 7; // 1,000,000 swaps

    uint256 AVAX_SWAP_VOL_1 = 8; // 1 AVAX swap volume
    uint256 AVAX_SWAP_VOL_10 = 9; // 10 AVAX swap volume
    uint256 AVAX_SWAP_VOL_100 = 10; // 100 AVAX swap volume
    uint256 AVAX_SWAP_VOL_1k = 11; // 1,000 AVAX swap volume
    uint256 AVAX_SWAP_VOL_10k = 12; // 10,000 AVAX swap volume
    uint256 AVAX_SWAP_VOL_100k = 13; // 100,000 AVAX swap volume

    uint256 LIQUIDITY_1 = 101; // First liquidity add
    uint256 LIQUIDITY_10 = 102; // 10 liquidity adds
    uint256 LIQUIDITY_100 = 103; // 100 liquidity adds
    uint256 LIQUIDITY_1K = 104; // 1,000 liquidity adds
    uint256 LIQUIDITY_10K = 105; // 10,000 liquidity adds
    uint256 LIQUIDITY_100K = 106; // 100,000 liquidity adds
    uint256 LIQUIDITY_1M = 107; // 1,000,000 liquidity adds

    uint256 AVAX_LIQ_ADD_1 = 108; // 1 AVAX liquidity added
    uint256 AVAX_LIQ_ADD_10 = 109; // 10 AVAX liquidity added
    uint256 AVAX_LIQ_ADD_100 = 110; // 100 AVAX liquidity added
    uint256 AVAX_LIQ_ADD_1k = 111; // 1,000 AVAX liquidity added
    uint256 AVAX_LIQ_ADD_10k = 112; // 10,000 AVAX liquidity added
    uint256 AVAX_LIQ_ADD_100k = 113; // 100,000 AVAX liquidity added

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
        globalSwapStats.totalSwaps++; //only count on in so no double count
        globalSwapStats.tokenStats[tokenIn].sold += amountIn;
        globalSwapStats.tokenStats[tokenIn].cumulativeVolume += amountIn;

        userSwapStats[account].totalSwaps++; //only count on in so no double count
        userSwapStats[account].tokenStats[tokenIn].sold += amountIn;
        userSwapStats[account].tokenStats[tokenIn].cumulativeVolume += amountIn;

        _checkAndIssueSwapAchievement(account);
    }

    function recordSwapOut(
        address account,
        address tokenOut,
        uint256 amountOut
    ) external override onlyIsbjorn {
        globalSwapStats.tokenStats[tokenOut].bought += amountOut;
        globalSwapStats.tokenStats[tokenOut].cumulativeVolume += amountOut;

        userSwapStats[account].tokenStats[tokenOut].bought += amountOut;
        userSwapStats[account]
            .tokenStats[tokenOut]
            .cumulativeVolume += amountOut;

        _checkAndIssueSwapAchievement(account);
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

        _checkAndIssueLiqAchievement(account);
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

        _checkAndIssueLiqAchievement(account);
    }

    function _checkAndIssueSwapAchievement(address account) private {
        //logic to issue souldbound swap achievments
    }

    function _checkAndIssueLiqAchievement(address account) private {
        //logic to issue souldbound liq achievments
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

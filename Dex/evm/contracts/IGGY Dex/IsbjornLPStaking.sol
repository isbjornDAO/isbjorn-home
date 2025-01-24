// SPDX-License-Identifier: MIT
pragma solidity =0.6.12;
pragma experimental ABIEncoderV2;

import "./Ownable.sol";
import "./ReentrancyGuard.sol";
import "./IERC20.sol";
import "./SafeMath.sol";
import "./Math.sol";

contract IsbjornLPStaking is ReentrancyGuard, Ownable {
    using SafeMath for uint256;

    uint256 public immutable EPOCH_DURATION = 30 days;

    struct StakingPool {
        uint256 totalSupply;
        bool isActive;
        mapping(address => uint256) accumulatedRewardPerShare; // rewardToken => accumulated rewards per share
        mapping(address => uint256) lastUpdateTime; // rewardToken => last update timestamp
        address[] activeRewardTokens;
    }

    struct Epoch {
        uint256 startTime;
        uint256 endTime;
        mapping(address => mapping(address => uint256)) rewardRates; // stakingToken => rewardToken => rate per second
        address[] activePools;
        bool isActive;
    }

    struct UserInfo {
        uint256 balance;
        mapping(address => uint256) rewardDebt; // rewardToken => rewardDebt
        mapping(address => uint256) rewards; // rewardToken => accumulated rewards
    }

    // Global state
    mapping(uint256 => Epoch) public epochs;
    mapping(address => StakingPool) public stakingPools;
    mapping(address => mapping(address => UserInfo)) public userInfo;
    mapping(address => bool) public isStakingToken;
    address[] public stakingTokens;

    uint256 public currentEpoch;
    uint256 public createdEpochs;

    event EpochCreated(uint256 indexed epochNumber, uint256 startTime);
    event PoolCreated(address indexed stakingToken);
    event RewardsConfigured(
        uint256 indexed epochNumber,
        address indexed stakingToken,
        address[] rewardTokens,
        uint256[] rates
    );
    event Staked(
        address indexed user,
        address indexed stakingToken,
        uint256 amount
    );
    event Withdrawn(
        address indexed user,
        address indexed stakingToken,
        uint256 amount
    );
    event RewardPaid(
        address indexed user,
        address indexed stakingToken,
        address indexed rewardToken,
        uint256 reward
    );

    constructor() public Ownable(msg.sender) {
        currentEpoch = 1;
        createdEpochs = 0;
    }

    function createEpoch(uint256 startTime) external onlyOwner {
        require(startTime > block.timestamp, "Start time must be in future");
        if (createdEpochs > 0) {
            require(
                startTime >= epochs[createdEpochs].endTime,
                "Start time must be after previous epoch"
            );
        }

        uint256 epochNumber = createdEpochs + 1;
        Epoch storage epoch = epochs[epochNumber];
        epoch.startTime = startTime;
        epoch.endTime = startTime + EPOCH_DURATION;
        createdEpochs = epochNumber;

        emit EpochCreated(epochNumber, startTime);
    }

    function createStakingPool(address stakingToken) external onlyOwner {
        require(stakingToken != address(0), "Invalid staking token");
        require(!stakingPools[stakingToken].isActive, "Pool already exists");

        StakingPool storage pool = stakingPools[stakingToken];
        pool.isActive = true;
        isStakingToken[stakingToken] = true;
        stakingTokens.push(stakingToken);

        emit PoolCreated(stakingToken);
    }

    function configureEpochRewards(
        uint256 epochNumber,
        address stakingToken,
        address[] calldata rewardTokens,
        uint256[] calldata rewardAmounts
    ) external onlyOwner {
        require(epochNumber <= createdEpochs, "Epoch not created");
        require(stakingPools[stakingToken].isActive, "Pool not active");
        require(
            block.timestamp < epochs[epochNumber].startTime,
            "Epoch already started"
        );
        require(
            rewardTokens.length == rewardAmounts.length,
            "Array length mismatch"
        );

        Epoch storage epoch = epochs[epochNumber];
        StakingPool storage pool = stakingPools[stakingToken];

        // Calculate epoch duration for rate calculation
        uint256 epochDuration = epoch.endTime.sub(epoch.startTime);

        // Update reward rates for the epoch
        for (uint256 i = 0; i < rewardTokens.length; i++) {
            address rewardToken = rewardTokens[i];
            require(rewardToken != address(0), "Invalid reward token");
            require(rewardAmounts[i] > 0, "Invalid reward amount");

            // Transfer rewards to contract
            require(
                IERC20(rewardToken).transferFrom(
                    msg.sender,
                    address(this),
                    rewardAmounts[i]
                ),
                "Failed to transfer reward tokens"
            );

            // Calculate and store rate per second
            uint256 ratePerSecond = rewardAmounts[i].div(epochDuration);
            epoch.rewardRates[stakingToken][rewardToken] = ratePerSecond;

            // Initialize reward tracking if new token
            if (pool.lastUpdateTime[rewardToken] == 0) {
                pool.activeRewardTokens.push(rewardToken);
                pool.lastUpdateTime[rewardToken] = epoch.startTime;
            }
        }

        if (!epoch.isActive) {
            epoch.activePools.push(stakingToken);
            epoch.isActive = true;
        }

        emit RewardsConfigured(
            epochNumber,
            stakingToken,
            rewardTokens,
            rewardAmounts
        );
    }

    function updateRewardAccrual(
        address stakingToken,
        address account
    ) internal {
        StakingPool storage pool = stakingPools[stakingToken];
        if (pool.totalSupply == 0) return;

        uint256 currentEpochNum = getCurrentEpoch();
        if (currentEpochNum == 0) return;

        for (uint256 i = 0; i < pool.activeRewardTokens.length; i++) {
            address rewardToken = pool.activeRewardTokens[i];

            uint256 rate = epochs[currentEpochNum].rewardRates[stakingToken][
                rewardToken
            ];
            if (rate == 0) continue;

            uint256 timestamp = block.timestamp;
            uint256 timeDelta = timestamp.sub(pool.lastUpdateTime[rewardToken]);
            if (timeDelta > 0) {
                uint256 reward = rate.mul(timeDelta);
                uint256 rewardPerShare = reward.mul(1e18).div(pool.totalSupply);
                pool.accumulatedRewardPerShare[rewardToken] = pool
                    .accumulatedRewardPerShare[rewardToken]
                    .add(rewardPerShare);
                pool.lastUpdateTime[rewardToken] = timestamp;
            }

            if (account != address(0)) {
                UserInfo storage user = userInfo[stakingToken][account];
                uint256 pending = user
                    .balance
                    .mul(pool.accumulatedRewardPerShare[rewardToken])
                    .div(1e18)
                    .sub(user.rewardDebt[rewardToken]);
                user.rewards[rewardToken] = user.rewards[rewardToken].add(
                    pending
                );
                user.rewardDebt[rewardToken] = user
                    .balance
                    .mul(pool.accumulatedRewardPerShare[rewardToken])
                    .div(1e18);
            }
        }
    }

    function stake(address stakingToken, uint256 amount) external nonReentrant {
        require(amount > 0, "Cannot stake 0");
        require(stakingPools[stakingToken].isActive, "Pool not active");

        updateRewardAccrual(stakingToken, msg.sender);

        StakingPool storage pool = stakingPools[stakingToken];
        UserInfo storage user = userInfo[stakingToken][msg.sender];

        pool.totalSupply = pool.totalSupply.add(amount);
        user.balance = user.balance.add(amount);

        IERC20(stakingToken).transferFrom(msg.sender, address(this), amount);
        emit Staked(msg.sender, stakingToken, amount);
    }

    function withdraw(
        address stakingToken,
        uint256 amount
    ) public nonReentrant {
        require(amount > 0, "Cannot withdraw 0");
        UserInfo storage user = userInfo[stakingToken][msg.sender];
        require(user.balance >= amount, "Insufficient balance");

        updateRewardAccrual(stakingToken, msg.sender);

        StakingPool storage pool = stakingPools[stakingToken];
        pool.totalSupply = pool.totalSupply.sub(amount);
        user.balance = user.balance.sub(amount);

        IERC20(stakingToken).transfer(msg.sender, amount);
        emit Withdrawn(msg.sender, stakingToken, amount);
    }

    function claimRewards(address stakingToken) public nonReentrant {
        updateRewardAccrual(stakingToken, msg.sender);

        StakingPool storage pool = stakingPools[stakingToken];
        UserInfo storage user = userInfo[stakingToken][msg.sender];

        for (uint256 i = 0; i < pool.activeRewardTokens.length; i++) {
            address rewardToken = pool.activeRewardTokens[i];
            uint256 reward = user.rewards[rewardToken];

            if (reward > 0) {
                user.rewards[rewardToken] = 0;
                IERC20(rewardToken).transfer(msg.sender, reward);
                emit RewardPaid(msg.sender, stakingToken, rewardToken, reward);
            }
        }
    }

    function exit(address stakingToken) external {
        withdraw(stakingToken, userInfo[stakingToken][msg.sender].balance);
        claimRewards(stakingToken);
    }

    function getCurrentEpoch() public view returns (uint256) {
        uint256 timestamp = block.timestamp;

        for (uint256 i = currentEpoch; i <= createdEpochs; i++) {
            if (
                timestamp >= epochs[i].startTime &&
                timestamp < epochs[i].endTime
            ) {
                return i;
            }
        }
        return 0;
    }

    function recoverToken(address token) external onlyOwner {
        require(!isStakingToken[token], "Cannot recover staking token");

        // Check if all configured epochs have passed
        uint256 timestamp = block.timestamp;
        for (uint256 i = 1; i <= createdEpochs; i++) {
            require(
                timestamp > epochs[i].endTime,
                "Cannot recover until all epochs end"
            );
        }

        uint256 balance = IERC20(token).balanceOf(address(this));
        require(balance > 0, "No tokens to recover");
        IERC20(token).transfer(owner, balance);
    }

    // View functions
    function pendingRewards(
        address stakingToken,
        address account,
        address rewardToken
    ) external view returns (uint256) {
        UserInfo storage user = userInfo[stakingToken][account];
        StakingPool storage pool = stakingPools[stakingToken];

        uint256 currentEpochNum = getCurrentEpoch();
        if (currentEpochNum == 0 || pool.totalSupply == 0) {
            return user.rewards[rewardToken];
        }

        uint256 accumulatedRewardPerShare = pool.accumulatedRewardPerShare[
            rewardToken
        ];
        uint256 rate = epochs[currentEpochNum].rewardRates[stakingToken][
            rewardToken
        ];

        if (rate > 0) {
            uint256 timeDelta = block.timestamp.sub(
                pool.lastUpdateTime[rewardToken]
            );
            uint256 reward = rate.mul(timeDelta);
            accumulatedRewardPerShare = accumulatedRewardPerShare.add(
                reward.mul(1e18).div(pool.totalSupply)
            );
        }

        return
            user.rewards[rewardToken].add(
                user.balance.mul(accumulatedRewardPerShare).div(1e18).sub(
                    user.rewardDebt[rewardToken]
                )
            );
    }

    function getStakableTokens() external view returns (address[] memory) {
        return stakingTokens;
    }
}

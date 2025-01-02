// SPDX-License-Identifier: MIT
pragma solidity =0.6.12;
pragma experimental ABIEncoderV2;

import "./Ownable.sol";
import "./ReentrancyGuard.sol";
import "./IERC20.sol";
import "./SafeMath.sol";
import "./Math.sol";

contract IsbjornStaking is ReentrancyGuard, Ownable {
    using SafeMath for uint256;

    uint256 public immutable EPOCH_TIME = 2629800;

    struct EpochReward {
        uint256 amount;
        uint32 weight;
    }

    struct Epoch {
        uint256 startTime;
        mapping(address => mapping(address => EpochReward)) poolRewards; // stakingToken => rewardToken => reward
        address[] stakingTokens;
        address[] rewardTokens;
        bool isActive;
    }

    struct StakingConfig {
        uint256 duration;
        uint256 periodFinish;
        uint256 lastUpdateTime;
        mapping(address => uint256) rewardsPerTokenStored; // rewardToken => rewardsPerTokenStored
        uint256 totalSupply;
        bool isActive;
    }

    struct UserStakingInfo {
        uint256 balance;
        mapping(address => uint256) rewardsPerTokenPaid; // rewardToken => rewardsPerTokenPaid
        mapping(address => uint256) rewards; // rewardToken => rewards
    }

    mapping(uint256 => Epoch) public epochs;
    uint256 public currentEpoch;
    uint256 public totalEpochs;

    mapping(address => StakingConfig) public stakingConfigs;
    mapping(address => mapping(address => UserStakingInfo))
        public userStakingInfo; // stakingToken => user => staking info

    event Deposit(address indexed user, address indexed token, uint256 amount);
    event Withdraw(address indexed user, address indexed token, uint256 amount);
    event RewardClaimed(
        address indexed user,
        address indexed stakingToken,
        address indexed rewardToken,
        uint256 reward
    );
    event EpochConfigured(
        uint256 indexed epochNumber,
        uint256 startTime,
        address[] stakingTokens,
        address[] rewardTokens,
        uint32[][] weights
    );
    event EpochRemoved(uint256 indexed epochNumber);

    constructor() public Ownable(msg.sender) {}

    function getEpochPoolRate(
        uint256 epochNum,
        address stakingToken,
        address rewardToken
    ) public view returns (uint256) {
        Epoch storage epoch = epochs[epochNum];
        if (!epoch.isActive) return 0;

        EpochReward storage reward = epoch.poolRewards[stakingToken][
            rewardToken
        ];
        if (reward.weight == 0) return 0;

        return
            reward.amount.mul(uint256(reward.weight)).div(10000).div(
                EPOCH_TIME
            );
    }

    function getCurrentEpoch() public view returns (uint256) {
        uint256 currentTime = block.timestamp;
        for (uint256 i = currentEpoch; i <= totalEpochs; i++) {
            if (
                epochs[i].isActive &&
                currentTime >= epochs[i].startTime &&
                (i == totalEpochs || currentTime < epochs[i + 1].startTime)
            ) {
                return i;
            }
        }
        return 0;
    }

    function rewardsPerToken(
        address stakingToken,
        address rewardToken
    ) public view returns (uint256) {
        StakingConfig storage config = stakingConfigs[stakingToken];
        if (config.totalSupply == 0)
            return config.rewardsPerTokenStored[rewardToken];

        uint256 epochNum = getCurrentEpoch();
        if (epochNum == 0) return config.rewardsPerTokenStored[rewardToken];

        Epoch storage epoch = epochs[epochNum];
        uint256 endTime = epochNum < totalEpochs
            ? epochs[epochNum + 1].startTime
            : epoch.startTime.add(EPOCH_TIME);

        uint256 timespan = Math.min(block.timestamp, endTime).sub(
            Math.max(config.lastUpdateTime, epoch.startTime)
        );

        uint256 rate = getEpochPoolRate(epochNum, stakingToken, rewardToken);
        return
            config.rewardsPerTokenStored[rewardToken].add(
                timespan.mul(rate).mul(1e18).div(config.totalSupply)
            );
    }

    function earned(
        address account,
        address stakingToken,
        address rewardToken
    ) public view returns (uint256) {
        UserStakingInfo storage userInfo = userStakingInfo[stakingToken][
            account
        ];
        return
            userInfo
                .balance
                .mul(
                    rewardsPerToken(stakingToken, rewardToken).sub(
                        userInfo.rewardsPerTokenPaid[rewardToken]
                    )
                )
                .div(1e18)
                .add(userInfo.rewards[rewardToken]);
    }

    function deposit(
        address stakingToken,
        uint256 amount
    ) external nonReentrant updateReward(msg.sender, stakingToken) {
        require(amount > 0, "Cannot deposit 0");
        require(
            stakingConfigs[stakingToken].isActive,
            "Token not configured for staking"
        );

        uint256 epochNum = getCurrentEpoch();
        require(epochNum > 0, "No active epoch");

        Epoch storage epoch = epochs[epochNum];
        bool validToken = false;
        for (uint256 i = 0; i < epoch.stakingTokens.length; i++) {
            if (epoch.stakingTokens[i] == stakingToken) {
                validToken = true;
                break;
            }
        }
        require(validToken, "Token not in current epoch");

        stakingConfigs[stakingToken].totalSupply = stakingConfigs[stakingToken]
            .totalSupply
            .add(amount);
        userStakingInfo[stakingToken][msg.sender].balance = userStakingInfo[
            stakingToken
        ][msg.sender].balance.add(amount);

        IERC20(stakingToken).transferFrom(msg.sender, address(this), amount);
        emit Deposit(msg.sender, stakingToken, amount);
    }

    function withdraw(
        address stakingToken,
        uint256 amount
    ) public nonReentrant updateReward(msg.sender, stakingToken) {
        require(amount > 0, "Cannot withdraw 0");

        stakingConfigs[stakingToken].totalSupply = stakingConfigs[stakingToken]
            .totalSupply
            .sub(amount);
        userStakingInfo[stakingToken][msg.sender].balance = userStakingInfo[
            stakingToken
        ][msg.sender].balance.sub(amount);

        IERC20(stakingToken).transfer(msg.sender, amount);
        emit Withdraw(msg.sender, stakingToken, amount);
    }

    function claimReward(
        address stakingToken,
        address rewardToken
    ) public nonReentrant updateReward(msg.sender, stakingToken) {
        uint256 reward = earned(msg.sender, stakingToken, rewardToken);
        if (reward > 0) {
            userStakingInfo[stakingToken][msg.sender].rewards[rewardToken] = 0;
            IERC20(rewardToken).transfer(msg.sender, reward);
            emit RewardClaimed(msg.sender, stakingToken, rewardToken, reward);
        }
    }

    function claimAllRewards(address stakingToken) public {
        uint256 epochNum = getCurrentEpoch();
        if (epochNum > 0) {
            Epoch storage epoch = epochs[epochNum];
            for (uint256 i = 0; i < epoch.rewardTokens.length; i++) {
                claimReward(stakingToken, epoch.rewardTokens[i]);
            }
        }
    }

    function exit(address stakingToken) external {
        withdraw(
            stakingToken,
            userStakingInfo[stakingToken][msg.sender].balance
        );
        claimAllRewards(stakingToken);
    }

    function configureEpoch(
        uint256 epochNumber,
        uint256 startTime,
        address[] calldata stakingTokens,
        address[] calldata rewardTokens,
        uint256[][] calldata rewardAmounts,
        uint32[][] calldata weights
    ) external onlyOwner {
        require(startTime > block.timestamp, "Start time must be in future");
        require(
            stakingTokens.length > 0,
            "Must provide at least one staking token"
        );
        require(
            rewardTokens.length > 0,
            "Must provide at least one reward token"
        );
        require(
            stakingTokens.length == weights.length &&
                rewardTokens.length == weights[0].length &&
                stakingTokens.length == rewardAmounts.length &&
                rewardTokens.length == rewardAmounts[0].length,
            "Arrays length mismatch"
        );

        // If not first epoch, ensure sequential configuration
        if (totalEpochs > 0) {
            require(epochNumber > currentEpoch, "Cannot modify past epochs");
            if (epochNumber > 1) {
                require(
                    startTime > epochs[epochNumber - 1].startTime,
                    "Start time must be after previous epoch"
                );
            }
            if (epochs[epochNumber + 1].isActive) {
                require(
                    startTime.add(EPOCH_TIME) <=
                        epochs[epochNumber + 1].startTime,
                    "Would overlap with next epoch"
                );
            }
        }

        // Check reward token balances
        for (uint256 i = 0; i < rewardTokens.length; i++) {
            uint256 totalRewardAmount = 0;
            for (uint256 j = 0; j < rewardAmounts.length; j++) {
                totalRewardAmount = totalRewardAmount.add(rewardAmounts[j][i]);
            }
            require(
                IERC20(rewardTokens[i]).balanceOf(address(this)) >=
                    totalRewardAmount,
                "Insufficient reward token balance"
            );
        }

        // Validate weights
        for (uint256 i = 0; i < stakingTokens.length; i++) {
            uint32 totalWeight = 0;
            for (uint256 j = 0; j < rewardTokens.length; j++) {
                totalWeight = totalWeight + weights[i][j];
            }
            require(totalWeight == 10000, "Weights must sum to 10000");
        }

        Epoch storage epoch = epochs[epochNumber];
        epoch.startTime = startTime;
        epoch.isActive = true;

        // Clear old data
        for (uint256 i = 0; i < epoch.stakingTokens.length; i++) {
            for (uint256 j = 0; j < epoch.rewardTokens.length; j++) {
                delete epoch.poolRewards[epoch.stakingTokens[i]][
                    epoch.rewardTokens[j]
                ];
            }
        }

        delete epoch.stakingTokens;
        delete epoch.rewardTokens;

        // Set new data
        for (uint256 i = 0; i < stakingTokens.length; i++) {
            epoch.stakingTokens.push(stakingTokens[i]);
            stakingConfigs[stakingTokens[i]].isActive = true;
        }

        for (uint256 i = 0; i < rewardTokens.length; i++) {
            epoch.rewardTokens.push(rewardTokens[i]);
        }

        for (uint256 i = 0; i < stakingTokens.length; i++) {
            for (uint256 j = 0; j < rewardTokens.length; j++) {
                epoch.poolRewards[stakingTokens[i]][
                    rewardTokens[j]
                ] = EpochReward({
                    amount: rewardAmounts[i][j],
                    weight: weights[i][j]
                });
            }
        }

        if (epochNumber > totalEpochs) {
            totalEpochs = epochNumber;
        }

        emit EpochConfigured(
            epochNumber,
            startTime,
            stakingTokens,
            rewardTokens,
            weights
        );
    }

    function removeEpoch(uint256 epochNumber) external onlyOwner {
        require(
            epochNumber > currentEpoch,
            "Cannot remove current or past epochs"
        );
        require(epochs[epochNumber].isActive, "Epoch not configured");
        require(
            block.timestamp < epochs[epochNumber].startTime,
            "Epoch already started"
        );

        delete epochs[epochNumber];

        if (epochNumber == totalEpochs) {
            while (epochNumber > 0 && !epochs[epochNumber].isActive) {
                epochNumber--;
            }
            totalEpochs = epochNumber;
        }

        emit EpochRemoved(epochNumber);
    }

    function recoverToken(address token) external onlyOwner {
        uint256 balance = IERC20(token).balanceOf(address(this));
        IERC20(token).transfer(owner, balance);
    }

    modifier updateReward(address account, address stakingToken) {
        StakingConfig storage config = stakingConfigs[stakingToken];
        uint256 epochNum = getCurrentEpoch();

        if (epochNum > 0) {
            Epoch storage epoch = epochs[epochNum];
            for (uint256 i = 0; i < epoch.rewardTokens.length; i++) {
                address rewardToken = epoch.rewardTokens[i];
                config.rewardsPerTokenStored[rewardToken] = rewardsPerToken(
                    stakingToken,
                    rewardToken
                );
            }
        }

        config.lastUpdateTime = block.timestamp;

        if (account != address(0)) {
            UserStakingInfo storage userInfo = userStakingInfo[stakingToken][
                account
            ];
            if (epochNum > 0) {
                Epoch storage epoch = epochs[epochNum];
                for (uint256 i = 0; i < epoch.rewardTokens.length; i++) {
                    address rewardToken = epoch.rewardTokens[i];
                    userInfo.rewards[rewardToken] = earned(
                        account,
                        stakingToken,
                        rewardToken
                    );
                    userInfo.rewardsPerTokenPaid[rewardToken] = config
                        .rewardsPerTokenStored[rewardToken];
                }
            }
        }
        _;
    }
}

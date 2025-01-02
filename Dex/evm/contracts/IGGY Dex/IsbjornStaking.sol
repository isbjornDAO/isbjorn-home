// SPDX-License-Identifier: MIT
pragma solidity =0.6.12;

import "./Ownable.sol";
import "./ReentrancyGuard.sol";
import "./IERC20.sol";
import "./SafeMath.sol";
import "./Math.sol";

contract IsbjornStaking is ReentrancyGuard, Ownable {
    using SafeMath for uint256;

    IERC20 public IGGY;

    uint256 public immutable EPOCH_TIME = 2629800;

    struct Epoch {
        uint256 totalIggyRewards;
        uint256 startTime;
        mapping(address => uint32) poolWeights;
        address[] rewardedTokens;
        bool isActive;
    }

    struct StakingConfig {
        uint256 rate;
        uint256 duration;
        uint256 periodFinish;
        uint256 lastUpdateTime;
        uint256 rewardsPerTokenStored;
        uint256 totalSupply;
        bool isActive;
    }

    struct UserStakingInfo {
        uint256 balance;
        uint256 rewardsPerTokenPaid;
        uint256 rewards;
    }

    mapping(uint256 => Epoch) public epochs;
    uint256 public currentEpoch;
    uint256 public totalEpochs;

    mapping(address => StakingConfig) public stakingConfigs;

    mapping(address => mapping(address => UserStakingInfo))
        public userStakingInfo; // token => user => staking info

    event Deposit(address indexed user, address indexed token, uint256 amount);
    event Withdraw(address indexed user, address indexed token, uint256 amount);
    event RewardClaimed(
        address indexed user,
        address indexed token,
        uint256 reward
    );
    event EpochConfigured(
        uint256 indexed epochNumber,
        uint256 totalRewards,
        uint256 startTime,
        address[] pools,
        uint32[] weights
    );
    event EpochRemoved(uint256 indexed epochNumber);

    constructor(address _rewardToken) public Ownable(msg.sender) {
        IGGY = IERC20(_rewardToken);
    }

    function getEpochPoolRate(
        uint256 epochNum,
        address token
    ) public view returns (uint256) {
        Epoch storage epoch = epochs[epochNum];
        if (!epoch.isActive) return 0;

        uint256 poolWeight = epoch.poolWeights[token];
        if (poolWeight == 0) return 0;

        return
            epoch.totalIggyRewards.mul(uint256(poolWeight)).div(10000).div(
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

    function rewardsPerToken(address token) public view returns (uint256) {
        StakingConfig storage config = stakingConfigs[token];
        if (config.totalSupply == 0) return config.rewardsPerTokenStored;

        uint256 epochNum = getCurrentEpoch();
        if (epochNum == 0) return config.rewardsPerTokenStored;

        Epoch storage epoch = epochs[epochNum];
        uint256 endTime = epochNum < totalEpochs
            ? epochs[epochNum + 1].startTime
            : epoch.startTime.add(EPOCH_TIME);

        uint256 timespan = Math.min(block.timestamp, endTime).sub(
            Math.max(config.lastUpdateTime, epoch.startTime)
        );

        uint256 rate = getEpochPoolRate(epochNum, token);
        return
            config.rewardsPerTokenStored.add(
                timespan.mul(rate).mul(1e18).div(config.totalSupply)
            );
    }

    function earned(
        address account,
        address token
    ) public view returns (uint256) {
        UserStakingInfo storage userInfo = userStakingInfo[token][account];
        return
            userInfo
                .balance
                .mul(rewardsPerToken(token).sub(userInfo.rewardsPerTokenPaid))
                .div(1e18)
                .add(userInfo.rewards);
    }

    function deposit(
        address token,
        uint256 amount
    ) external nonReentrant updateReward(msg.sender, token) {
        require(amount > 0, "Cannot deposit 0");
        require(
            stakingConfigs[token].isActive,
            "Token not configured for staking"
        );

        uint256 epochNum = getCurrentEpoch();
        require(epochNum > 0, "No active epoch");
        require(
            epochs[epochNum].poolWeights[token] > 0,
            "Token not in current epoch"
        );

        stakingConfigs[token].totalSupply = stakingConfigs[token]
            .totalSupply
            .add(amount);
        userStakingInfo[token][msg.sender].balance = userStakingInfo[token][
            msg.sender
        ].balance.add(amount);

        IERC20(token).transferFrom(msg.sender, address(this), amount);
        emit Deposit(msg.sender, token, amount);
    }

    function withdraw(
        address token,
        uint256 amount
    ) public nonReentrant updateReward(msg.sender, token) {
        require(amount > 0, "Cannot withdraw 0");

        stakingConfigs[token].totalSupply = stakingConfigs[token]
            .totalSupply
            .sub(amount);
        userStakingInfo[token][msg.sender].balance = userStakingInfo[token][
            msg.sender
        ].balance.sub(amount);

        IERC20(token).transfer(msg.sender, amount);
        emit Withdraw(msg.sender, token, amount);
    }

    function claimReward(
        address token
    ) public nonReentrant updateReward(msg.sender, token) {
        uint256 reward = earned(msg.sender, token);
        if (reward > 0) {
            userStakingInfo[token][msg.sender].rewards = 0;
            IGGY.transfer(msg.sender, reward);
            emit RewardClaimed(msg.sender, token, reward);
        }
    }

    function exit(address token) external {
        withdraw(token, userStakingInfo[token][msg.sender].balance);
        claimReward(token);
    }

    function configureEpoch(
        uint256 epochNumber,
        uint256 totalRewards,
        uint256 startTime,
        address[] calldata pools,
        uint32[] calldata weights
    ) external onlyOwner {
        require(totalRewards > 0, "Rewards must be greater than 0");
        require(startTime > block.timestamp, "Start time must be in future");
        require(pools.length > 0, "Must provide at least one token");
        require(pools.length == weights.length, "Arrays length mismatch");

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

        require(
            IGGY.balanceOf(address(this)) >= totalRewards,
            "Insufficient IGGY balance"
        );

        uint32 totalWeight;
        for (uint256 i = 0; i < weights.length; i++) {
            totalWeight = totalWeight + weights[i];
            require(weights[i] > 0, "Weight must be greater than 0");

            for (uint256 j = 0; j < i; j++) {
                require(pools[i] != pools[j], "Duplicate pool not allowed");
            }
        }
        require(totalWeight == 10000, "Weights must sum to 10000");

        Epoch storage epoch = epochs[epochNumber];
        epoch.totalIggyRewards = totalRewards;
        epoch.startTime = startTime;
        epoch.isActive = true;

        uint256 oldTokensLength = epoch.rewardedTokens.length;
        for (uint256 i = 0; i < oldTokensLength; i++) {
            address oldToken = epoch.rewardedTokens[i];
            epoch.poolWeights[oldToken] = 0;
        }

        delete epoch.rewardedTokens;
        for (uint256 i = 0; i < pools.length; i++) {
            epoch.rewardedTokens.push(pools[i]);
            epoch.poolWeights[pools[i]] = weights[i];
            stakingConfigs[pools[i]].isActive = true;
        }

        if (epochNumber > totalEpochs) {
            totalEpochs = epochNumber;
        }

        emit EpochConfigured(
            epochNumber,
            totalRewards,
            startTime,
            pools,
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

        // Update totalEpochs if removing the last epoch
        if (epochNumber == totalEpochs) {
            while (epochNumber > 0 && !epochs[epochNumber].isActive) {
                epochNumber--;
            }
            totalEpochs = epochNumber;
        }

        emit EpochRemoved(epochNumber);
    }

    function recoverUnusedIGGY() external onlyOwner {
        uint256 balance = IGGY.balanceOf(address(this));
        IGGY.transfer(owner, balance);
    }

    modifier updateReward(address account, address token) {
        StakingConfig storage config = stakingConfigs[token];
        config.rewardsPerTokenStored = rewardsPerToken(token);
        config.lastUpdateTime = block.timestamp;

        if (account != address(0)) {
            UserStakingInfo storage userInfo = userStakingInfo[token][account];
            userInfo.rewards = earned(account, token);
            userInfo.rewardsPerTokenPaid = config.rewardsPerTokenStored;
        }
        _;
    }
}

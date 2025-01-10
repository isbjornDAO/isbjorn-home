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
    using Math for uint256;

    struct Reward {
        uint256 rewardPerTokenStored; // Accumulated rewards per token
        uint256 queuedRewards; // Total rewards to distribute
        uint256 lastUpdateTime; // Last time rewards were updated
        uint256 periodFinish; // When this reward period ends
        uint256 rewardRate; // Tokens distributed per second
    }

    struct UserStakeInfo {
        uint256 amount; // Amount of tokens staked
        uint256 startTime; // Time when user first staked
    }

    IERC20 public immutable stakingToken;
    uint8 private immutable stakingDecimals;

    // Reward token => Reward info
    mapping(address => Reward) public rewards;
    // User => Reward token => Last stored reward per token
    mapping(address => mapping(address => uint256))
        public userRewardPerTokenPaid;
    // User => Reward token => Unclaimed reward amount
    mapping(address => mapping(address => uint256)) public userRewards;

    mapping(address => bool) public isRewardToken;
    address[] public rewardTokens;

    mapping(address => UserStakeInfo) public userStakes;
    uint256 public totalStaked;

    event Staked(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event RewardAdded(
        uint256 reward,
        address indexed rewardToken,
        uint256 duration
    );
    event RewardPaid(
        address indexed user,
        address indexed rewardToken,
        uint256 reward
    );

    constructor(address _stakingToken) public Ownable(msg.sender) {
        stakingToken = IERC20(_stakingToken);
        stakingDecimals = IERC20(_stakingToken).decimals();
    }

    function updateReward(address account) internal {
        for (uint i = 0; i < rewardTokens.length; i++) {
            address rewardToken = rewardTokens[i];
            Reward storage rewardInfo = rewards[rewardToken];

            if (account != address(0)) {
                userRewards[account][rewardToken] = earned(
                    account,
                    rewardToken
                );
                userRewardPerTokenPaid[account][rewardToken] = rewardPerToken(
                    rewardToken
                );
            }
            rewardInfo.lastUpdateTime = block.timestamp;
        }
    }

    function rewardPerToken(
        address _rewardToken
    ) public view returns (uint256) {
        return rewards[_rewardToken].rewardPerTokenStored;
    }

    function earned(
        address _account,
        address _rewardToken
    ) public view returns (uint256) {
        Reward storage reward = rewards[_rewardToken];

        uint256 endTime = Math.min(block.timestamp, reward.periodFinish);
        uint256 duration = endTime.sub(reward.lastUpdateTime);
        uint256 newRewards = duration.mul(reward.rewardRate);

        if (totalStaked == 0) return 0;

        return newRewards.mul(userStakes[_account].amount).div(totalStaked);
    }

    function queueNewRewards(
        uint256 _amountReward,
        address _rewardToken,
        uint256 _duration
    ) external onlyOwner returns (bool) {
        require(_amountReward > 0, "Cannot queue 0 rewards");
        require(_duration > 0, "Duration must be > 0");

        Reward storage reward = rewards[_rewardToken];

        // If there's an existing reward period
        if (block.timestamp < reward.periodFinish) {
            // Calculate remaining rewards
            uint256 remaining = reward.periodFinish.sub(block.timestamp).mul(
                reward.rewardRate
            );
            // New rate = (remaining + new rewards) / new duration
            reward.rewardRate = (remaining.add(_amountReward)).div(_duration);
        } else {
            reward.rewardRate = _amountReward.div(_duration);
        }

        if (!isRewardToken[_rewardToken]) {
            rewardTokens.push(_rewardToken);
            isRewardToken[_rewardToken] = true;
        }

        reward.lastUpdateTime = block.timestamp;
        reward.periodFinish = block.timestamp.add(_duration);
        reward.queuedRewards = reward.queuedRewards.add(_amountReward);

        require(
            IERC20(_rewardToken).transferFrom(
                msg.sender,
                address(this),
                _amountReward
            ),
            "Transfer failed"
        );

        emit RewardAdded(_amountReward, _rewardToken, _duration);
        return true;
    }

    function stake(uint256 amount) external nonReentrant {
        require(amount > 0, "Cannot stake 0");
        updateReward(msg.sender);

        totalStaked = totalStaked.add(amount);
        UserStakeInfo storage userStake = userStakes[msg.sender];

        if (userStake.amount == 0) {
            userStake.startTime = block.timestamp;
        }
        userStake.amount = userStake.amount.add(amount);

        require(
            stakingToken.transferFrom(msg.sender, address(this), amount),
            "Transfer failed"
        );
        emit Staked(msg.sender, amount);
    }

    function withdraw(uint256 amount) external nonReentrant {
        require(amount > 0, "Cannot withdraw 0");
        require(
            userStakes[msg.sender].amount >= amount,
            "Insufficient balance"
        );

        updateReward(msg.sender);

        totalStaked = totalStaked.sub(amount);
        userStakes[msg.sender].amount = userStakes[msg.sender].amount.sub(
            amount
        );

        require(stakingToken.transfer(msg.sender, amount), "Transfer failed");
        emit Withdrawn(msg.sender, amount);
    }

    function getReward() external nonReentrant {
        updateReward(msg.sender);

        for (uint i = 0; i < rewardTokens.length; i++) {
            address rewardToken = rewardTokens[i];
            uint256 reward = userRewards[msg.sender][rewardToken];
            if (reward > 0) {
                userRewards[msg.sender][rewardToken] = 0;
                require(
                    IERC20(rewardToken).transfer(msg.sender, reward),
                    "Transfer failed"
                );
                emit RewardPaid(msg.sender, rewardToken, reward);
            }
        }
    }

    // View functions
    function getUserStakeInfo(
        address user
    ) external view returns (uint256 stakedAmount, uint256 stakeDuration) {
        UserStakeInfo storage userStake = userStakes[user];
        return (
            userStake.amount,
            userStake.startTime > 0 ? block.timestamp - userStake.startTime : 0
        );
    }

    function getRewardTokens() external view returns (address[] memory) {
        return rewardTokens;
    }
}

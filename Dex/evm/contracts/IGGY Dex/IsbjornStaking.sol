// SPDX-License-Identifier: MIT
pragma solidity =0.6.12;

import "./Ownable.sol";
import "./ReentrancyGuard.sol";
import "./IERC20.sol";
import "./SafeMath.sol";

contract IsbjornStaking is ReentrancyGuard, Ownable {
    using SafeMath for uint256;

    IERC20 public IGGY;

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
    event StakingConfigUpdated(
        address indexed token,
        uint256 rewardRate,
        uint256 duration
    );

    constructor(address _rewardToken) public Ownable(msg.sender) {
        IGGY = IERC20(_rewardToken);
    }

    function getRewardForDuration(
        address token
    ) external view returns (uint256) {
        return stakingConfigs[token].rate.mul(stakingConfigs[token].duration);
    }

    function rewardsPerToken(address token) public view returns (uint256) {
        StakingConfig storage config = stakingConfigs[token];
        if (config.totalSupply == 0) {
            return config.rewardsPerTokenStored;
        }
        return
            config.rewardsPerTokenStored.add(
                lastTimeRewardApplicable(token)
                    .sub(config.lastUpdateTime)
                    .mul(config.rate)
                    .mul(1e18)
                    .div(config.totalSupply)
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

    function lastTimeRewardApplicable(
        address token
    ) public view returns (uint256) {
        return
            block.timestamp < stakingConfigs[token].periodFinish
                ? block.timestamp
                : stakingConfigs[token].periodFinish;
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

    function setStakingConfig(
        address token,
        uint256 rate,
        uint256 duration
    ) external onlyOwner {
        require(
            block.timestamp >= stakingConfigs[token].periodFinish,
            "Previous rewards period must be complete"
        );
        require(rate > 0, "Rate must be greater than 0");
        require(duration > 0, "Duration must be greater than 0");

        uint256 rewardAmount = rate.mul(duration);
        require(
            IGGY.balanceOf(address(this)) >= rewardAmount,
            "Insufficient IGGY balance"
        );

        stakingConfigs[token].rate = rate;
        stakingConfigs[token].duration = duration;
        stakingConfigs[token].periodFinish = block.timestamp.add(duration);
        stakingConfigs[token].lastUpdateTime = block.timestamp;
        stakingConfigs[token].isActive = true;

        emit StakingConfigUpdated(token, rate, duration);
    }

    function recoverUnusedIGGY() external onlyOwner {
        uint256 balance = IGGY.balanceOf(address(this));
        IGGY.transfer(owner, balance);
    }

    modifier updateReward(address account, address token) {
        StakingConfig storage config = stakingConfigs[token];
        config.rewardsPerTokenStored = rewardsPerToken(token);
        config.lastUpdateTime = lastTimeRewardApplicable(token);

        if (account != address(0)) {
            UserStakingInfo storage userInfo = userStakingInfo[token][account];
            userInfo.rewards = earned(account, token);
            userInfo.rewardsPerTokenPaid = config.rewardsPerTokenStored;
        }
        _;
    }
}

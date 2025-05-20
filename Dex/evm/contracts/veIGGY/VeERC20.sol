// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract VeERC20 is ERC20, ReentrancyGuard {
    IERC20 public immutable stakingToken;
    uint8 private immutable _stakingTokenDecimals;

    struct StakeInfo {
        uint256 amount;
        uint256 vePoints;
        uint256 lastUpdate;
    }

    mapping(address => StakeInfo) public stakes;

    constructor(
        address _stakingToken
    )
        ERC20(
            string(
                abi.encodePacked("ve", IERC20Metadata(_stakingToken).name())
            ),
            string(
                abi.encodePacked("ve", IERC20Metadata(_stakingToken).symbol())
            )
        )
    {
        stakingToken = IERC20(_stakingToken);
        _stakingTokenDecimals = IERC20Metadata(_stakingToken).decimals();
    }

    function decimals() public view override returns (uint8) {
        return _stakingTokenDecimals;
    }

    function deposit(uint256 amount) external nonReentrant {
        require(amount > 0, "Cannot deposit nothing");

        StakeInfo storage user = stakes[msg.sender];

        if (user.amount > 0) {
            user.vePoints +=
                (user.amount * (block.timestamp - user.lastUpdate)) /
                1 days;
        }

        user.amount += amount;
        user.lastUpdate = block.timestamp;

        stakingToken.transferFrom(msg.sender, address(this), amount);
    }

    function withdraw(uint256 amount) external nonReentrant {
        require(amount > 0, "Cannot withdraw 0");

        StakeInfo storage user = stakes[msg.sender];
        require(user.amount >= amount, "Insufficient staked");

        user.amount -= amount;
        user.lastUpdate = block.timestamp;
        user.vePoints = 0;

        if (user.amount == 0) {
            user.lastUpdate = 0;
        }

        stakingToken.transfer(msg.sender, amount);
    }

    function withdrawAll() external nonReentrant {
        StakeInfo storage user = stakes[msg.sender];
        require(user.amount > 0, "Nothing to withdraw");

        uint256 amount = user.amount;
        delete stakes[msg.sender];

        stakingToken.transfer(msg.sender, amount);
    }

    function _veBalance(address account) internal view returns (uint256) {
        StakeInfo memory user = stakes[account];
        if (user.amount == 0) return 0;

        uint256 earnedSinceLastUpdate = (user.amount *
            (block.timestamp - user.lastUpdate)) / 1 days;
        uint256 totalVe = user.vePoints + earnedSinceLastUpdate;
        uint256 maxVe = user.amount * 1000;

        return totalVe > maxVe ? maxVe : totalVe;
    }

    function balanceOf(address account) public view override returns (uint256) {
        return _veBalance(account);
    }

    function transfer(address, uint256) public pure override returns (bool) {
        revert("Non-transferable");
    }

    function transferFrom(
        address,
        address,
        uint256
    ) public pure override returns (bool) {
        revert("Non-transferable");
    }

    function approve(address, uint256) public pure override returns (bool) {
        revert("Non-transferable");
    }

    function allowance(
        address,
        address
    ) public pure override returns (uint256) {
        return 0;
    }
}

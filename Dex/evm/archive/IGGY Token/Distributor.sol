// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./IERC20.sol";

interface IDistributor {
    function setDistributionCriteria(
        uint256 minPeriod,
        uint256 minDistribution
    ) external;

    function setShare(address shareholder, uint256 amount) external;

    function deposit(uint256 amount) external;

    function process(uint256 gas) external;
}

contract Distributor is IDistributor {
    address owner;

    struct Share {
        uint256 amount;
        uint256 totalExcluded;
        uint256 totalRealised;
    }

    address rewardToken;

    address[] shareholders;
    mapping(address => uint256) public shareholderIndexes;
    mapping(address => uint256) public shareholderClaims;
    mapping(address => Share) public shares;

    event DistributionCriteriaUpdate(
        uint256 minPeriod,
        uint256 minDistribution
    );
    event NewFundDeposit(uint256 amount);

    uint256 public totalShares;
    uint256 public totalDividends;
    uint256 public totalDistributed;
    uint256 public dividendsPerShare;
    uint256 public constant dividendsPerShareAccuracyFactor = 10 ** 36;

    uint256 public minPeriod = 1800;
    uint256 public minDistribution = 1 * (10 ** 18);

    uint256 currentIndex;

    modifier onlyOwner() {
        require(msg.sender == owner, "!Token");
        _;
    }

    constructor(address _rewardToken) {
        owner = msg.sender;
        rewardToken = _rewardToken;
    }

    receive() external payable {}

    function setDistributionCriteria(
        uint256 _minPeriod,
        uint256 _minDistribution
    ) external override onlyOwner {
        minPeriod = _minPeriod;
        minDistribution = _minDistribution;
        emit DistributionCriteriaUpdate(minPeriod, minDistribution);
    }

    function setShare(
        address shareholder,
        uint256 amount
    ) external override onlyOwner {
        if (shares[shareholder].amount > 0) {
            distributeDividend(shareholder);
        }
        if (amount > 0 && shares[shareholder].amount == 0) {
            addShareholder(shareholder);
        } else if (amount == 0 && shares[shareholder].amount > 0) {
            removeShareholder(shareholder);
        }
        totalShares = totalShares - shares[shareholder].amount + amount;
        shares[shareholder].amount = amount;
        shares[shareholder].totalExcluded = getCumulativeDividends(
            shares[shareholder].amount
        );
    }

    function deposit(uint256 amount) external override onlyOwner {
        totalDividends = totalDividends + amount;
        dividendsPerShare =
            dividendsPerShare +
            (dividendsPerShareAccuracyFactor * amount) /
            totalShares;
        emit NewFundDeposit(amount);
    }

    function process(uint256 gas) external override onlyOwner {
        uint256 shareholderCount = shareholders.length;

        if (shareholderCount == 0) {
            return;
        }

        uint256 gasUsed = 0;
        uint256 gasLeft = gasleft();

        uint256 iterations = 0;

        while (gasUsed < gas && iterations < shareholderCount) {
            if (currentIndex >= shareholderCount) {
                currentIndex = 0;
            }
            if (shouldDistribute(shareholders[currentIndex])) {
                distributeDividend(shareholders[currentIndex]);
            }
            gasUsed = gasUsed + gasLeft - gasleft();
            gasLeft = gasleft();
            currentIndex++;
            iterations++;
        }
    }

    function shouldDistribute(
        address shareholder
    ) internal view returns (bool) {
        return
            (shareholderClaims[shareholder] + minPeriod) < block.timestamp &&
            getUnpaidEarnings(shareholder) > minDistribution;
    }

    function distributeDividend(address shareholder) internal {
        if (shares[shareholder].amount == 0) {
            return;
        }

        uint256 amount = getUnpaidEarnings(shareholder);
        if (amount > 0) {
            IERC20(rewardToken).transfer(shareholder, amount);
            totalDistributed = totalDistributed + amount;
            shareholderClaims[shareholder] = block.timestamp;
            shares[shareholder].totalRealised =
                shares[shareholder].totalRealised +
                amount;
            shares[shareholder].totalExcluded = getCumulativeDividends(
                shares[shareholder].amount
            );
        }
    }

    function claimReflection() external {
        if (shouldDistribute(msg.sender)) {
            distributeDividend(msg.sender);
        }
    }

    function getUnpaidEarnings(
        address shareholder
    ) public view returns (uint256) {
        if (shares[shareholder].amount == 0) {
            return 0;
        }

        uint256 shareholderTotalDividends = getCumulativeDividends(
            shares[shareholder].amount
        );
        uint256 shareholderTotalExcluded = shares[shareholder].totalExcluded;

        if (shareholderTotalDividends <= shareholderTotalExcluded) {
            return 0;
        }
        return shareholderTotalDividends - shareholderTotalExcluded;
    }

    function getCumulativeDividends(
        uint256 share
    ) internal view returns (uint256) {
        return (share * dividendsPerShare) / dividendsPerShareAccuracyFactor;
    }

    function addShareholder(address shareholder) internal {
        shareholderIndexes[shareholder] = shareholders.length;
        shareholders.push(shareholder);
    }

    function removeShareholder(address shareholder) internal {
        shareholders[shareholderIndexes[shareholder]] = shareholders[
            shareholders.length - 1
        ];
        shareholderIndexes[
            shareholders[shareholders.length - 1]
        ] = shareholderIndexes[shareholder];
        shareholders.pop();
    }
}

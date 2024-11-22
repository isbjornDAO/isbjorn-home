//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./ERC20.sol";
import "./Ownable.sol";
import "./IJoe.sol";
import "./Distributor.sol";

contract Isbjorn is ERC20, Ownable {
    uint32 public buyTax;
    uint32 public sellTax;

    uint32 public liquidityBasisPoints;
    uint32 public reflectionBasisPoints;
    uint32 public daoBasisPoints;
    uint32 public burnBasisPoints;

    address public daoRecipientAddress;

    uint256 public taxesFeeTotal;

    uint256 public quasiLPRewarded;
    uint256 public iggySentToDao;
    uint256 public iggyBurned;

    uint256 public swapTokensAtAmount;
    uint256 public distributorGas;

    IJoeRouter public joeRouter;
    address public joePair;

    address public WAVAX;
    address public quasi;
    address public quasiLiquidity;

    address public distributorAddress;
    Distributor public distributor;

    bool private proccessing;

    mapping(address => bool) isDividendExempt;
    mapping(address => bool) public isExcludedFromFee;
    mapping(address => bool) public isAutomatedMarketMakerPairs;

    event AccountExcludeFromFee(address account, bool status);
    event SwapTokensAmountUpdated(uint256 amount);
    event AutomatedMarketMakerPairUpdated(address pair, bool value);
    event TaxUpdated(uint32 buyTax, uint32 sellTax);
    event TaxAllocationUpdated(
        uint32 liquidityBasisPoints,
        uint32 reflectionBasisPoints,
        uint32 daoBasisPoints,
        uint32 burnBasisPoints
    );
    event DaoRecipientAddressUpdated(address daoRecipientAddress);

    constructor(
        address _daoRecipientAddress
    ) Ownable(msg.sender) ERC20("Isbjorn", "IGGY") {
        joeRouter = IJoeRouter(0x60aE616a2155Ee3d9A68541Ba4544862310933d4);

        quasi = address(0xc970D70234895dD6033f984Fd00909623C666e66);
        quasiLiquidity = address(0x117ef430c565DD5c7C53A3Fdc585681CeaF18777);

        WAVAX = joeRouter.WAVAX();

        joePair = IJoeFactory(joeRouter.factory()).createPair(
            address(this),
            WAVAX
        );

        distributor = new Distributor(quasiLiquidity);
        distributorAddress = address(distributor);

        buyTax = 200;
        sellTax = 200;

        // Initial Weights, can be modified after deployment
        liquidityBasisPoints = 2000; // 20% to self LP
        reflectionBasisPoints = 3000; // 30% to holders
        daoBasisPoints = 4500; // 45% to dao
        burnBasisPoints = 500; // 5% to 0xdead

        daoRecipientAddress = _daoRecipientAddress;

        isExcludedFromFee[address(this)] = true;
        isExcludedFromFee[msg.sender] = true;
        isExcludedFromFee[daoRecipientAddress];

        isDividendExempt[address(joePair)] = true;
        isDividendExempt[address(this)] = true;
        isDividendExempt[
            address(0x000000000000000000000000000000000000dEaD)
        ] = true;
        isDividendExempt[
            address(0x0000000000000000000000000000000000000000)
        ] = true;

        isAutomatedMarketMakerPairs[address(joePair)] = true;

        distributorGas = 75000;

        //initial supply
        uint256 supply = 1_000_000_000 * (10 ** 18);
        swapTokensAtAmount = supply / 1000;
        _mint(msg.sender, supply);
    }

    receive() external payable {}

    function excludeFromFee(address account, bool status) external onlyOwner {
        require(
            isExcludedFromFee[account] != status,
            "Account is already the value of 'status'"
        );

        isExcludedFromFee[account] = status;
        emit AccountExcludeFromFee(account, status);
    }

    function setSwapTokensAtAmount(uint256 amount) external onlyOwner {
        require(
            amount <= totalSupply(),
            "Amount cannot be over the total supply."
        );
        swapTokensAtAmount = amount;
        emit SwapTokensAmountUpdated(amount);
    }

    function setAutomatedMarketMakerPair(
        address pair,
        bool value
    ) external onlyOwner {
        require(pair != address(0), "Zero address");

        isAutomatedMarketMakerPairs[address(pair)] = value;
        emit AutomatedMarketMakerPairUpdated(pair, value);
    }

    function _transfer(
        address sender,
        address recipient,
        uint256 amount
    ) internal override {
        uint256 contractTokenBalance = balanceOf(address(this));
        bool canSwap = contractTokenBalance >= swapTokensAtAmount;

        if (canSwap && !proccessing && isAutomatedMarketMakerPairs[recipient]) {
            if (contractTokenBalance >= swapTokensAtAmount) {
                proccessing = true;

                uint256 liquidityTokens = (contractTokenBalance *
                    liquidityBasisPoints) / 10000;
                uint256 daoTokens = (contractTokenBalance * daoBasisPoints) /
                    10000;
                uint256 burnTokens = (contractTokenBalance * burnBasisPoints) /
                    10000;
                uint256 tokensToSwap = contractTokenBalance -
                    liquidityTokens /
                    2 -
                    daoTokens -
                    burnTokens;

                _swapTokensForAvax(tokensToSwap);

                uint256 AvaxBalance = address(this).balance;

                uint256 liquidityAvax = ((AvaxBalance * liquidityBasisPoints) /
                    2) / (liquidityBasisPoints / 2 + reflectionBasisPoints);

                if (liquidityTokens > 0) {
                    _addIggyLiquidity(liquidityTokens / 2, liquidityAvax);
                }

                AvaxBalance = address(this).balance;

                if (AvaxBalance > 0) {
                    _addQuasiLiquidity(AvaxBalance);

                    uint256 quasiLiquidityBalance = IERC20(quasiLiquidity)
                        .balanceOf(address(this));

                    IERC20(quasiLiquidity).transfer(
                        address(distributor),
                        quasiLiquidityBalance
                    );

                    distributor.deposit(quasiLiquidityBalance);
                    quasiLPRewarded += quasiLiquidityBalance;
                }

                if (daoTokens > 0) {
                    this.transfer(daoRecipientAddress, daoTokens);
                    iggySentToDao += daoTokens;
                }

                if (burnTokens > 0) {
                    this.transfer(
                        address(0x000000000000000000000000000000000000dEaD),
                        burnTokens
                    );
                    iggyBurned += burnTokens;
                }

                proccessing = false;
            }
        }

        if (isExcludedFromFee[sender] || isExcludedFromFee[recipient]) {
            super._transfer(sender, recipient, amount);
        } else {
            uint256 allFee = collectFee(
                amount,
                isAutomatedMarketMakerPairs[recipient]
            );
            if (allFee > 0) {
                super._transfer(sender, address(this), allFee);
            }
            super._transfer(sender, recipient, amount - allFee);
        }

        if (!isDividendExempt[sender]) {
            try distributor.setShare(sender, balanceOf(sender)) {} catch {}
        }
        if (!isDividendExempt[recipient]) {
            try
                distributor.setShare(recipient, balanceOf(recipient))
            {} catch {}
        }
        try distributor.process(distributorGas) {} catch {}
    }

    function collectFee(uint256 amount, bool sell) private returns (uint256) {
        uint256 newReflectionFee = (amount * (sell ? sellTax : buyTax)) / 10000;
        taxesFeeTotal += newReflectionFee;
        return newReflectionFee;
    }

    function _swapTokensForAvax(uint256 tokenAmount) private {
        address[] memory path = new address[](2);
        path[0] = address(this);
        path[1] = WAVAX;

        _approve(address(this), address(joeRouter), tokenAmount);

        joeRouter.swapExactTokensForAVAXSupportingFeeOnTransferTokens(
            tokenAmount,
            0,
            path,
            address(this),
            block.timestamp
        );
    }

    function _swapAvaxForQuasi(uint256 avaxAmount) private {
        address[] memory path = new address[](2);
        path[0] = WAVAX;
        path[1] = quasi;

        joeRouter.swapExactAVAXForTokens{value: avaxAmount}(
            0,
            path,
            address(this),
            block.timestamp
        );
    }

    function _addIggyLiquidity(
        uint256 tokenAmount,
        uint256 avaxAmount
    ) private {
        _approve(address(this), address(joeRouter), tokenAmount);

        joeRouter.addLiquidityAVAX{value: avaxAmount}(
            address(this),
            tokenAmount,
            0,
            0,
            address(0x000000000000000000000000000000000000dEaD),
            block.timestamp
        );
    }

    function _addQuasiLiquidity(uint256 avaxAmount) private {
        uint256 half = avaxAmount / 2;
        uint256 otherHalf = avaxAmount - half;

        _swapAvaxForQuasi(half);
        uint256 quasiBalance = IERC20(quasi).balanceOf(address(this));
        IERC20(quasi).approve(address(joeRouter), quasiBalance);

        joeRouter.addLiquidityAVAX{value: otherHalf}(
            quasi,
            quasiBalance,
            0,
            0,
            address(this),
            block.timestamp
        );
    }

    function setIsDividendExempt(
        address holder,
        bool status
    ) external onlyOwner {
        isDividendExempt[holder] = status;
        if (status) {
            distributor.setShare(holder, 0);
        } else {
            distributor.setShare(holder, balanceOf(holder));
        }
    }

    function setDistributionCriteria(
        uint256 minPeriod,
        uint256 minDistribution
    ) external onlyOwner {
        distributor.setDistributionCriteria(minPeriod, minDistribution);
    }

    function setDistributorGas(uint256 gas) external onlyOwner {
        require(gas < 750000, "Gas is greater than limit");
        distributorGas = gas;
    }

    function setTax(uint32 newBuyTax, uint32 newSellTax) external onlyOwner {
        require(
            newBuyTax < 500 && newSellTax < 500,
            "Cannot set either tax above 5%, 500 Bp"
        );
        buyTax = newBuyTax;
        sellTax = newSellTax;

        emit TaxUpdated(buyTax, sellTax);
    }

    function setWeights(
        uint32 liqBp,
        uint32 reflectBp,
        uint32 daoBp,
        uint32 burnBp
    ) external onlyOwner {
        require(
            liqBp + reflectBp + daoBp + burnBp == 10000,
            "Must allocate 100%, 10000 Bp"
        );
        liquidityBasisPoints = liqBp;
        reflectionBasisPoints = reflectBp;
        daoBasisPoints = daoBp;
        burnBasisPoints = burnBp;

        emit TaxAllocationUpdated(
            liquidityBasisPoints,
            reflectionBasisPoints,
            daoBasisPoints,
            burnBasisPoints
        );
    }

    function setDaoRecipientAddress(address newRecipient) external onlyOwner {
        daoRecipientAddress = newRecipient;

        emit DaoRecipientAddressUpdated(daoRecipientAddress);
    }
}

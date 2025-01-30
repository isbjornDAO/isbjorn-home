import { ethers } from "hardhat";
import { expect } from "chai";
import { Signer, ContractTransactionResponse, Addressable } from "ethers";

import {
  ERC20Mock,
  ERC20Mock__factory,
  IcePond,
  IcePond__factory,
  IcePondFactory,
  IsbjornRouter02,
  IsbjornLPStaking,
  WAVAXMock,
  IsbjornStaking,
} from "../types";

describe("IsbjornRouter02", function () {
  let router: IsbjornRouter02;
  let factory: IcePondFactory;
  let Token: ERC20Mock__factory;
  let tokenA: ERC20Mock;
  let tokenB: ERC20Mock;
  let WAVAX: WAVAXMock;
  let accounts: Signer[];
  let owner: Signer;
  let ownerAddress: string | Addressable;
  let feeCollector: Signer;
  let feeCollectorAddress: string | Addressable;
  let user1: Signer;
  let user1Address: string | Addressable;
  let user2: Signer;
  let user2Address: string | Addressable;
  let user3: Signer;
  let user3Address: string | Addressable;

  let pairTokenFactory: IcePond__factory;

  beforeEach(async function () {
    accounts = await ethers.getSigners();

    [owner, feeCollector, user1, user2, user3] = accounts;
    ownerAddress = await owner.getAddress();
    feeCollectorAddress = await feeCollector.getAddress();

    const Factory = await ethers.getContractFactory("IcePondFactory");
    factory = await Factory.deploy(ownerAddress);
    await factory.waitForDeployment();

    await factory.setFeeTo(feeCollectorAddress);

    const Wavax = await ethers.getContractFactory("WAVAXMock");
    WAVAX = await Wavax.deploy();
    await WAVAX.waitForDeployment();

    const Router = await ethers.getContractFactory("IsbjornRouter02");
    router = await Router.deploy(factory.target, WAVAX.target);
    await router.waitForDeployment();

    Token = await ethers.getContractFactory("ERC20Mock");
    tokenA = await Token.deploy(
      "TokenA",
      "TKA",
      18,
      ethers.parseEther("10000")
    );
    await tokenA.waitForDeployment();

    tokenB = await Token.deploy(
      "TokenB",
      "TKB",
      18,
      ethers.parseEther("10000")
    );
    await tokenB.waitForDeployment();

    pairTokenFactory = await ethers.getContractFactory("IcePond");
  });
  describe("Liquidity Functions", function () {
    describe("Add New Pair Liquidity", function () {
      it("should add liquidity for 2 tokens successfully", async function () {
        const amountADesired = ethers.parseEther("10");
        const amountBDesired = ethers.parseEther("20");
        const amountAMin = ethers.parseEther("9");
        const amountBMin = ethers.parseEther("18");
        const latestBlock = await ethers.provider.getBlock("latest");

        if (!latestBlock) {
          throw new Error("Failed to fetch the latest block.");
        }

        const deadline = latestBlock.timestamp + 3600;

        const initialOwnerTokenABalance = await tokenA.balanceOf(ownerAddress);
        const initialOwnerTokenBBalance = await tokenB.balanceOf(ownerAddress);

        await tokenA.connect(owner).approve(router.target, amountADesired);
        await tokenB.connect(owner).approve(router.target, amountBDesired);

        const tx: ContractTransactionResponse = await router.addLiquidity(
          tokenA.target,
          tokenB.target,
          amountADesired,
          amountBDesired,
          amountAMin,
          amountBMin,
          ownerAddress,
          deadline
        );

        const receipt = await tx.wait();
        if (!receipt) {
          throw new Error(
            "Transaction receipt is null. The transaction may not have been mined."
          );
        }

        const newOwnerTokenABalance = await tokenA.balanceOf(ownerAddress);
        const newOwnerTokenBBalance = await tokenB.balanceOf(ownerAddress);

        const pairAddress = await router.pairFor(tokenA.target, tokenB.target);

        const newPairTokenABalance = await tokenA.balanceOf(pairAddress);
        const newPairTokenBBalance = await tokenB.balanceOf(pairAddress);

        expect(newOwnerTokenABalance).to.be.lessThanOrEqual(
          initialOwnerTokenABalance - ethers.parseEther("9")
        );
        expect(newOwnerTokenBBalance).to.be.lessThanOrEqual(
          initialOwnerTokenBBalance - ethers.parseEther("18")
        );
        expect(newPairTokenABalance).to.be.greaterThanOrEqual(
          ethers.parseEther("9")
        );
        expect(newPairTokenBBalance).to.be.greaterThanOrEqual(
          ethers.parseEther("18")
        );
      });
      it("should add liquidity for a token and AVAX successfully", async function () {
        const amountADesired = ethers.parseEther("10");
        const amountBDesired = ethers.parseEther("20");
        const amountAMin = ethers.parseEther("9");
        const amountBMin = ethers.parseEther("18");
        const latestBlock = await ethers.provider.getBlock("latest");

        if (!latestBlock) {
          throw new Error("Failed to fetch the latest block.");
        }

        const deadline = latestBlock.timestamp + 3600;

        const initialOwnerTokenABalance = await tokenA.balanceOf(ownerAddress);
        const initialOwnerTokenBBalance = await ethers.provider.getBalance(
          ownerAddress
        );

        await tokenA.connect(owner).approve(router.target, amountADesired);

        const tx: ContractTransactionResponse = await router.addLiquidityAVAX(
          tokenA.target,
          amountADesired,
          amountAMin,
          amountBMin,
          ownerAddress,
          deadline,
          { value: amountBDesired }
        );

        const receipt = await tx.wait();
        if (!receipt) {
          throw new Error(
            "Transaction receipt is null. The transaction may not have been mined."
          );
        }

        const newOwnerTokenABalance = await tokenA.balanceOf(ownerAddress);
        const newOwnerTokenBBalance = await ethers.provider.getBalance(
          ownerAddress
        );

        const pairAddress = await router.pairFor(tokenA.target, WAVAX.target);

        const newPairTokenABalance = await tokenA.balanceOf(pairAddress);
        const newPairTokenBBalance = await WAVAX.balanceOf(pairAddress);

        expect(newOwnerTokenABalance).to.be.lessThanOrEqual(
          initialOwnerTokenABalance - ethers.parseEther("9")
        );
        expect(newOwnerTokenBBalance).to.be.lessThanOrEqual(
          initialOwnerTokenBBalance - ethers.parseEther("18")
        );
        expect(newPairTokenABalance).to.be.greaterThanOrEqual(
          ethers.parseEther("9")
        );
        expect(newPairTokenBBalance).to.be.greaterThanOrEqual(
          ethers.parseEther("18")
        );
      });
      it("should add liquidity for a token and WAVAX successfully", async function () {
        const amountADesired = ethers.parseEther("10");
        const amountBDesired = ethers.parseEther("20");
        const amountAMin = ethers.parseEther("9");
        const amountBMin = ethers.parseEther("18");
        const latestBlock = await ethers.provider.getBlock("latest");

        if (!latestBlock) {
          throw new Error("Failed to fetch the latest block.");
        }

        const deadline = latestBlock.timestamp + 3600;

        const initialOwnerTokenABalance = await tokenA.balanceOf(ownerAddress);

        await tokenA.connect(owner).approve(router.target, amountADesired);
        await WAVAX.connect(owner).deposit({ value: amountBDesired });
        await WAVAX.connect(owner).approve(router.target, amountBDesired);

        const initialOwnerTokenBBalance = await WAVAX.balanceOf(ownerAddress);

        const tx: ContractTransactionResponse = await router.addLiquidity(
          tokenA.target,
          WAVAX.target,
          amountADesired,
          amountBDesired,
          amountAMin,
          amountBMin,
          ownerAddress,
          deadline
        );

        const receipt = await tx.wait();
        if (!receipt) {
          throw new Error(
            "Transaction receipt is null. The transaction may not have been mined."
          );
        }

        const newOwnerTokenABalance = await tokenA.balanceOf(ownerAddress);
        const newOwnerTokenBBalance = await WAVAX.balanceOf(ownerAddress);

        const pairAddress = await router.pairFor(tokenA.target, WAVAX.target);

        const newPairTokenABalance = await tokenA.balanceOf(pairAddress);
        const newPairTokenBBalance = await WAVAX.balanceOf(pairAddress);

        expect(newOwnerTokenABalance).to.be.lessThanOrEqual(
          initialOwnerTokenABalance - ethers.parseEther("9")
        );
        expect(newOwnerTokenBBalance).to.be.lessThanOrEqual(
          initialOwnerTokenBBalance - ethers.parseEther("18")
        );
        expect(newPairTokenABalance).to.be.greaterThanOrEqual(
          ethers.parseEther("9")
        );
        expect(newPairTokenBBalance).to.be.greaterThanOrEqual(
          ethers.parseEther("18")
        );
      });
    });
    describe("Remove Recent New Pair Liquidity", function () {
      beforeEach(async function () {
        const amountADesired = ethers.parseEther("10");
        const amountBDesired = ethers.parseEther("20");
        const amountAMin = ethers.parseEther("9");
        const amountBMin = ethers.parseEther("18");
        const latestBlock = await ethers.provider.getBlock("latest");

        if (!latestBlock) {
          throw new Error("Failed to fetch the latest block.");
        }

        const deadline = latestBlock.timestamp + 3600;

        await tokenA.connect(owner).approve(router.target, amountADesired);
        await tokenB.connect(owner).approve(router.target, amountBDesired);

        const tx1: ContractTransactionResponse = await router.addLiquidity(
          tokenA.target,
          tokenB.target,
          amountADesired,
          amountBDesired,
          amountAMin,
          amountBMin,
          ownerAddress,
          deadline
        );

        await tokenA.connect(owner).approve(router.target, amountADesired);

        const tx2: ContractTransactionResponse = await router.addLiquidityAVAX(
          tokenA.target,
          amountADesired,
          amountAMin,
          amountBMin,
          ownerAddress,
          deadline,
          { value: amountBDesired }
        );
      });
      it("should remove liquidity for 2 tokens successfully", async function () {
        const latestBlock = await ethers.provider.getBlock("latest");

        if (!latestBlock) {
          throw new Error("Failed to fetch the latest block.");
        }

        const deadline = latestBlock.timestamp + 3600;
        const pairAddress = await router.pairFor(tokenA.target, tokenB.target);

        const initialOwnerTokenABalance = await tokenA.balanceOf(ownerAddress);
        const initialOwnerTokenBBalance = await tokenB.balanceOf(ownerAddress);

        const pairTokenABalance = await tokenA.balanceOf(pairAddress);
        const pairTokenBBalance = await tokenB.balanceOf(pairAddress);

        const pair: IcePond = pairTokenFactory.attach(pairAddress) as IcePond;
        const ownerLiquidityBalance = await pair.balanceOf(ownerAddress);

        await pair.connect(owner).approve(router.target, ownerLiquidityBalance);

        const tx: ContractTransactionResponse = await router.removeLiquidity(
          tokenA.target,
          tokenB.target,
          ownerLiquidityBalance,
          ethers.parseEther("9"),
          ethers.parseEther("18"),
          ownerAddress,
          deadline
        );

        const newPairTokenABalance = await tokenA.balanceOf(pairAddress);
        const newPairTokenBBalance = await tokenB.balanceOf(pairAddress);

        const newOwnerTokenABalance = await tokenA.balanceOf(ownerAddress);
        const newOwnerTokenBBalance = await tokenB.balanceOf(ownerAddress);

        expect(newOwnerTokenABalance).to.be.greaterThanOrEqual(
          initialOwnerTokenABalance + ethers.parseEther("9")
        );
        expect(newOwnerTokenBBalance).to.be.greaterThanOrEqual(
          initialOwnerTokenBBalance + ethers.parseEther("18")
        );
        expect(newPairTokenABalance).to.be.lessThanOrEqual(
          pairTokenABalance - ethers.parseEther("9")
        );
        expect(newPairTokenBBalance).to.be.lessThanOrEqual(
          pairTokenBBalance - ethers.parseEther("18")
        );
      });
      it("should remove liquidity for a token and AVAX successfully", async function () {
        const latestBlock = await ethers.provider.getBlock("latest");

        if (!latestBlock) {
          throw new Error("Failed to fetch the latest block.");
        }

        const deadline = latestBlock.timestamp + 3600;
        const pairAddress = await router.pairFor(tokenA.target, WAVAX.target);

        const initialOwnerTokenABalance = await tokenA.balanceOf(ownerAddress);
        const initialOwnerTokenBBalance = await ethers.provider.getBalance(
          ownerAddress
        );

        const pairTokenABalance = await tokenA.balanceOf(pairAddress);
        const pairTokenBBalance = await WAVAX.balanceOf(pairAddress);

        const pair: IcePond = pairTokenFactory.attach(pairAddress) as IcePond;
        const ownerLiquidityBalance = await pair.balanceOf(ownerAddress);

        await pair.connect(owner).approve(router.target, ownerLiquidityBalance);

        const tx: ContractTransactionResponse =
          await router.removeLiquidityAVAX(
            tokenA.target,
            ownerLiquidityBalance,
            ethers.parseEther("9"),
            ethers.parseEther("18"),
            ownerAddress,
            deadline
          );

        const newPairTokenABalance = await tokenA.balanceOf(pairAddress);
        const newPairTokenBBalance = await WAVAX.balanceOf(pairAddress);

        const newOwnerTokenABalance = await tokenA.balanceOf(ownerAddress);
        const newOwnerTokenBBalance = await ethers.provider.getBalance(
          ownerAddress
        );

        expect(newOwnerTokenABalance).to.be.greaterThanOrEqual(
          initialOwnerTokenABalance + ethers.parseEther("9")
        );
        expect(newOwnerTokenBBalance).to.be.greaterThanOrEqual(
          initialOwnerTokenBBalance + ethers.parseEther("18")
        );
        expect(newPairTokenABalance).to.be.lessThanOrEqual(
          pairTokenABalance - ethers.parseEther("9")
        );
        expect(newPairTokenBBalance).to.be.lessThanOrEqual(
          pairTokenBBalance - ethers.parseEther("18")
        );
      });
      it("should add liquidity for a token and WAVAX successfully", async function () {
        const latestBlock = await ethers.provider.getBlock("latest");

        if (!latestBlock) {
          throw new Error("Failed to fetch the latest block.");
        }

        const deadline = latestBlock.timestamp + 3600;
        const pairAddress = await router.pairFor(tokenA.target, WAVAX.target);

        const initialOwnerTokenABalance = await tokenA.balanceOf(ownerAddress);
        const initialOwnerTokenBBalance = await WAVAX.balanceOf(ownerAddress);

        const pairTokenABalance = await tokenA.balanceOf(pairAddress);
        const pairTokenBBalance = await WAVAX.balanceOf(pairAddress);

        const pair: IcePond = pairTokenFactory.attach(pairAddress) as IcePond;
        const ownerLiquidityBalance = await pair.balanceOf(ownerAddress);

        await pair.connect(owner).approve(router.target, ownerLiquidityBalance);

        const tx: ContractTransactionResponse = await router.removeLiquidity(
          tokenA.target,
          WAVAX.target,
          ownerLiquidityBalance,
          ethers.parseEther("9"),
          ethers.parseEther("18"),
          ownerAddress,
          deadline
        );

        const newPairTokenABalance = await tokenA.balanceOf(pairAddress);
        const newPairTokenBBalance = await WAVAX.balanceOf(pairAddress);

        const newOwnerTokenABalance = await tokenA.balanceOf(ownerAddress);
        const newOwnerTokenBBalance = await WAVAX.balanceOf(ownerAddress);

        expect(newOwnerTokenABalance).to.be.greaterThanOrEqual(
          initialOwnerTokenABalance + ethers.parseEther("9")
        );
        expect(newOwnerTokenBBalance).to.be.greaterThanOrEqual(
          initialOwnerTokenBBalance + ethers.parseEther("18")
        );
        expect(newPairTokenABalance).to.be.lessThanOrEqual(
          pairTokenABalance - ethers.parseEther("9")
        );
        expect(newPairTokenBBalance).to.be.lessThanOrEqual(
          pairTokenBBalance - ethers.parseEther("18")
        );
      });
    });
    describe("Add and Remove Liquidity After Swaps", function () {
      beforeEach(async function () {
        // Add initial liquidity to the pool
        const amountADesired = ethers.parseEther("100");
        const amountBDesired = ethers.parseEther("200");
        const amountAMin = ethers.parseEther("90");
        const amountBMin = ethers.parseEther("180");
        const latestBlock = await ethers.provider.getBlock("latest");

        if (!latestBlock) {
          throw new Error("Failed to fetch the latest block.");
        }

        const deadline = latestBlock.timestamp + 3600;

        await tokenA.connect(owner).approve(router.target, amountADesired);
        await tokenB.connect(owner).approve(router.target, amountBDesired);

        await router.addLiquidity(
          tokenA.target,
          tokenB.target,
          amountADesired,
          amountBDesired,
          amountAMin,
          amountBMin,
          ownerAddress,
          deadline
        );

        // Simulate user1 swapping TokenA for TokenB
        user1Address = await user1.getAddress();
        const swapAmount = ethers.parseEther("10");
        await tokenA.connect(owner).transfer(user1Address, swapAmount);
        await tokenA.connect(user1).approve(router.target, swapAmount);
        await router.connect(user1).swapExactTokensForTokens(
          swapAmount,
          ethers.parseEther("18"), // Min amount out
          [tokenA.target, tokenB.target],
          user1Address,
          deadline
        );

        // Simulate user2 swapping TokenB for TokenA
        user2Address = await user2.getAddress();
        const reverseSwapAmount = ethers.parseEther("15");
        await tokenB.connect(owner).transfer(user2Address, reverseSwapAmount);
        await tokenB.connect(user2).approve(router.target, reverseSwapAmount);
        await router.connect(user2).swapExactTokensForTokens(
          reverseSwapAmount,
          ethers.parseEther("6"), // Min amount out
          [tokenB.target, tokenA.target],
          await user2.getAddress(),
          deadline
        );
      });

      it("should add liquidity successfully after swaps", async function () {
        const amountADesired = ethers.parseEther("50");
        const amountBDesired = ethers.parseEther("100");
        const amountAMin = ethers.parseEther("40");
        const amountBMin = ethers.parseEther("80");
        const latestBlock = await ethers.provider.getBlock("latest");

        if (!latestBlock) {
          throw new Error("Failed to fetch the latest block.");
        }

        const deadline = latestBlock.timestamp + 3600;

        const pairAddress = await router.pairFor(tokenA.target, tokenB.target);
        const initialPairTokenABalance = await tokenA.balanceOf(pairAddress);
        const initialPairTokenBBalance = await tokenB.balanceOf(pairAddress);

        await tokenA.connect(owner).approve(router.target, amountADesired);
        await tokenB.connect(owner).approve(router.target, amountBDesired);

        await router.addLiquidity(
          tokenA.target,
          tokenB.target,
          amountADesired,
          amountBDesired,
          amountAMin,
          amountBMin,
          ownerAddress,
          deadline
        );

        const finalPairTokenABalance = await tokenA.balanceOf(pairAddress);
        const finalPairTokenBBalance = await tokenB.balanceOf(pairAddress);

        expect(finalPairTokenABalance).to.be.greaterThan(
          initialPairTokenABalance
        );
        expect(finalPairTokenBBalance).to.be.greaterThan(
          initialPairTokenBBalance
        );
      });

      it("should remove liquidity successfully after swaps", async function () {
        const latestBlock = await ethers.provider.getBlock("latest");

        if (!latestBlock) {
          throw new Error("Failed to fetch the latest block.");
        }

        const deadline = latestBlock.timestamp + 3600;
        const pairAddress = await router.pairFor(tokenA.target, tokenB.target);

        const pair: IcePond = pairTokenFactory.attach(pairAddress) as IcePond;
        const ownerLiquidityBalance = await pair.balanceOf(ownerAddress);

        const initialOwnerTokenABalance = await tokenA.balanceOf(ownerAddress);
        const initialOwnerTokenBBalance = await tokenB.balanceOf(ownerAddress);

        const pairTokenABalance = await tokenA.balanceOf(pairAddress);
        const pairTokenBBalance = await tokenB.balanceOf(pairAddress);

        await pair.connect(owner).approve(router.target, ownerLiquidityBalance);

        await router.removeLiquidity(
          tokenA.target,
          tokenB.target,
          ownerLiquidityBalance,
          ethers.parseEther("45"),
          ethers.parseEther("90"),
          ownerAddress,
          deadline
        );

        const finalOwnerTokenABalance = await tokenA.balanceOf(ownerAddress);
        const finalOwnerTokenBBalance = await tokenB.balanceOf(ownerAddress);

        const finalPairTokenABalance = await tokenA.balanceOf(pairAddress);
        const finalPairTokenBBalance = await tokenB.balanceOf(pairAddress);

        expect(finalOwnerTokenABalance).to.be.greaterThan(
          initialOwnerTokenABalance
        );
        expect(finalOwnerTokenBBalance).to.be.greaterThan(
          initialOwnerTokenBBalance
        );
        expect(finalPairTokenABalance).to.be.lessThan(pairTokenABalance);
        expect(finalPairTokenBBalance).to.be.lessThan(pairTokenBBalance);
      });
    });
  });
  describe("Swap Functions", function () {
    beforeEach(async function () {
      // Add initial liquidity to the tokenA/tokenB pool
      const amountADesired = ethers.parseEther("100");
      const amountBDesired = ethers.parseEther("200");
      const amountAMin = ethers.parseEther("90");
      const amountBMin = ethers.parseEther("180");
      const latestBlock = await ethers.provider.getBlock("latest");

      if (!latestBlock) {
        throw new Error("Failed to fetch the latest block.");
      }

      const deadline = latestBlock.timestamp + 3600;

      // Approve tokenA and tokenB for router
      await tokenA.connect(owner).approve(router.target, amountADesired);
      await tokenB.connect(owner).approve(router.target, amountBDesired);

      // Add liquidity for tokenA/tokenB pair
      await router.addLiquidity(
        tokenA.target,
        tokenB.target,
        amountADesired,
        amountBDesired,
        amountAMin,
        amountBMin,
        ownerAddress,
        deadline
      );

      // Add initial liquidity to the tokenA/WAVAX pool
      const amountAVAXDesired = ethers.parseEther("100");
      const amountTokenDesired = ethers.parseEther("50");
      const amountAVAXMin = ethers.parseEther("90");
      const amountTokenMin = ethers.parseEther("45");

      // Approve tokenA for router
      await tokenA.connect(owner).approve(router.target, amountTokenDesired);

      // Deposit WAVAX and approve it for router
      await WAVAX.connect(owner).deposit({ value: amountAVAXDesired });
      await WAVAX.connect(owner).approve(router.target, amountAVAXDesired);

      // Add liquidity for tokenA/WAVAX pair
      await router.addLiquidity(
        tokenA.target,
        WAVAX.target,
        amountTokenDesired,
        amountAVAXDesired,
        amountTokenMin,
        amountAVAXMin,
        ownerAddress,
        deadline
      );

      // Add initial liquidity to the tokenB/WAVAX pool
      const amountTokenBDesired = ethers.parseEther("70");
      const amountAVAXBDesired = ethers.parseEther("140");
      const amountTokenBMin = ethers.parseEther("63");
      const amountAVAXBMin = ethers.parseEther("126");

      // Approve tokenB for router
      await tokenB.connect(owner).approve(router.target, amountTokenBDesired);

      // Deposit WAVAX and approve it for router
      await WAVAX.connect(owner).deposit({ value: amountAVAXBDesired });
      await WAVAX.connect(owner).approve(router.target, amountAVAXBDesired);

      // Add liquidity for tokenB/WAVAX pair
      await router.addLiquidity(
        tokenB.target,
        WAVAX.target,
        amountTokenBDesired,
        amountAVAXBDesired,
        amountTokenBMin,
        amountAVAXBMin,
        ownerAddress,
        deadline
      );
    });

    it("should swap exact tokens for tokens successfully", async function () {
      const swapAmount = ethers.parseEther("10");
      const amountOutMin = ethers.parseEther("18");
      const latestBlock = await ethers.provider.getBlock("latest");

      if (!latestBlock) {
        throw new Error("Failed to fetch the latest block.");
      }

      const deadline = latestBlock.timestamp + 3600;
      await tokenA.connect(owner).transfer(user1Address, swapAmount);
      await tokenA.connect(owner).transfer(user1Address, swapAmount);
      await tokenA.connect(user1).approve(router.target, swapAmount);

      const initialUser1TokenBBalance = await tokenB.balanceOf(user1Address);

      await router
        .connect(user1)
        .swapExactTokensForTokens(
          swapAmount,
          amountOutMin,
          [tokenA.target, tokenB.target],
          user1Address,
          deadline
        );

      const finalUser1TokenBBalance = await tokenB.balanceOf(user1Address);

      expect(finalUser1TokenBBalance).to.be.greaterThan(
        initialUser1TokenBBalance
      );
    });

    it("should swap tokens for exact tokens successfully", async function () {
      const amountOut = ethers.parseEther("1");
      const amountInMax = ethers.parseEther("2.1");
      const latestBlock = await ethers.provider.getBlock("latest");

      if (!latestBlock) {
        throw new Error("Failed to fetch the latest block.");
      }

      const deadline = latestBlock.timestamp + 3600;

      await tokenB.connect(owner).transfer(user1Address, amountInMax);
      await tokenB.connect(user1).approve(router.target, amountInMax);

      const initialUser1TokenABalance = await tokenA.balanceOf(user1Address);

      await router
        .connect(user1)
        .swapTokensForExactTokens(
          amountOut,
          amountInMax,
          [tokenB.target, tokenA.target],
          user1Address,
          deadline
        );

      const finalUser1TokenABalance = await tokenA.balanceOf(user1Address);

      expect(finalUser1TokenABalance).to.be.greaterThan(
        initialUser1TokenABalance
      );
    });

    it("should swap exact AVAX for tokens successfully", async function () {
      const amountOutMin = ethers.parseEther("4.5");
      const swapAmount = ethers.parseEther("10");
      const latestBlock = await ethers.provider.getBlock("latest");

      if (!latestBlock) {
        throw new Error("Failed to fetch the latest block.");
      }

      const deadline = latestBlock.timestamp + 3600;

      const initialUser1TokenBBalance = await tokenB.balanceOf(user1Address);

      await router
        .connect(user1)
        .swapExactAVAXForTokens(
          amountOutMin,
          [WAVAX.target, tokenB.target],
          user1Address,
          deadline,
          { value: swapAmount }
        );

      const finalUser1TokenBBalance = await tokenB.balanceOf(user1Address);

      expect(finalUser1TokenBBalance).to.be.greaterThan(
        initialUser1TokenBBalance
      );
    });

    it("should swap tokens for exact AVAX successfully", async function () {
      const amountOut = ethers.parseEther("5");
      const amountInMax = ethers.parseEther("2.7");
      const latestBlock = await ethers.provider.getBlock("latest");

      if (!latestBlock) {
        throw new Error("Failed to fetch the latest block.");
      }

      const deadline = latestBlock.timestamp + 3600;

      await tokenA.connect(owner).transfer(user1Address, amountInMax);
      await tokenA.connect(user1).approve(router.target, amountInMax);

      const initialUser1Balance = await ethers.provider.getBalance(
        user1Address
      );
      await router
        .connect(user1)
        .swapTokensForExactAVAX(
          amountOut,
          amountInMax,
          [tokenA.target, WAVAX.target],
          user1Address,
          deadline
        );

      const finalUser1Balance = await ethers.provider.getBalance(user1Address);

      expect(finalUser1Balance).to.be.greaterThan(initialUser1Balance);
    });

    it("should fail if swap path is invalid", async function () {
      const swapAmount = ethers.parseEther("10");
      const amountOutMin = ethers.parseEther("15");
      const latestBlock = await ethers.provider.getBlock("latest");

      if (!latestBlock) {
        throw new Error("Failed to fetch the latest block.");
      }

      const deadline = latestBlock.timestamp + 3600;

      await tokenA.connect(owner).approve(router.target, swapAmount);

      await expect(
        router.swapExactTokensForTokens(
          swapAmount,
          amountOutMin,
          [tokenA.target, tokenA.target], // Invalid path
          ownerAddress,
          deadline
        )
      ).to.be.revertedWith("IsbjornLibrary: IDENTICAL_ADDRESSES");
    });
  });
  describe("Achievement Tracking", function () {
    let achievementTracker: any;
    let souldBoundAchievements: any;

    beforeEach(async function () {
      const AchievementTracker = await ethers.getContractFactory(
        "AchievementTracker"
      );
      achievementTracker = await AchievementTracker.deploy("");
      await achievementTracker.waitForDeployment();

      await achievementTracker.setIsbjornRouter(router.target, WAVAX.target);
      await router.setAchievementTrackerAddress(achievementTracker.target);

      const SouldBoundAchievements = await ethers.getContractFactory(
        "SoulboundAchievments"
      );
      souldBoundAchievements = await SouldBoundAchievements.attach(
        await achievementTracker.achievements()
      );

      // Add initial liquidity
      const amountADesired = ethers.parseEther("100");
      const amountBDesired = ethers.parseEther("200");
      const latestBlock = await ethers.provider.getBlock("latest");
      if (!latestBlock) throw new Error("Failed to fetch the latest block.");
      const deadline = latestBlock.timestamp + 3600;

      await tokenA.connect(owner).approve(router.target, amountADesired);
      await tokenB.connect(owner).approve(router.target, amountBDesired);

      await router.addLiquidity(
        tokenA.target,
        tokenB.target,
        amountADesired,
        amountBDesired,
        amountADesired,
        amountBDesired,
        ownerAddress,
        deadline
      );
    });

    describe("Track Stats", function () {
      it("should track liquidity adds successfully", async function () {
        const latestBlock = await ethers.provider.getBlock("latest");
        if (!latestBlock) throw new Error("Failed to fetch block");
        const deadline = latestBlock.timestamp + 3600;

        const amountADesired = ethers.parseEther("10");
        const amountBDesired = ethers.parseEther("20");
        const amountAMin = ethers.parseEther("9");
        const amountBMin = ethers.parseEther("18");

        await tokenA.connect(owner).approve(router.target, amountADesired);
        await tokenB.connect(owner).approve(router.target, amountBDesired);

        await router.addLiquidity(
          tokenA.target,
          tokenB.target,
          amountADesired,
          amountBDesired,
          amountAMin,
          amountBMin,
          ownerAddress,
          deadline
        );

        const globalStats = await achievementTracker.globalLiquidityStats();
        expect(globalStats.totalLiquidityAdds).to.equal(2n);

        const userStats = await achievementTracker.userLiquidityStats(
          ownerAddress
        );
        expect(userStats.totalLiquidityAdds).to.equal(2n);
      });

      it("should track swaps successfully", async function () {
        const swapAmount = ethers.parseEther("10");
        const latestBlock = await ethers.provider.getBlock("latest");
        if (!latestBlock) throw new Error("Failed to fetch block");
        const deadline = latestBlock.timestamp + 3600;

        await tokenA.connect(owner).transfer(user1Address, swapAmount);
        await tokenA.connect(user1).approve(router.target, swapAmount);

        const tx = await router
          .connect(user1)
          .swapExactTokensForTokens(
            swapAmount,
            0,
            [tokenA.target, tokenB.target],
            user1Address,
            deadline
          );
        await tx.wait();

        const userStatsAfter = await achievementTracker.userSwapStats(
          user1Address
        );
        expect(userStatsAfter).to.equal(1n);
      });

      it("should track liquidity removes successfully", async function () {
        const latestBlock = await ethers.provider.getBlock("latest");
        if (!latestBlock) throw new Error("Failed to fetch block");
        const deadline = latestBlock.timestamp + 3600;

        const pairAddress = await router.pairFor(tokenA.target, tokenB.target);
        const pair = pairTokenFactory.attach(pairAddress) as IcePond;
        const liquidity = await pair.balanceOf(ownerAddress);

        await pair.connect(owner).approve(router.target, liquidity);

        await router.removeLiquidity(
          tokenA.target,
          tokenB.target,
          liquidity,
          0,
          0,
          ownerAddress,
          deadline
        );

        const globalStats = await achievementTracker.globalLiquidityStats();
        expect(globalStats.totalLiquidityRemovals).to.equal(1n);

        const userStats = await achievementTracker.userLiquidityStats(
          ownerAddress
        );
        expect(userStats.totalLiquidityRemovals).to.equal(1n);
      });

      it("should track individual token amounts in global liquidity stats", async function () {
        // Initial add liquidity
        const amountA = ethers.parseEther("50");
        const amountB = ethers.parseEther("100");
        const deadline =
          (await ethers.provider.getBlock("latest"))!.timestamp + 3600;

        await tokenA.connect(owner).approve(router.target, amountA);
        await tokenB.connect(owner).approve(router.target, amountB);

        await router.addLiquidity(
          tokenA.target,
          tokenB.target,
          amountA,
          amountB,
          0,
          0,
          ownerAddress,
          deadline
        );

        const globalStatsA =
          await achievementTracker.getGlobalTokenLiquidityStats(
            tokenA.target.toString()
          );
        const globalStatsB =
          await achievementTracker.getGlobalTokenLiquidityStats(
            tokenB.target.toString()
          );
        const tokenASupplied = globalStatsA.totalSupplied;
        const tokenBSupplied = globalStatsB.totalSupplied;

        // Initial liquidity (100A:200B) + new liquidity (50A:100B)
        expect(tokenASupplied).to.equal(ethers.parseEther("150"));
        expect(tokenBSupplied).to.equal(ethers.parseEther("300"));
      });

      it("should track individual token amounts in user swap stats", async function () {
        const swapAmount = ethers.parseEther("10");
        const deadline =
          (await ethers.provider.getBlock("latest"))!.timestamp + 3600;

        await tokenA.connect(owner).transfer(user1Address, swapAmount);
        await tokenA.connect(user1).approve(router.target, swapAmount);

        await router
          .connect(user1)
          .swapExactTokensForTokens(
            swapAmount,
            0,
            [tokenA.target, tokenB.target],
            user1Address,
            deadline
          );

        const userStatsA = await achievementTracker.getUserTokenSwapStats(
          user1Address,
          tokenA.target.toString()
        );
        const userStatsB = await achievementTracker.getUserTokenSwapStats(
          user1Address,
          tokenB.target.toString()
        );
        expect(userStatsA.sold).to.equal(swapAmount);
        expect(userStatsA.bought).to.equal(0n);
        expect(userStatsB.bought).to.be.greaterThan(0n);
        expect(userStatsB.sold).to.equal(0n);
      });

      it("should track cumulative volumes per token correctly", async function () {
        // Setup two swaps in opposite directions
        const swapAmount = ethers.parseEther("10");
        const deadline =
          (await ethers.provider.getBlock("latest"))!.timestamp + 3600;

        // First swap: A -> B
        await tokenA.connect(owner).transfer(user1Address, swapAmount);
        await tokenA.connect(user1).approve(router.target, swapAmount);
        await router
          .connect(user1)
          .swapExactTokensForTokens(
            swapAmount,
            0,
            [tokenA.target, tokenB.target],
            user1Address,
            deadline
          );

        // Second swap: B -> A
        const tokenBBalance = await tokenB.balanceOf(user1Address);
        await tokenB.connect(user1).approve(router.target, tokenBBalance);
        await router
          .connect(user1)
          .swapExactTokensForTokens(
            tokenBBalance,
            0,
            [tokenB.target, tokenA.target],
            user1Address,
            deadline
          );

        const globalStatsA = await achievementTracker.getGlobalTokenSwapStats(
          tokenA.target.toString()
        );
        const globalStatsB = await achievementTracker.getGlobalTokenSwapStats(
          tokenB.target.toString()
        );
        expect(globalStatsA.cumulativeVolume).to.be.greaterThan(swapAmount);
        expect(globalStatsB.cumulativeVolume).to.be.greaterThan(0n);
      });
    });

    describe("Issue Achievments", function () {
      it("should issue an achievement for first liquidity add", async function () {
        const latestBlock = await ethers.provider.getBlock("latest");
        if (!latestBlock) throw new Error("Failed to fetch block");
        const deadline = latestBlock.timestamp + 3600;

        const amountADesired = ethers.parseEther("10");
        const amountBDesired = ethers.parseEther("20");
        const amountAMin = ethers.parseEther("9");
        const amountBMin = ethers.parseEther("18");

        await tokenA.connect(owner).approve(router.target, amountADesired);
        await tokenB.connect(owner).approve(router.target, amountBDesired);

        await router.addLiquidity(
          tokenA.target,
          tokenB.target,
          amountADesired,
          amountBDesired,
          amountAMin,
          amountBMin,
          ownerAddress,
          deadline
        );

        const achievementBalance = await souldBoundAchievements.balanceOf(
          owner,
          101
        ); // uint256 LIQUIDITY_1 = 101; // First liquidity add
        expect(achievementBalance).to.be.equal(1n);
      });
      it("should issue an achievement for first swap", async function () {
        const swapAmount = ethers.parseEther("10");
        const latestBlock = await ethers.provider.getBlock("latest");
        if (!latestBlock) throw new Error("Failed to fetch block");
        const deadline = latestBlock.timestamp + 3600;

        await tokenA.connect(owner).transfer(user1Address, swapAmount);
        await tokenA.connect(user1).approve(router.target, swapAmount);

        const tx = await router
          .connect(user1)
          .swapExactTokensForTokens(
            swapAmount,
            0,
            [tokenA.target, tokenB.target],
            user1Address,
            deadline
          );
        await tx.wait();

        const achievementBalance = await souldBoundAchievements.balanceOf(
          user1,
          1
        );
        expect(achievementBalance).to.be.equal(1n);
      });
      it("should issue an achievement for 1 AVAX volume of liquidity adds", async function () {
        const latestBlock = await ethers.provider.getBlock("latest");
        if (!latestBlock) throw new Error("Failed to fetch block");
        const deadline = latestBlock.timestamp + 3600;

        const amountADesired = ethers.parseEther("10");
        const amountBDesired = ethers.parseEther("20");
        const amountAMin = ethers.parseEther("9");
        const amountBMin = ethers.parseEther("18");

        await tokenA.connect(owner).approve(router.target, amountADesired);

        await router.addLiquidityAVAX(
          tokenA.target,
          amountADesired,
          amountAMin,
          amountBMin,
          ownerAddress,
          deadline,
          { value: amountBDesired }
        );

        const achievementBalance = await souldBoundAchievements.balanceOf(
          owner,
          108
        );
        expect(achievementBalance).to.be.equal(1n);
      });
      it("should issue an achievement for 1 AVAX volume of swaps", async function () {
        const latestBlock = await ethers.provider.getBlock("latest");
        if (!latestBlock) throw new Error("Failed to fetch block");
        const deadline = latestBlock.timestamp + 3600;

        const amountADesired = ethers.parseEther("10");
        const amountBDesired = ethers.parseEther("20");
        const amountAMin = ethers.parseEther("9");
        const amountBMin = ethers.parseEther("18");

        await tokenA.connect(owner).approve(router.target, amountADesired);

        await router.addLiquidityAVAX(
          tokenA.target,
          amountADesired,
          amountAMin,
          amountBMin,
          ownerAddress,
          deadline,
          { value: amountBDesired }
        );

        await router
          .connect(owner)
          .swapExactAVAXForTokens(
            0,
            [WAVAX.target.toString(), tokenA.target.toString()],
            ownerAddress,
            deadline,
            { value: ethers.parseEther("1") }
          );

        const achievementBalance = await souldBoundAchievements.balanceOf(
          owner,
          8
        );
        expect(achievementBalance).to.be.equal(1n);

        await router
          .connect(owner)
          .swapExactAVAXForTokens(
            0,
            [WAVAX.target.toString(), tokenA.target.toString()],
            ownerAddress,
            deadline,
            { value: ethers.parseEther("1") }
          );

        const achievementBalanceAgain = await souldBoundAchievements.balanceOf(
          owner,
          8
        );
        expect(achievementBalanceAgain).to.be.equal(1n);
      });
    });
  });
  describe("LP Staking Functions", function () {
    let staking: IsbjornLPStaking;
    let stakingToken: ERC20Mock;
    let rewardToken1: ERC20Mock;
    let rewardToken2: ERC20Mock;
    let startTime: number;

    beforeEach(async function () {
      Token = await ethers.getContractFactory("ERC20Mock");
      stakingToken = await Token.deploy(
        "Staking Token",
        "STK",
        18,
        ethers.parseEther("1000000")
      );
      rewardToken1 = await Token.deploy(
        "Reward Token 1",
        "RWD1",
        18,
        ethers.parseEther("1000000")
      );
      rewardToken2 = await Token.deploy(
        "Reward Token 2",
        "RWD2",
        18,
        ethers.parseEther("1000000")
      );

      const Staking = await ethers.getContractFactory("IsbjornLPStaking");
      staking = await Staking.deploy();

      const latestBlock = await ethers.provider.getBlock("latest");
      startTime = latestBlock!.timestamp + 3600;
    });

    describe("Epoch Configuration", function () {
      it("should create epoch correctly", async function () {
        await staking.createEpoch(startTime);
        const epoch = await staking.epochs(1);
        expect(epoch.startTime).to.equal(startTime);
        expect(epoch.endTime).to.equal(startTime + 30 * 24 * 60 * 60);
      });

      it("should create staking pool", async function () {
        await staking.createStakingPool(stakingToken.target);
        const pool = await staking.stakingPools(stakingToken.target);
        expect(pool.isActive).to.be.true;
        expect(await staking.isStakingToken(stakingToken.target)).to.be.true;
      });

      it("should configure epoch rewards", async function () {
        await staking.createEpoch(startTime);
        await staking.createStakingPool(stakingToken.target);

        const rewardTokens = [rewardToken1.target, rewardToken2.target];
        const rewardAmounts = [
          ethers.parseEther("1000"),
          ethers.parseEther("2000"),
        ];

        await rewardToken1.approve(staking.target, rewardAmounts[0]);
        await rewardToken2.approve(staking.target, rewardAmounts[1]);

        await staking.configureEpochRewards(
          1,
          stakingToken.target,
          rewardTokens,
          rewardAmounts
        );

        const epoch = await staking.epochs(1);
        expect(epoch.isActive).to.be.true;
      });
    });

    describe("Staking Operations", function () {
      beforeEach(async function () {
        await staking.createEpoch(startTime);
        await staking.createStakingPool(stakingToken.target);

        const rewardTokens = [rewardToken1.target, rewardToken2.target];
        const rewardAmounts = [
          ethers.parseEther("1000"),
          ethers.parseEther("2000"),
        ];

        await rewardToken1.approve(staking.target, rewardAmounts[0]);
        await rewardToken2.approve(staking.target, rewardAmounts[1]);
        await staking.configureEpochRewards(
          1,
          stakingToken.target,
          rewardTokens,
          rewardAmounts
        );

        await stakingToken.transfer(user1Address, ethers.parseEther("10000"));
        await stakingToken.transfer(user2Address, ethers.parseEther("10000"));

        await ethers.provider.send("evm_setNextBlockTimestamp", [startTime]);
        await ethers.provider.send("evm_mine", []);
      });

      it("should allow staking and calculate rewards", async function () {
        const stakeAmount = ethers.parseEther("1000");
        await stakingToken.connect(user1).approve(staking.target, stakeAmount);
        await staking.connect(user1).stake(stakingToken.target, stakeAmount);

        await ethers.provider.send("evm_increaseTime", [24 * 60 * 60]);
        await ethers.provider.send("evm_mine", []);

        const pendingRewards = await staking.pendingRewards(
          stakingToken.target,
          user1Address,
          rewardToken1.target
        );
        expect(pendingRewards).to.be.gt(0);
      });

      it("should distribute rewards proportionally", async function () {
        await stakingToken
          .connect(user1)
          .approve(staking.target, ethers.parseEther("1000"));
        await staking
          .connect(user1)
          .stake(stakingToken.target, ethers.parseEther("1000"));

        await stakingToken
          .connect(user2)
          .approve(staking.target, ethers.parseEther("2000"));
        await staking
          .connect(user2)
          .stake(stakingToken.target, ethers.parseEther("2000"));

        await ethers.provider.send("evm_increaseTime", [24 * 60 * 60]);
        await ethers.provider.send("evm_mine", []);

        const user1Rewards = await staking.pendingRewards(
          stakingToken.target,
          user1Address,
          rewardToken1.target
        );
        const user2Rewards = await staking.pendingRewards(
          stakingToken.target,
          user2Address,
          rewardToken1.target
        );

        expect(Number(user2Rewards) / Number(user1Rewards)).to.be.approximately(
          2,
          0.1
        );
      });

      it("should handle claims correctly", async function () {
        const stakeAmount = ethers.parseEther("1000");
        await stakingToken.connect(user1).approve(staking.target, stakeAmount);
        await staking.connect(user1).stake(stakingToken.target, stakeAmount);

        await ethers.provider.send("evm_increaseTime", [24 * 60 * 60]);
        await ethers.provider.send("evm_mine", []);

        const balanceBefore = await rewardToken1.balanceOf(user1Address);
        await staking.connect(user1).claimRewards(stakingToken.target);
        const balanceAfter = await rewardToken1.balanceOf(user1Address);

        expect(balanceAfter).to.be.gt(balanceBefore);
      });

      it("should handle exit correctly", async function () {
        const initialTokenBalance = ethers.parseEther("10000");
        const stakeAmount = ethers.parseEther("1000");

        await stakingToken.connect(user1).approve(staking.target, stakeAmount);
        await staking.connect(user1).stake(stakingToken.target, stakeAmount);

        await ethers.provider.send("evm_increaseTime", [24 * 60 * 60]);
        await ethers.provider.send("evm_mine", []);

        await staking.connect(user1).exit(stakingToken.target);

        // Check wallet balance returned to initial amount
        const stakingTokenBalance = await stakingToken.balanceOf(user1Address);
        expect(stakingTokenBalance).to.equal(initialTokenBalance);

        // Check staked amount is zero
        const userInfo = await staking.userInfo(
          stakingToken.target,
          user1Address
        );
        expect(userInfo).to.equal(0);

        // Check rewards were received
        const rewardTokenBalance = await rewardToken1.balanceOf(user1Address);
        expect(rewardTokenBalance).to.be.gt(0);
      });
    });

    describe("Security Features", function () {
      beforeEach(async function () {
        await staking.createEpoch(startTime);
        await staking.createStakingPool(stakingToken.target);

        const rewardTokens = [rewardToken1.target];
        const rewardAmounts = [ethers.parseEther("1000")];

        await rewardToken1.approve(staking.target, rewardAmounts[0]);
        await staking.configureEpochRewards(
          1,
          stakingToken.target,
          rewardTokens,
          rewardAmounts
        );
      });

      it("should prevent recovering staking tokens", async function () {
        await expect(
          staking.recoverToken(stakingToken.target)
        ).to.be.revertedWith("Cannot recover staking token");
      });

      it("should prevent recovery during active epochs", async function () {
        await ethers.provider.send("evm_setNextBlockTimestamp", [startTime]);
        await ethers.provider.send("evm_mine", []);

        await expect(
          staking.recoverToken(rewardToken2.target)
        ).to.be.revertedWith("Cannot recover until all epochs end");
      });

      it("should allow recovery after all epochs end", async function () {
        await ethers.provider.send("evm_setNextBlockTimestamp", [
          startTime + 31 * 24 * 60 * 60,
        ]);
        await ethers.provider.send("evm_mine", []);

        const unusedToken = await Token.deploy(
          "Unused",
          "UNS",
          18,
          ethers.parseEther("1000")
        );
        await unusedToken.transfer(staking.target, ethers.parseEther("100"));

        const balanceBefore = await unusedToken.balanceOf(ownerAddress);
        await staking.recoverToken(unusedToken.target);
        const balanceAfter = await unusedToken.balanceOf(ownerAddress);

        expect(balanceAfter).to.be.gt(balanceBefore);
      });
    });
  });
  describe("IGGY Staking Functions", function () {
    let isbjornStaking: IsbjornStaking;
    const WEEK = 604800; // 1 week in seconds

    beforeEach(async function () {
      const IsbjornStaking = await ethers.getContractFactory("IsbjornStaking");
      isbjornStaking = await IsbjornStaking.deploy(
        tokenA.target,
        tokenB.target
      );
      await isbjornStaking.waitForDeployment();
      await ethers.provider.send("evm_mine", []);

      // Transfer tokens to test accounts
      await tokenA
        .connect(owner)
        .transfer(user1Address, ethers.parseEther("1000"));
      await tokenA
        .connect(owner)
        .transfer(user2Address, ethers.parseEther("1000"));
      await tokenB
        .connect(owner)
        .transfer(user1Address, ethers.parseEther("1000"));
      await ethers.provider.send("evm_mine", []);
    });

    describe("Core Staking Functions", function () {
      beforeEach(async function () {
        // Queue rewards using tokenB as reward for 1 week
        await tokenB.approve(isbjornStaking.target, ethers.parseEther("1000"));
        await isbjornStaking.queueNewRewards(
          ethers.parseEther("100"),
          tokenB.target,
          WEEK
        );
        await ethers.provider.send("evm_mine", []);
      });

      it("should distribute rewards over the specified period", async function () {
        await tokenA
          .connect(user1)
          .approve(isbjornStaking.target, ethers.parseEther("100"));
        await isbjornStaking.connect(user1).stake(ethers.parseEther("10"));

        // Check rewards after 1 day
        await ethers.provider.send("evm_increaseTime", [86400]); // 1 day
        await ethers.provider.send("evm_mine", []);

        const oneDayRewards = await isbjornStaking.earned(
          user1Address,
          tokenB.target
        );

        // After 1 day should have earned roughly 1/7 of rewards (as period is 1 week)
        const expectedDailyRewards = ethers.parseEther("100") / 7n;
        expect(oneDayRewards).to.be.closeTo(
          expectedDailyRewards,
          ethers.parseEther("1") // Allow 1 token margin of error
        );
      });

      it("should handle queuing additional rewards mid-period", async function () {
        await tokenA
          .connect(user1)
          .approve(isbjornStaking.target, ethers.parseEther("100"));
        await isbjornStaking.connect(user1).stake(ethers.parseEther("10"));

        // Advance halfway through period
        await ethers.provider.send("evm_increaseTime", [WEEK / 2]);
        await ethers.provider.send("evm_mine", []);

        // Queue additional rewards
        await tokenB.approve(isbjornStaking.target, ethers.parseEther("100"));
        await isbjornStaking.queueNewRewards(
          ethers.parseEther("100"),
          tokenB.target,
          WEEK
        );

        // Check new reward rate
        const rewardInfo = await isbjornStaking.rewards(tokenB.target);
        expect(rewardInfo.periodFinish).to.be.gt(
          (await ethers.provider.getBlock("latest")).timestamp + WEEK / 2
        );
      });

      it("should distribute rewards proportionally between stakers", async function () {
        await tokenA
          .connect(user1)
          .approve(isbjornStaking.target, ethers.parseEther("100"));
        await tokenA
          .connect(user2)
          .approve(isbjornStaking.target, ethers.parseEther("100"));

        await isbjornStaking.connect(user1).stake(ethers.parseEther("10"));
        await isbjornStaking.connect(user2).stake(ethers.parseEther("20"));

        // Advance some time
        await ethers.provider.send("evm_increaseTime", [86400]);
        await ethers.provider.send("evm_mine", []);

        const user1Earned = await isbjornStaking.earned(
          user1Address,
          tokenB.target
        );
        const user2Earned = await isbjornStaking.earned(
          user2Address,
          tokenB.target
        );

        // User2 should have earned twice as much as user1
        expect(user2Earned).to.be.gt(user1Earned);
        expect(user2Earned / user1Earned).to.be.closeTo(2n, 1n);
      });

      it("should handle multiple reward tokens with different periods", async function () {
        // Queue WAVAX rewards with different period
        await WAVAX.deposit({ value: ethers.parseEther("100") });
        await WAVAX.approve(isbjornStaking.target, ethers.parseEther("100"));
        await isbjornStaking.queueNewRewards(
          ethers.parseEther("100"),
          WAVAX.target,
          WEEK * 2 // 2 weeks
        );

        await tokenA
          .connect(user1)
          .approve(isbjornStaking.target, ethers.parseEther("10"));
        await isbjornStaking.connect(user1).stake(ethers.parseEther("10"));

        // Advance 1 week
        await ethers.provider.send("evm_increaseTime", [WEEK]);
        await ethers.provider.send("evm_mine", []);

        const tokenBEarned = await isbjornStaking.earned(
          user1Address,
          tokenB.target
        );
        const wavaxEarned = await isbjornStaking.earned(
          user1Address,
          WAVAX.target
        );

        // TokenB should be fully distributed, WAVAX should be half distributed
        expect(tokenBEarned).to.be.closeTo(
          ethers.parseEther("100"),
          ethers.parseEther("1")
        );
        expect(wavaxEarned).to.be.closeTo(
          ethers.parseEther("50"),
          ethers.parseEther("1")
        );
      });

      it("should allow reward claims after period ends", async function () {
        await tokenA
          .connect(user1)
          .approve(isbjornStaking.target, ethers.parseEther("10"));
        await isbjornStaking.connect(user1).stake(ethers.parseEther("10"));

        // Advance past reward period
        await ethers.provider.send("evm_increaseTime", [WEEK + 1]);
        await ethers.provider.send("evm_mine", []);

        const initialBalance = await tokenB.balanceOf(user1Address);
        await isbjornStaking.connect(user1).claimAll();
        const finalBalance = await tokenB.balanceOf(user1Address);

        // Should receive full reward amount
        expect(finalBalance - initialBalance).to.be.closeTo(
          ethers.parseEther("100"),
          ethers.parseEther("1")
        );
      });
    });

    describe("Reflection Handling", function () {
      it("should track reflections for a single staker", async function () {
        // Initial stake
        await tokenA
          .connect(user1)
          .approve(isbjornStaking.target, ethers.parseEther("100"));
        await isbjornStaking.connect(user1).stake(ethers.parseEther("10"));

        await ethers.provider.send("evm_mine", []);

        // Send reflection
        await tokenB
          .connect(owner)
          .transfer(isbjornStaking.target, ethers.parseEther("50"));

        await ethers.provider.send("evm_mine", []);

        // Check reflection earnings
        const initialBalance = await tokenB.balanceOf(user1Address);
        await isbjornStaking.connect(user1).claimAll();
        const finalBalance = await tokenB.balanceOf(user1Address);

        // Should receive full reflection amount since they're the only staker
        expect(finalBalance - initialBalance).to.be.closeTo(
          ethers.parseEther("50"),
          ethers.parseEther("0.001")
        );
      });

      it("should distribute reflections proportionally between stakers", async function () {
        // User1 stakes 10 tokens (1/3 of total)
        await tokenA
          .connect(user1)
          .approve(isbjornStaking.target, ethers.parseEther("100"));
        await isbjornStaking.connect(user1).stake(ethers.parseEther("10"));

        // User2 stakes 20 tokens (2/3 of total)
        await tokenA
          .connect(user2)
          .approve(isbjornStaking.target, ethers.parseEther("100"));
        await isbjornStaking.connect(user2).stake(ethers.parseEther("20"));

        // Send reflection
        await tokenB
          .connect(owner)
          .transfer(isbjornStaking.target, ethers.parseEther("30"));

        // Check User1's reflection (should be ~10 tokens)
        const user1InitialBalance = await tokenB.balanceOf(user1Address);
        await isbjornStaking.connect(user1).claimAll();
        const user1FinalBalance = await tokenB.balanceOf(user1Address);
        const user1Reflection = user1FinalBalance - user1InitialBalance;

        // Check User2's reflection (should be ~20 tokens)
        const user2InitialBalance = await tokenB.balanceOf(user2Address);
        await isbjornStaking.connect(user2).claimAll();
        const user2FinalBalance = await tokenB.balanceOf(user2Address);
        const user2Reflection = user2FinalBalance - user2InitialBalance;

        // User2 should receive twice as much as User1
        expect(user2Reflection).to.be.closeTo(
          user1Reflection * 2n,
          ethers.parseEther("0.1")
        );
      });

      it("should handle reflection claims after unstaking", async function () {
        // Initial stake
        await tokenA
          .connect(user1)
          .approve(isbjornStaking.target, ethers.parseEther("100"));
        await isbjornStaking.connect(user1).stake(ethers.parseEther("10"));

        // Send reflection
        await tokenB
          .connect(owner)
          .transfer(isbjornStaking.target, ethers.parseEther("50"));

        await ethers.provider.send("evm_mine", []);

        const initialBalance = await tokenB.balanceOf(user1Address);

        // Unstake
        await isbjornStaking.connect(user1).withdraw(ethers.parseEther("10"));

        const finalBalance = await tokenB.balanceOf(user1Address);

        expect(finalBalance - initialBalance).to.be.closeTo(
          ethers.parseEther("50"),
          ethers.parseEther("0.001")
        );
      });

      it("should correctly handle claimAll function", async function () {
        // Setup using different tokens for rewards and reflections
        // Use WAVAX for rewards to avoid confusion with reflection token
        await WAVAX.deposit({ value: ethers.parseEther("100") });
        await WAVAX.approve(isbjornStaking.target, ethers.parseEther("100"));
        await isbjornStaking.queueNewRewards(
          ethers.parseEther("100"),
          WAVAX.target,
          WEEK
        );

        // Stake tokens
        await tokenA
          .connect(user1)
          .approve(isbjornStaking.target, ethers.parseEther("100"));
        await isbjornStaking.connect(user1).stake(ethers.parseEther("10"));

        // Advance time for rewards to accumulate
        await ethers.provider.send("evm_increaseTime", [WEEK / 2]);
        await ethers.provider.send("evm_mine", []);

        // Send reflection
        await tokenB
          .connect(owner)
          .transfer(isbjornStaking.target, ethers.parseEther("50"));

        // Check initial balances
        const initialWAVAXBalance = await WAVAX.balanceOf(user1Address);
        const initialTokenBBalance = await tokenB.balanceOf(user1Address);

        // Claim all rewards and reflections
        await isbjornStaking.connect(user1).claimAll();

        // Check final balances
        const finalWAVAXBalance = await WAVAX.balanceOf(user1Address);
        const finalTokenBBalance = await tokenB.balanceOf(user1Address);

        // Should receive ~50 WAVAX (rewards) and 50 tokenB (reflections)
        expect(finalWAVAXBalance - initialWAVAXBalance).to.be.closeTo(
          ethers.parseEther("50"),
          ethers.parseEther("1")
        );
        expect(finalTokenBBalance - initialTokenBBalance).to.be.closeTo(
          ethers.parseEther("50"),
          ethers.parseEther("1")
        );
      });
    });
  });
});

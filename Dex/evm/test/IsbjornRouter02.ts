import { ethers } from "hardhat";
import { expect } from "chai";
import { Signer, ContractTransactionResponse, Addressable } from "ethers";

import {
  ERC20Mock,
  IcePond,
  IcePond__factory,
  IcePondFactory,
  IsbjornRouter02,
  WAVAXMock,
} from "../types";

describe("IsbjornRouter02", function () {
  let router: IsbjornRouter02;
  let factory: IcePondFactory;
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

    const Token = await ethers.getContractFactory("ERC20Mock");
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
});

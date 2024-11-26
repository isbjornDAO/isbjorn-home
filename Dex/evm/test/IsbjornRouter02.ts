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
  let user1: Signer;
  let user2: Signer;
  let user3: Signer;

  let pairTokenFactory: IcePond__factory;

  beforeEach(async function () {
    accounts = await ethers.getSigners();

    [owner, user1, user2, user3] = accounts;
    ownerAddress = await owner.getAddress();

    const Factory = await ethers.getContractFactory("IcePondFactory");
    factory = await Factory.deploy(ownerAddress);
    await factory.waitForDeployment();

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
    describe("Add Liquidity", function () {
      it("should add liquidity for 2 tokens successfully when isVolatile = true", async function () {
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
          true, // isVolatile
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

        const pairAddress = await router.pairFor(
          true,
          tokenA.target,
          tokenB.target
        );

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
      it("should add liquidity for a token and AVAX successfully when isVolatile = true", async function () {
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
          true, // isVolatile
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

        const pairAddress = await router.pairFor(
          true,
          tokenA.target,
          WAVAX.target
        );

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
      it("should add liquidity for a token and WAVAX successfully when isVolatile = true", async function () {
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
          true, // isVolatile
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

        const pairAddress = await router.pairFor(
          true,
          tokenA.target,
          WAVAX.target
        );

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
    describe("Remove Liquidity", function () {
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
          true, // isVolatile
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
          true, // isVolatile
          tokenA.target,
          amountADesired,
          amountAMin,
          amountBMin,
          ownerAddress,
          deadline,
          { value: amountBDesired }
        );
      });
      it("should remove liquidity for 2 tokens successfully when isVolatile = true", async function () {
        const latestBlock = await ethers.provider.getBlock("latest");

        if (!latestBlock) {
          throw new Error("Failed to fetch the latest block.");
        }

        const deadline = latestBlock.timestamp + 3600;
        const pairAddress = await router.pairFor(
          true,
          tokenA.target,
          tokenB.target
        );

        const initialOwnerTokenABalance = await tokenA.balanceOf(ownerAddress);
        const initialOwnerTokenBBalance = await tokenB.balanceOf(ownerAddress);

        const pairTokenABalance = await tokenA.balanceOf(pairAddress);
        const pairTokenBBalance = await tokenB.balanceOf(pairAddress);

        const pair: IcePond = pairTokenFactory.attach(pairAddress) as IcePond;
        const ownerLiquidityBalance = await pair.balanceOf(ownerAddress);

        await pair.connect(owner).approve(router.target, ownerLiquidityBalance);

        const tx: ContractTransactionResponse = await router.removeLiquidity(
          true,
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
      it("should remove liquidity for a token and AVAX successfully when isVolatile = true", async function () {
        const latestBlock = await ethers.provider.getBlock("latest");

        if (!latestBlock) {
          throw new Error("Failed to fetch the latest block.");
        }

        const deadline = latestBlock.timestamp + 3600;
        const pairAddress = await router.pairFor(
          true,
          tokenA.target,
          WAVAX.target
        );

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
            true,
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
    });
  });
});

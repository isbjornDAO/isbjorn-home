import { ethers } from "hardhat";
import { expect } from "chai";
import { Signer, ContractTransactionResponse, Addressable } from "ethers";

import {
  ERC20Mock,
  IcePond,
  IcePondFactory,
  IsbjornRouter02,
  WAVAXMock,
} from "../types";

describe("IsbjornRouter02 - isVolatile = true", function () {
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

  beforeEach(async function () {
    accounts = await ethers.getSigners();

    [owner, user1, user2, user3] = accounts;
    ownerAddress = await owner.getAddress();

    // Deploy factory
    const Factory = await ethers.getContractFactory("IcePondFactory");
    factory = await Factory.deploy(ownerAddress);
    await factory.waitForDeployment();

    // Deploy WAVAX
    const Wavax = await ethers.getContractFactory("WAVAXMock");
    WAVAX = await Wavax.deploy();
    await WAVAX.waitForDeployment();

    // Deploy router
    const Router = await ethers.getContractFactory("IsbjornRouter02");
    router = await Router.deploy(factory.target, WAVAX.target);
    await router.waitForDeployment();

    // Deploy mock tokens
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
  });

  it("should add liquidity successfully when isVolatile = true", async function () {
    const amountADesired = ethers.parseEther("10");
    const amountBDesired = ethers.parseEther("20");
    const amountAMin = ethers.parseEther("9");
    const amountBMin = ethers.parseEther("18");
    const latestBlock = await ethers.provider.getBlock("latest");

    if (!latestBlock) {
      throw new Error("Failed to fetch the latest block.");
    }

    const deadline = latestBlock.timestamp + 3600;

    // Record initial balances
    const initialOwnerTokenABalance = await tokenA.balanceOf(ownerAddress);
    const initialOwnerTokenBBalance = await tokenB.balanceOf(ownerAddress);

    // Approve router to transfer tokens
    await tokenA.connect(owner).approve(router.target, amountADesired);
    await tokenB.connect(owner).approve(router.target, amountBDesired);

    // Call addLiquidity with isVolatile = true
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

    // Record new balances after liquidity addition
    const newOwnerTokenABalance = await tokenA.balanceOf(ownerAddress);
    const newOwnerTokenBBalance = await tokenB.balanceOf(ownerAddress);

    const pairAddress = await router.pairFor(
      true,
      tokenA.target,
      tokenB.target
    );

    // Record new liquidity pool pair balances
    const newPairTokenABalance = await tokenA.balanceOf(pairAddress);
    const newPairTokenBBalance = await tokenB.balanceOf(pairAddress);

    // Assertions
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

    // Optional: You can also check the liquidity added to the pair contract, if any tracking is available
    // Example: check liquidity tokens balance after adding liquidity
  });

  //   it("should remove liquidity successfully when isVolatile = true", async function () {
  //     const [owner] = accounts;
  //     const liquidity = ethers.parseEther("5");
  //     const amountAMin = ethers.parseEther("4.5");
  //     const amountBMin = ethers.parseEther("9");
  //     const latestBlock = await ethers.provider.getBlock("latest");
  //     if (!latestBlock) {
  //       throw new Error("Failed to fetch the latest block.");
  //     }
  //     const deadline = latestBlock.timestamp + 3600;

  //     // Mock liquidity token for the pair
  //     const pairAddress = await factory.getPair(
  //       true,
  //       tokenA.target,
  //       tokenB.target
  //     );
  //     const PairToken = await ethers.getContractFactory("IcePond");
  //     const liquidityToken = PairToken.attach(pairAddress) as IcePond;

  //     // Approve router to transfer liquidity token
  //     await liquidityToken.connect(owner).approve(router.target, liquidity);

  //     // Call removeLiquidity with isVolatile = true
  //     const tx: ContractTransactionResponse = await router.removeLiquidity(
  //       true, // isVolatile
  //       tokenA.target,
  //       tokenB.target,
  //       liquidity,
  //       amountAMin,
  //       amountBMin,
  //       ownerAddress,
  //       deadline
  //     );

  //     const receipt = await tx.wait();
  //     if (!receipt) {
  //       throw new Error(
  //         "Transaction receipt is null. The transaction may not have been mined."
  //       );
  //     }
  //     const liquidityEvent = receipt.logs
  //       .map((log) => {
  //         try {
  //           return router.interface.parseLog(log);
  //         } catch (e) {
  //           return null;
  //         }
  //       })
  //       .find((parsed) => parsed?.name === "LiquidityRemoved");
  //     expect(liquidityEvent).to.not.be.undefined;
  //     const [amountA, amountB] = liquidityEvent!.args!;
  //     expect(amountA).to.be.at.least(amountAMin);
  //     expect(amountB).to.be.at.least(amountBMin);
  //   });

  //   it("should perform a swap successfully when isVolatile = true", async function () {
  //     const [owner] = accounts;
  //     const amountIn = ethers.parseEther("10");
  //     const amountOutMin = ethers.parseEther("18");
  //     const path = [tokenA.target, tokenB.target];
  //     const latestBlock = await ethers.provider.getBlock("latest");
  //     if (!latestBlock) {
  //       throw new Error("Failed to fetch the latest block.");
  //     }
  //     const deadline = latestBlock.timestamp + 3600;

  //     // Approve router to transfer tokens
  //     await tokenA.connect(owner).approve(router.target, amountIn);

  //     // Call swapExactTokensForTokens with isVolatile = true
  //     const tx: ContractTransactionResponse =
  //       await router.swapExactTokensForTokens(
  //         true, // isVolatile
  //         amountIn,
  //         amountOutMin,
  //         path,
  //         ownerAddress,
  //         deadline
  //       );

  //     const receipt = await tx.wait();
  //     if (!receipt) {
  //       throw new Error(
  //         "Transaction receipt is null. The transaction may not have been mined."
  //       );
  //     }
  //     const swapEvent = receipt.logs
  //       .map((log) => {
  //         try {
  //           return router.interface.parseLog(log);
  //         } catch (e) {
  //           return null;
  //         }
  //       })
  //       .find((parsed) => parsed?.name === "Swap");
  //     expect(swapEvent).to.not.be.undefined;
  //     const [amountInResult, amountOutResult] = swapEvent!.args!;
  //     expect(amountInResult).to.equal(amountIn);
  //     expect(amountOutResult).to.be.at.least(amountOutMin);
  //   });
});

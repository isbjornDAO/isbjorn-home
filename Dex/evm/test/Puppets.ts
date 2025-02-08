import { ethers } from "hardhat";
import { expect } from "chai";
import { Signer, ContractTransactionResponse, Addressable } from "ethers";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { Puppets } from "../types";

describe("Puppets", function () {
  let Puppets;
  let puppets: Puppets;
  let owner: Signer;
  let addr1: Signer;
  let addr2: Signer;
  let addrs: Signer[];
  let startTime: number;

  beforeEach(async function () {
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    Puppets = await ethers.getContractFactory("Puppets");
    puppets = (await Puppets.deploy("Puppets", "PUP")) as Puppets;

    // Get current timestamp
    startTime = (await time.latest()) + 60; // Start in 1 minute
    await puppets.initPhases(startTime);
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await puppets.owner()).to.equal(await owner.getAddress());
    });

    it("Should mint 250 initial tokens to owner", async function () {
      expect(await puppets.totalSupply()).to.equal(250);
    });
  });

  describe("Phase Management", function () {
    it("Should correctly initialize all phases", async function () {
      const phaseOne = await puppets.detailsByPhase(1);
      expect(phaseOne.price).to.equal(ethers.parseEther("1.0"));
      expect(phaseOne.startTime).to.equal(startTime);
      expect(phaseOne.phaseLimit).to.equal(400);

      const phaseTwo = await puppets.detailsByPhase(2);
      expect(phaseTwo.price).to.equal(ethers.parseEther("1.2"));
      expect(phaseTwo.startTime).to.equal(startTime + 600); // 10 minutes
      expect(phaseTwo.phaseLimit).to.equal(550);
    });

    it("Should return correct current phase", async function () {
      expect(await puppets.getCurrentPhase()).to.equal(0); // None

      await time.increaseTo(startTime);
      expect(await puppets.getCurrentPhase()).to.equal(1); // Phase One

      await time.increaseTo(startTime + 600); // +10 minutes
      expect(await puppets.getCurrentPhase()).to.equal(2); // Phase Two
    });
  });

  describe("Whitelist Management", function () {
    it("Should set allowances for single user correctly", async function () {
      const user = await addr1.getAddress();
      await puppets.setUserPhaseAllowance(user, 1); // Phase One

      expect(await puppets.userAllowanceByPhase(1, user)).to.equal(1);
      expect(await puppets.userAllowanceByPhase(2, user)).to.equal(2);
      expect(await puppets.userAllowanceByPhase(3, user)).to.equal(3);
      expect(await puppets.userAllowanceByPhase(4, user)).to.equal(4);
      expect(await puppets.userAllowanceByPhase(5, user)).to.equal(5);
    });

    it("Should set allowances for multiple users", async function () {
      const users = [await addr1.getAddress(), await addr2.getAddress()];
      await puppets.setUserPhaseAllowances(users, 2); // Phase Two

      for (let user of users) {
        expect(await puppets.userAllowanceByPhase(2, user)).to.equal(2);
        expect(await puppets.userAllowanceByPhase(3, user)).to.equal(3);
        expect(await puppets.userAllowanceByPhase(4, user)).to.equal(4);
        expect(await puppets.userAllowanceByPhase(5, user)).to.equal(5);
      }
    });
  });

  describe("Minting", function () {
    beforeEach(async function () {
      // Set up addr1 for whitelist minting
      await puppets.setUserPhaseAllowance(await addr1.getAddress(), 1);
      await time.increaseTo(startTime);
    });

    it("Should allow whitelisted address to mint in correct phase", async function () {
      const mintTx = await puppets.connect(addr1).wlMint(1, 1, {
        value: ethers.parseEther("1.0"),
      });
      await mintTx.wait();

      expect(await puppets.totalSupply()).to.equal(251);
      expect(await puppets.ownerOf(251)).to.equal(await addr1.getAddress());
    });

    it("Should fail when minting more than allowed", async function () {
      await expect(
        puppets.connect(addr1).wlMint(2, 1, {
          value: ethers.parseEther("2.0"),
        })
      ).to.be.revertedWith("no mints left");
    });

    it("Should fail when minting in wrong phase", async function () {
      await expect(
        puppets.connect(addr1).wlMint(1, 2, {
          value: ethers.parseEther("1.2"),
        })
      ).to.be.revertedWith("Incorrect phase");
    });

    it("Should allow public minting in public phase", async function () {
      await time.increaseTo(startTime + 3000); // Move to public phase
      const mintTx = await puppets.connect(addr2).publicMint(1, {
        value: ethers.parseEther("2.0"),
      });
      await mintTx.wait();

      expect(await puppets.totalSupply()).to.equal(251);
      expect(await puppets.ownerOf(251)).to.equal(await addr2.getAddress());
    });
  });

  describe("Panic Minting", function () {
    it("Should not allow panic minting before phase one starts", async function () {
      await expect(
        puppets.connect(addr1).panicMint(1, {
          value: ethers.parseEther("2.0"),
        })
      ).to.be.revertedWith("None left in this phase");
    });

    it("Should allow panic minting during any active phase", async function () {
      // Test during phase one
      await time.increaseTo(startTime);
      await puppets.connect(addr1).panicMint(1, {
        value: ethers.parseEther("2.0"),
      });
      expect(await puppets.totalSupply()).to.equal(251);

      // Test during phase two
      await time.increaseTo(startTime + 600);
      await puppets.connect(addr2).panicMint(1, {
        value: ethers.parseEther("2.0"),
      });
      expect(await puppets.totalSupply()).to.equal(252);

      // Test during public phase
      await time.increaseTo(startTime + 3000);
      await puppets.connect(addr1).panicMint(1, {
        value: ethers.parseEther("2.0"),
      });
      expect(await puppets.totalSupply()).to.equal(253);
    });

    it("Should fail when trying to panic mint more than 1 at a time", async function () {
      await time.increaseTo(startTime);
      await expect(
        puppets.connect(addr1).panicMint(2, {
          value: ethers.parseEther("4.0"),
        })
      ).to.be.revertedWith("Can only panic mint 1 at a time");
    });

    it("Should fail when not sending enough ETH for panic mint", async function () {
      await time.increaseTo(startTime);
      await expect(
        puppets.connect(addr1).panicMint(1, {
          value: ethers.parseEther("1.0"), // Regular phase one price instead of panic price
        })
      ).to.be.revertedWith("Not enough AVAX sent.");
    });

    it("Should fail panic mint when minting is not active", async function () {
      await time.increaseTo(startTime);
      await puppets.setMintActive(false);
      await expect(
        puppets.connect(addr1).panicMint(1, {
          value: ethers.parseEther("2.0"),
        })
      ).to.be.revertedWith("Minting is not active.");
    });
  });

  describe("Royalty Management", function () {
    it("Should set correct initial royalty info", async function () {
      const [receiver, amount] = await puppets.royaltyInfo(
        1,
        ethers.parseEther("1.0")
      );
      expect(receiver).to.equal(await owner.getAddress());
      expect(amount).to.equal(ethers.parseEther("0.06")); // 6%
    });
  });
});

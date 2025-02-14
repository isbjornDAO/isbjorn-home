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
      const wlPhase = await puppets.detailsByPhase(1); // WL Phase
      expect(wlPhase.price).to.equal(ethers.parseEther("1.0"));
      expect(wlPhase.startTime).to.equal(startTime);
      expect(wlPhase.phaseLimit).to.equal(400);

      const p1Phase = await puppets.detailsByPhase(2); // P1 Phase
      expect(p1Phase.price).to.equal(ethers.parseEther("1.25"));
      expect(p1Phase.startTime).to.equal(startTime + 600); // 10 minutes
      expect(p1Phase.phaseLimit).to.equal(550);
    });

    it("Should return correct current phase", async function () {
      expect(await puppets.getCurrentPhase()).to.equal(0); // None

      await time.increaseTo(startTime);
      expect(await puppets.getCurrentPhase()).to.equal(1); // WL Phase

      await time.increaseTo(startTime + 600); // +10 minutes
      expect(await puppets.getCurrentPhase()).to.equal(2); // P1 Phase
    });
  });

  describe("Whitelist Management", function () {
    it("Should add addresses to whitelist", async function () {
      const users = [await addr1.getAddress(), await addr2.getAddress()];
      await puppets.addToWhitelist(users);

      expect(await puppets.whiteList(await addr1.getAddress())).to.be.true;
      expect(await puppets.whiteList(await addr2.getAddress())).to.be.true;
    });

    it("Should remove addresses from whitelist", async function () {
      const users = [await addr1.getAddress()];
      await puppets.addToWhitelist(users);
      await puppets.removeFromWhitelist(users);

      expect(await puppets.whiteList(await addr1.getAddress())).to.be.false;
    });
  });

  describe("Minting", function () {
    beforeEach(async function () {
      // Add addr1 to whitelist
      await puppets.addToWhitelist([await addr1.getAddress()]);
      await puppets.setMintActive(true);
      await time.increaseTo(startTime);
    });

    describe("Whitelist Minting", function () {
      it("Should allow whitelisted address to mint in WL phase", async function () {
        await puppets.connect(addr1).wlMint({
          value: ethers.parseEther("1.0"),
        });

        expect(await puppets.totalSupply()).to.equal(251);
        expect(await puppets.ownerOf(251)).to.equal(await addr1.getAddress());
        expect(
          await puppets.mintsInPhase(1, await addr1.getAddress())
        ).to.equal(1);
      });

      it("Should not allow whitelisted address to mint twice in WL phase", async function () {
        await puppets.connect(addr1).wlMint({
          value: ethers.parseEther("1.0"),
        });

        await expect(
          puppets.connect(addr1).wlMint({
            value: ethers.parseEther("1.0"),
          })
        ).to.be.revertedWith("Already minted WL");
      });

      it("Should not allow non-whitelisted address to mint in WL phase", async function () {
        await expect(
          puppets.connect(addr2).wlMint({
            value: ethers.parseEther("1.0"),
          })
        ).to.be.revertedWith("Not whitelisted");
      });
    });

    describe("Public Minting", function () {
      beforeEach(async function () {
        await time.increaseTo(startTime + 600); // Move to P1
      });

      it("Should allow anyone to mint in public phase", async function () {
        await puppets.connect(addr2).publicMint(2, 2, {
          // Phase P1, mint 2
          value: ethers.parseEther("2.5"), // 1.25 ETH * 2
        });

        expect(await puppets.totalSupply()).to.equal(252);
        expect(
          await puppets.mintsInPhase(2, await addr2.getAddress())
        ).to.equal(2);
      });

      it("Should not allow minting more than 2 tokens in a public phase", async function () {
        await expect(
          puppets.connect(addr2).publicMint(3, 2, {
            // Try to mint 3 in P1
            value: ethers.parseEther("3.75"),
          })
        ).to.be.revertedWith("Exceeds phase mint limit");
      });

      it("Should allow minting in multiple phases", async function () {
        // Mint in P1
        await puppets.connect(addr2).publicMint(2, 2, {
          value: ethers.parseEther("2.5"),
        });

        // Move to P2
        await time.increaseTo(startTime + 1200);

        // Mint in P2
        await puppets.connect(addr2).publicMint(2, 3, {
          value: ethers.parseEther("3"), // 1.5 ETH * 2
        });

        expect(
          await puppets.mintsInPhase(2, await addr2.getAddress())
        ).to.equal(2);
        expect(
          await puppets.mintsInPhase(3, await addr2.getAddress())
        ).to.equal(2);
      });

      it("Should not allow minting in incorrect phase", async function () {
        await expect(
          puppets.connect(addr2).publicMint(1, 3, {
            // Try to mint in P2 during P1
            value: ethers.parseEther("1.4"),
          })
        ).to.be.revertedWith("Incorrect phase");
      });
    });
  });

  describe("Royalty Management", function () {
    it("Should set correct initial royalty info", async function () {
      const [receiver, amount] = await puppets.royaltyInfo(
        1,
        ethers.parseEther("1.0")
      );
      expect(receiver).to.equal("0x099035EcD2f4B87A0eE282Bd41418fC099C7dfb6");
      expect(amount).to.equal(ethers.parseEther("0.06")); // 6%
    });
  });
});

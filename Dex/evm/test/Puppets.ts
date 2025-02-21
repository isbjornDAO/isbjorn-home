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
  let devSigner: Signer;
  let startTime: number;

  // Limits:
  // - Initial tokens: 350 (minted on construction)
  // - Each round (phase) allows minting of 130 tokens total.
  // - WL phase: each whitelisted wallet may mint 1 token.
  // - Public phases (phases 2-4): per-wallet limit is 2 tokens.
  // - Final public phase (phase 5): per-wallet limit is 10 tokens.
  const roundLimit = 130;
  const publicLimit = 2;
  const finalPublicLimit = 10;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    Puppets = await ethers.getContractFactory("Puppets");
    puppets = (await Puppets.deploy()) as Puppets;

    // Impersonate the devAddress (hardcoded owner)
    const daoAddress = await puppets.daoAddress();
    await ethers.provider.send("hardhat_impersonateAccount", [daoAddress]);
    devSigner = await ethers.getSigner(daoAddress);

    // Fund the dev address so it has enough gas.
    await owner.sendTransaction({
      to: daoAddress,
      value: ethers.parseEther("10"),
    });

    // Set startTime 1 minute in the future and initialize phases via devSigner.
    startTime = (await time.latest()) + 60;
    await puppets.connect(devSigner).initPhases(startTime);
    await puppets.connect(devSigner).setMintActive(true);

    // Also, set the royalty receiver to the expected address.
    await puppets
      .connect(devSigner)
      .setRoyaltyReceiver("0x099035EcD2f4B87A0eE282Bd41418fC099C7dfb6");
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await puppets.owner()).to.equal(await puppets.daoAddress());
    });

    it("Should mint 350 initial tokens to DAO on construction", async function () {
      expect(await puppets.totalSupply()).to.equal(350);
    });
  });

  describe("Phase Management", function () {
    it("Should correctly initialize all phases", async function () {
      const wlPhase = await puppets.detailsByPhase(1); // WL Phase
      expect(wlPhase.price).to.equal(ethers.parseEther("1.0"));
      expect(wlPhase.startTime).to.equal(startTime);
      // Updated expected phase limit for WL phase (if needed)
      expect(wlPhase.phaseLimit).to.equal(480);

      const p1Phase = await puppets.detailsByPhase(2); // P1 Phase
      expect(p1Phase.price).to.equal(ethers.parseEther("1.25"));
      expect(p1Phase.startTime).to.equal(startTime + 600); // +10 minutes
      expect(p1Phase.phaseLimit).to.equal(610);

      const p2Phase = await puppets.detailsByPhase(3); // P2 Phase
      expect(p2Phase.price).to.equal(ethers.parseEther("1.5"));
      expect(p2Phase.startTime).to.equal(startTime + 600 * 2); // +20 minutes
      expect(p2Phase.phaseLimit).to.equal(740);

      const p3Phase = await puppets.detailsByPhase(4); // P3 Phase
      expect(p3Phase.price).to.equal(ethers.parseEther("1.75"));
      expect(p3Phase.startTime).to.equal(startTime + 600 * 3); // +30 minutes
      expect(p3Phase.phaseLimit).to.equal(870);

      const p4Phase = await puppets.detailsByPhase(5); // P4 Phase
      expect(p4Phase.price).to.equal(ethers.parseEther("2"));
      expect(p4Phase.startTime).to.equal(startTime + 600 * 4); // +40 minutes
      expect(p4Phase.phaseLimit).to.equal(1000);
    });

    it("Should return correct current phase", async function () {
      expect(await puppets.getCurrentPhase()).to.equal(0); // None
      await time.increaseTo(startTime);
      expect(await puppets.getCurrentPhase()).to.equal(1); // WL Phase
      await time.increaseTo(startTime + 600);
      expect(await puppets.getCurrentPhase()).to.equal(2); // P1 Phase
      await time.increaseTo(startTime + 600 * 2);
      expect(await puppets.getCurrentPhase()).to.equal(3); // P2 Phase
      await time.increaseTo(startTime + 600 * 3);
      expect(await puppets.getCurrentPhase()).to.equal(4); // P3 Phase
      await time.increaseTo(startTime + 600 * 4);
      expect(await puppets.getCurrentPhase()).to.equal(5); // P4 Phase
    });
  });

  describe("Whitelist Management", function () {
    it("Should add addresses to whitelist", async function () {
      const users = [await addr1.getAddress(), await addr2.getAddress()];
      await puppets.connect(devSigner).addToWhitelist(users);
      expect(await puppets.whiteList(await addr1.getAddress())).to.be.true;
      expect(await puppets.whiteList(await addr2.getAddress())).to.be.true;
    });

    it("Should remove addresses from whitelist", async function () {
      const users = [await addr1.getAddress()];
      await puppets.connect(devSigner).addToWhitelist(users);
      await puppets.connect(devSigner).removeFromWhitelist(users);
      expect(await puppets.whiteList(await addr1.getAddress())).to.be.false;
    });
  });

  describe("Minting", function () {
    describe("Whitelist Minting", function () {
      context("Before startTime", function () {
        it("Should not allow minting before startTime even if mintActive is true", async function () {
          // Do NOT advance time; current time is less than startTime.
          await expect(
            puppets.connect(addr1).wlMint({
              value: ethers.parseEther("1.0"),
            })
          ).to.be.revertedWith("Incorrect phase");
        });
      });

      context("After startTime", function () {
        beforeEach(async function () {
          // Advance time to just after startTime.
          await time.increaseTo(startTime + 2);
        });

        it("Should allow whitelisted address to mint in WL phase", async function () {
          await puppets.connect(devSigner).addToWhitelist([addr1]);
          await puppets.connect(addr1).wlMint({
            value: ethers.parseEther("1.0"),
          });
          expect(await puppets.totalSupply()).to.equal(351);
          expect(await puppets.ownerOf(351)).to.equal(await addr1.getAddress());
          expect(
            await puppets.mintsInPhase(1, await addr1.getAddress())
          ).to.equal(1);
        });

        it("Should not allow whitelisted address to mint twice in WL phase", async function () {
          await puppets.connect(devSigner).addToWhitelist([addr1]);
          await puppets.connect(addr1).wlMint({
            value: ethers.parseEther("1.0"),
          });
          await expect(
            puppets.connect(addr1).wlMint({
              value: ethers.parseEther("1.0"),
            })
          ).to.be.revertedWith("Already minted WL");
        });
      });

      it("Should not allow non-whitelisted address to mint in WL phase", async function () {
        // Advance time to WL phase so that the phase check passes.
        await time.increaseTo(startTime + 2);
        await expect(
          puppets.connect(addr2).wlMint({
            value: ethers.parseEther("1.0"),
          })
        ).to.be.revertedWith("Not whitelisted");
      });
    });

    describe("Public Minting", function () {
      beforeEach(async function () {
        // Advance time to public phase (P1)
        await time.increaseTo(startTime + 600);
      });

      it("Should allow anyone to mint in public phase", async function () {
        await puppets.connect(addr2).publicMint(2, 2, {
          // P1: mint 2 tokens at 1.25 ETH each.
          value: ethers.parseEther("2.5"),
        });
        expect(await puppets.totalSupply()).to.equal(352);
        expect(
          await puppets.mintsInPhase(2, await addr2.getAddress())
        ).to.equal(2);
      });

      it("Should not allow minting more than 2 tokens in a public phase (P1-P3)", async function () {
        await expect(
          puppets.connect(addr2).publicMint(3, 2, {
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
        await puppets.connect(addr2).publicMint(2, 3, {
          value: ethers.parseEther("3"),
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
            value: ethers.parseEther("1.5"),
          })
        ).to.be.revertedWith("Incorrect phase");
      });
    });

    //   describe("Mint-Out Test", function () {
    //     it("Should mint out all 5 rounds correctly and fail extra mints", async function () {
    //       // In this test we assume:
    //       // - Phase 1 (WL): each whitelisted address may mint 1 token; round limit = 130.
    //       // - Phases 2-4 (Public): each wallet may mint up to 2 tokens per phase; round limit = 130.
    //       // - Phase 5 (Final Public): each wallet may mint up to 10 tokens; round limit = 130.
    //       // We'll add all available signers (owner, addr1, addr2, and addrs) to the whitelist.
    //       // Also, we define an extra signer (not used in the main mint loop) to test extra WL minting.

    //       const freshSigners = [];
    //       for (let i = 0; i < 130; i++) {
    //         freshSigners.push(
    //           ethers.Wallet.createRandom().connect(ethers.provider)
    //         );
    //       }

    //       // Define the extraSigner who will be added to the WL, but will not mint
    //       const extraSigner = ethers.Wallet.createRandom().connect(
    //         ethers.provider
    //       );

    //       // Funding all fresh signers with 1 ETH (example amount)
    //       const fundingAmount = ethers.parseEther("5.0"); // Adjust this as needed

    //       // Use one of Hardhat's default accounts to fund fresh signers
    //       const defaultAccount = (await ethers.getSigners())[0]; // Default account has 1000 ETH

    //       // Fund the fresh signers from defaultAccount
    //       for (const signer of freshSigners) {
    //         // Send funds from the default account to each fresh signer
    //         await defaultAccount.sendTransaction({
    //           to: await signer.getAddress(),
    //           value: fundingAmount,
    //         });
    //       }

    //       // Also fund the extraSigner
    //       await defaultAccount.sendTransaction({
    //         to: await extraSigner.getAddress(),
    //         value: fundingAmount,
    //       });

    //       // Combine the fresh signers and the extraSigner into the whitelist
    //       const allSigners = freshSigners; // 130 signers who will mint
    //       const addresses = await Promise.all(
    //         allSigners.map((signer) => signer.getAddress())
    //       );
    //       addresses.push(await extraSigner.getAddress()); // Add the extra signer to the whitelist

    //       await puppets.connect(devSigner).addToWhitelist(addresses);

    //       // Initial supply is 350 (minted on construction)
    //       let expectedSupply = 350;

    //       // Loop over phases 1 to 5.
    //       for (let phase = 1; phase <= 5; phase++) {
    //         // Set time to a point within the phase.
    //         await time.increaseTo(startTime + (phase - 1) * 600 + 2);

    //         let roundMinted = 0;
    //         for (const signer of allSigners) {
    //           if (phase === 1) {
    //             // WL phase: each whitelisted wallet may mint 1 token.
    //             const alreadyMinted = Number(
    //               await puppets.mintsInPhase(phase, await signer.getAddress())
    //             );
    //             if (alreadyMinted >= 1) continue;
    //             await puppets
    //               .connect(signer)
    //               .wlMint({ value: ethers.parseEther("1.0") });
    //             roundMinted += 1;
    //           } else {
    //             // Public phases: wallet limit is 2 for phases 2-4, 10 for phase 5.
    //             let walletLimit = phase === 5 ? finalPublicLimit : publicLimit;
    //             const alreadyMinted = Number(
    //               await puppets.mintsInPhase(phase, await signer.getAddress())
    //             );
    //             const availableForWallet = walletLimit - alreadyMinted;
    //             if (availableForWallet <= 0) continue;
    //             const canMint = Math.min(
    //               availableForWallet,
    //               roundLimit - roundMinted
    //             );
    //             if (canMint <= 0) break;
    //             let phasePrice: string;
    //             if (phase === 2) phasePrice = "1.25";
    //             else if (phase === 3) phasePrice = "1.5";
    //             else if (phase === 4) phasePrice = "1.75";
    //             else phasePrice = "2.0";
    //             await puppets.connect(signer).publicMint(canMint, phase, {
    //               value: ethers.parseEther(
    //                 (Number(phasePrice) * canMint).toString()
    //               ),
    //             });
    //             roundMinted += canMint;
    //           }
    //           if (roundMinted >= roundLimit) break;
    //         }
    //         expectedSupply += roundMinted;
    //         expect(await puppets.totalSupply()).to.equal(
    //           expectedSupply,
    //           `After phase ${phase}`
    //         );

    //         // Attempt an extra mint in the current phase (extraSigner):
    //         if (phase === 1) {
    //           // WL phase: extraSigner should fail minting.
    //           await expect(
    //             puppets
    //               .connect(extraSigner)
    //               .wlMint({ value: ethers.parseEther("1.0") })
    //           ).to.be.revertedWith("None left in this phase");
    //         } else {
    //           let phasePrice: string;
    //           if (phase === 2) phasePrice = "1.25";
    //           else if (phase === 3) phasePrice = "1.5";
    //           else if (phase === 4) phasePrice = "1.75";
    //           else phasePrice = "2.0";

    //           // Public phase: extraSigner should fail minting.
    //           await expect(
    //             puppets.connect(extraSigner).publicMint(1, phase, {
    //               value: ethers.parseEther(phasePrice),
    //             })
    //           ).to.be.revertedWith("None left in this phase");
    //         }
    //       }

    //       // After all rounds, trying to mint more should revert.
    //       await expect(
    //         puppets.connect(extraSigner).publicMint(1, 5, {
    //           value: ethers.parseEther("2.0"),
    //         })
    //       ).to.be.revertedWith("None left in this phase");
    //     });
    //   });
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

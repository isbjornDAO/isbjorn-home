import { expect } from "chai";
import { ethers } from "hardhat";
import { DonationContract, NodeRegistry, MockERC8004 } from "../typechain-types";

describe("Isbjorn Donation Platform", function () {
    let donationContract: DonationContract;
    let nodeRegistry: NodeRegistry;
    let identityRegistry: MockERC8004;
    let owner: any;
    let donor: any;
    let validator: any;

    beforeEach(async function () {
        [owner, donor, validator] = await ethers.getSigners();

        // Deploy Mock Identity Registry
        const MockERC8004Factory = await ethers.getContractFactory("MockERC8004");
        identityRegistry = await MockERC8004Factory.deploy();
        await identityRegistry.waitForDeployment();

        // Deploy Node Registry
        const NodeRegistryFactory = await ethers.getContractFactory("NodeRegistry");
        nodeRegistry = await NodeRegistryFactory.deploy();
        await nodeRegistry.waitForDeployment();

        // Deploy Donation Contract
        const DonationContractFactory = await ethers.getContractFactory("DonationContract");
        donationContract = await DonationContractFactory.deploy(
            await nodeRegistry.getAddress(),
            await identityRegistry.getAddress()
        );
        await donationContract.waitForDeployment();

        // Grant DONATION_MANAGER_ROLE to DonationContract in NodeRegistry if needed
        // (Assuming NodeRegistry has access control, if not it's public)
    });

    it("Should accept donations and emit event", async function () {
        const donationAmount = ethers.parseEther("1.0");

        await expect(donationContract.connect(donor).donate("MyCompany", { value: donationAmount }))
            .to.emit(donationContract, "DonationReceived");

        expect(await ethers.provider.getBalance(await donationContract.getAddress())).to.equal(donationAmount);
    });

    it("Should allow pooling funds for validator nodes", async function () {
        const donationAmount = ethers.parseEther("2000.0"); // Min stake for Avalanche is usually 2000
        await donationContract.connect(donor).donate("WhaleDonor", { value: donationAmount });

        // Mock node registration logic if implemented in DonationContract
        // or verify funds are available for node deployment

        const contractBalance = await ethers.provider.getBalance(await donationContract.getAddress());
        expect(contractBalance).to.equal(donationAmount);
    });
});

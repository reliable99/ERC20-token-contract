import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";

describe("DLToken", function () {
  let initialSupply = hre.ethers.parseUnits("1000000", 18); // 1000000 tokens with 18 decimals

  const deployDLTokenListFixture = async function () {
    const DLToken = await hre.ethers.getContractFactory("DLToken");
    const [owner, addr1, addr2] = await hre.ethers.getSigners();
    const dlToken = await DLToken.deploy("DLToken", "DLT");

    return { owner, addr1, addr2, dlToken };
  };

  describe("Deployment", function () {
    it("Should set the right token name and symbol", async function () {
      const { dlToken } = await loadFixture(deployDLTokenListFixture);

      expect(await dlToken.getTokenName()).to.equal("DLToken");
      expect(await dlToken.getSymbol()).to.equal("DLT");
    });

    it("Should assign the total supply of tokens to the owner", async function () {
      const { dlToken, owner } = await loadFixture(deployDLTokenListFixture);

      expect(await dlToken.getTotalSupply()).to.equal(initialSupply);
      expect(await dlToken.balanceOf(owner.address)).to.equal(initialSupply);
    });

    it("Should set the correct decimals", async function () {
      const { dlToken } = await loadFixture(deployDLTokenListFixture);

      expect(await dlToken.decimal()).to.equal(18);
    });
  });

  describe("Transfers", function () {
    it("Should transfer tokens between accounts", async function () {
      const { dlToken, addr1 } = await loadFixture(deployDLTokenListFixture);

      const transferAmount = hre.ethers.parseUnits("100", 18);

      await dlToken.transfer(addr1.address, transferAmount);
    });

    it("Should revert if sender doesn't have enough tokens", async function () {
      const { dlToken, addr1, owner } = await loadFixture(
        deployDLTokenListFixture
      );

      const transferAmount = hre.ethers.parseUnits("2000", 18); // More than available

      await expect(
        dlToken.connect(addr1).transfer(owner.address, transferAmount)
      ).to.be.revertedWith("You can't take more than what is avaliable");
    });

   
  });

  describe("Approval and Allowance", function () {
    it("Should approve tokens for delegate", async function () {
      const { dlToken, addr1, owner } = await loadFixture(
        deployDLTokenListFixture
      );

      const approvalAmount = hre.ethers.parseUnits("100", 18);

      await dlToken.approve(addr1.address, approvalAmount);
      expect(await dlToken.allowance(owner.address, addr1.address)).to.equal(
        approvalAmount
      );
    });

  

    it("Should allow a delegate to transfer tokens on behalf of the owner", async function () {
      const { dlToken, addr1, addr2, owner } = await loadFixture(
        deployDLTokenListFixture
      );

      const transferAmount = hre.ethers.parseUnits("50", 18);

      await dlToken.approve(addr1.address, transferAmount);

      await dlToken
        .connect(addr1)
        .transferFrom(owner.address, addr2.address, transferAmount);
    });

    
  });
});
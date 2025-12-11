const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NftCollection", function () {
  let nftCollection;
  let owner, addr1, addr2, addrs;
  const name = "TestNFT";
  const symbol = "TNFT";
  const maxSupply = 100;
  const baseURI = "https://example.com/metadata";

  beforeEach(async function () {
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
    const NftCollection = await ethers.getContractFactory("NftCollection");
    nftCollection = await NftCollection.deploy(name, symbol, maxSupply, baseURI);
    await nftCollection.deployed();
  });

  describe("Deployment", function () {
    it("Should set correct name, symbol, and maxSupply", async function () {
      expect(await nftCollection.name()).to.equal(name);
      expect(await nftCollection.symbol()).to.equal(symbol);
      expect(await nftCollection.maxSupply()).to.equal(maxSupply);
      expect(await nftCollection.totalSupply()).to.equal(0);
    });

    it("Should set the owner", async function () {
      expect(await nftCollection.owner()).to.equal(owner.address);
    });
  });

  describe("Minting", function () {
    it("Should mint token successfully", async function () {
      await nftCollection.safeMint(addr1.address, 1);
      expect(await nftCollection.ownerOf(1)).to.equal(addr1.address);
      expect(await nftCollection.balanceOf(addr1.address)).to.equal(1);
      expect(await nftCollection.totalSupply()).to.equal(1);
    });

    it("Should emit Transfer event on mint", async function () {
      await expect(nftCollection.safeMint(addr1.address, 1))
        .to.emit(nftCollection, "Transfer")
        .withArgs(ethers.constants.AddressZero, addr1.address, 1);
    });

    it("Should prevent non-owner from minting", async function () {
      await expect(nftCollection.connect(addr1).safeMint(addr1.address, 1))
        .to.be.revertedWith("Only owner can call this function");
    });

    it("Should prevent minting to zero address", async function () {
      await expect(nftCollection.safeMint(ethers.constants.AddressZero, 1))
        .to.be.revertedWith("Cannot mint to zero address");
    });

    it("Should prevent double-minting same tokenId", async function () {
      await nftCollection.safeMint(addr1.address, 1);
      await expect(nftCollection.safeMint(addr2.address, 1))
        .to.be.revertedWith("Token already exists");
    });

    it("Should prevent minting beyond maxSupply", async function () {
      const localMaxSupply = 2;
      const localNft = await (await ethers.getContractFactory("NftCollection"))
        .deploy("Test", "TST", localMaxSupply, "https://test.com");
      await localNft.deployed();
      
      await localNft.safeMint(addr1.address, 1);
      await localNft.safeMint(addr2.address, 2);
      await expect(localNft.safeMint(addr1.address, 3))
        .to.be.revertedWith("Max supply reached");
    });

    it("Should prevent minting with invalid tokenId range", async function () {
      await expect(nftCollection.safeMint(addr1.address, 101))
        .to.be.revertedWith("Token ID out of range");
    });
  });

  describe("Transfers", function () {
    beforeEach(async function () {
      await nftCollection.safeMint(addr1.address, 1);
    });

    it("Should transfer token correctly", async function () {
      await nftCollection.connect(addr1).transferFrom(addr1.address, addr2.address, 1);
      expect(await nftCollection.ownerOf(1)).to.equal(addr2.address);
      expect(await nftCollection.balanceOf(addr1.address)).to.equal(0);
      expect(await nftCollection.balanceOf(addr2.address)).to.equal(1);
    });

    it("Should emit Transfer event", async function () {
      await expect(nftCollection.connect(addr1).transferFrom(addr1.address, addr2.address, 1))
        .to.emit(nftCollection, "Transfer")
        .withArgs(addr1.address, addr2.address, 1);
    });

    it("Should prevent transfer of non-existent token", async function () {
      await expect(nftCollection.connect(addr1).transferFrom(addr1.address, addr2.address, 999))
        .to.be.revertedWith("Token does not exist");
    });

    it("Should prevent unauthorized transfer", async function () {
      await expect(nftCollection.connect(addr2).transferFrom(addr1.address, addr2.address, 1))
        .to.be.revertedWith("Not authorized to transfer");
    });
  });

  describe("Approvals", function () {
    beforeEach(async function () {
      await nftCollection.safeMint(addr1.address, 1);
    });

    it("Should approve spender", async function () {
      await nftCollection.connect(addr1).approve(addr2.address, 1);
      expect(await nftCollection.getApproved(1)).to.equal(addr2.address);
    });

    it("Should emit Approval event", async function () {
      await expect(nftCollection.connect(addr1).approve(addr2.address, 1))
        .to.emit(nftCollection, "Approval")
        .withArgs(addr1.address, addr2.address, 1);
    });

    it("Approved address should transfer token", async function () {
      await nftCollection.connect(addr1).approve(addr2.address, 1);
      await nftCollection.connect(addr2).transferFrom(addr1.address, addr2.address, 1);
      expect(await nftCollection.ownerOf(1)).to.equal(addr2.address);
    });
  });

  describe("Operator Approvals", function () {
    beforeEach(async function () {
      await nftCollection.safeMint(addr1.address, 1);
      await nftCollection.safeMint(addr1.address, 2);
    });

    it("Should set operator approval for all", async function () {
      await nftCollection.connect(addr1).setApprovalForAll(addr2.address, true);
      expect(await nftCollection.isApprovedForAll(addr1.address, addr2.address)).to.be.true;
    });

    it("Should emit ApprovalForAll event", async function () {
      await expect(nftCollection.connect(addr1).setApprovalForAll(addr2.address, true))
        .to.emit(nftCollection, "ApprovalForAll")
        .withArgs(addr1.address, addr2.address, true);
    });

    it("Operator should transfer any token of owner", async function () {
      await nftCollection.connect(addr1).setApprovalForAll(addr2.address, true);
      await nftCollection.connect(addr2).transferFrom(addr1.address, addr2.address, 1);
      expect(await nftCollection.ownerOf(1)).to.equal(addr2.address);
    });
  });

  describe("TokenURI", function () {
    beforeEach(async function () {
      await nftCollection.safeMint(addr1.address, 1);
    });

    it("Should return correct tokenURI", async function () {
      const uri = await nftCollection.tokenURI(1);
      expect(uri).to.include(baseURI);
      expect(uri).to.include("1.json");
    });

    it("Should revert for non-existent token", async function () {
      await expect(nftCollection.tokenURI(999))
        .to.be.revertedWith("Token does not exist");
    });
  });

  describe("Pause/Unpause", function () {
    it("Should pause minting", async function () {
      await nftCollection.pause();
      expect(await nftCollection.paused()).to.be.true;
      await expect(nftCollection.safeMint(addr1.address, 1))
        .to.be.revertedWith("Minting is paused");
    });

    it("Should unpause minting", async function () {
      await nftCollection.pause();
      await nftCollection.unpause();
      expect(await nftCollection.paused()).to.be.false;
      await expect(nftCollection.safeMint(addr1.address, 1)).to.not.be.reverted;
    });
  });

  describe("BalanceOf", function () {
    it("Should return correct balance", async function () {
      await nftCollection.safeMint(addr1.address, 1);
      await nftCollection.safeMint(addr1.address, 2);
      expect(await nftCollection.balanceOf(addr1.address)).to.equal(2);
    });

    it("Should revert for zero address", async function () {
      await expect(nftCollection.balanceOf(ethers.constants.AddressZero))
        .to.be.revertedWith("Invalid address");
    });
  });
});

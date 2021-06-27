import { ethers } from "hardhat";
import chai from "chai";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

import { UniswapV3Fixture } from "../utils/uniswapV3Fixture";
import { TokenMock } from "../typechain";
import { DeployHelper } from "../utils/deployHelper";
import { parseEther, parseUnits } from "ethers/lib/utils";
import { ContractTransaction } from "ethers";

const { expect } = chai;

describe("Rebalancer", () => {

  let deployer: DeployHelper;
  let owner: SignerWithAddress;
  let user: SignerWithAddress;

  let weth: TokenMock;
  let wbtc: TokenMock;
  let dai: TokenMock;

  let uniswapSetup: UniswapV3Fixture;

  beforeEach(async () => {
    [ owner, user ] = await ethers.getSigners();
    deployer =  new DeployHelper(owner);
    
    weth = await deployer.deployToken("WETH", 18, parseEther("100000"));
    wbtc = await deployer.deployToken("wBTC", 8, parseUnits("100000", 8));
    dai = await deployer.deployToken("DAI", 18, parseEther("100000"));

    uniswapSetup = new UniswapV3Fixture(ethers.provider, owner.address);

    await uniswapSetup.initialize(await owner.getAddress(), weth, 2000, wbtc, 35000, dai);
    
    // add some wide liquidity to seed pool
    await weth.approve(uniswapSetup.nftPositionManager.address, parseEther("10"));
    await dai.approve(uniswapSetup.nftPositionManager.address, parseEther("25000"));
    await uniswapSetup.addLiquidityWide(weth, dai, 3000, parseEther("10"), parseEther("25000"), owner.address);
  });

  describe("#rebalancePosition", async () => {

    beforeEach(async () => {

    });

    async function subject() {
      
    }

    it("should remove all liquidity from the initial position", async () => {
      
    });

    it("give caller new NFT with liquidity in new range", async () => {

    });

    it("should not leave any dust behind", async () => {

    });
  });
});

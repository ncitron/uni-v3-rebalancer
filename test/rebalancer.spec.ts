import { ethers } from "hardhat";
import chai from "chai";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

import { UniswapV3Fixture } from "../utils/uniswapV3Fixture";
import { Rebalancer, TokenMock } from "../typechain";
import { DeployHelper } from "../utils/deployHelper";
import { AbiCoder, defaultAbiCoder, formatEther, parseEther, parseUnits } from "ethers/lib/utils";
import { BigNumber, ContractTransaction, Signer } from "ethers";
import { priceToClosestTick } from "@uniswap/v3-sdk";
import { Price, Token } from "@uniswap/sdk-core";

const { expect } = chai;

describe("Rebalancer", () => {

  let rebalancer: Rebalancer;

  let deployer: DeployHelper;
  let owner: SignerWithAddress;
  let user: SignerWithAddress;

  let weth: TokenMock;
  let wbtc: TokenMock;
  let dai: TokenMock;

  let uniswapSetup: UniswapV3Fixture;

  before(async () => {
    [ owner, user ] = await ethers.getSigners();
    deployer =  new DeployHelper(owner);
    
    weth = await deployer.deployToken("WETH", 18, parseEther("100000"));
    wbtc = await deployer.deployToken("wBTC", 8, parseUnits("100000", 8));
    dai = await deployer.deployToken("DAI", 18, parseEther("100000"));

    await weth.mint(user.address, parseEther("100000"));
    await dai.mint(user.address, parseEther("100000"));

    uniswapSetup = new UniswapV3Fixture(ethers.provider, owner.address);

    await uniswapSetup.initialize(await owner.getAddress(), weth, 2000, wbtc, 35000, dai);
    
    // add some wide liquidity to seed pool
    await weth.approve(uniswapSetup.nftPositionManager.address, parseEther("100"));
    await dai.approve(uniswapSetup.nftPositionManager.address, parseEther("250000"));
    await uniswapSetup.addLiquidityWide(weth, dai, 3000, parseEther("10"), parseEther("25000"), owner.address);

    // deploy rebalancer
    rebalancer = await deployer.deployRebalancer(uniswapSetup.swapRouter.address, uniswapSetup.nftPositionManager.address);
  });

  describe("#rebalancePosition", async () => {

    let subjectCaller: SignerWithAddress;
    let subjectToken1: TokenMock;
    let subjectToken2: TokenMock;
    let subjectTokenId: BigNumber;
    let subjectNewTickLower: number;
    let subjectNewTickUpper: number;

    let initTickLower: number;
    let initTickUpper: number;

    let token1: Token;
    let token2: Token;

    beforeEach(async () => {

      subjectCaller = user;
      subjectToken1 = weth;
      subjectToken2 = dai;

      token1 = new Token(
        1,
        subjectToken1.address,
        await subjectToken1.decimals(),
        await subjectToken1.symbol(),
        await subjectToken1.name()
      );
      token2 = new Token(
        1,
        subjectToken2.address,
        await subjectToken2.decimals(),
        await subjectToken2.symbol(),
        await subjectToken2.name()
      );


      const tickSpacing = 3000 / 50;

      const priceUpper = new Price(token1, token2, 3200, 1);
      initTickUpper = Math.floor(priceToClosestTick(priceUpper) / tickSpacing) * tickSpacing;

      const priceLower = new Price(token1, token2, 1500, 1);
      initTickLower = Math.floor(priceToClosestTick(priceLower) / tickSpacing) * tickSpacing;

      if (initTickLower > initTickUpper) {
        [ initTickLower, initTickUpper ] = [ initTickUpper, initTickLower ];
      }

      await weth.connect(subjectCaller).approve(uniswapSetup.nftPositionManager.address, parseEther("10"));
      await dai.connect(subjectCaller).approve(uniswapSetup.nftPositionManager.address, parseEther("25000"));

      await uniswapSetup.nftPositionManager.mint({
          token0: subjectToken1.address,
          token1: subjectToken2.address,
          tickLower: initTickLower,
          tickUpper: initTickUpper,
          amount0Desired: parseEther("1"),
          amount1Desired: parseEther("2500"),
          fee: 3000,
          amount0Min: 0,
          amount1Min: 0,
          recipient: subjectCaller.address,
          deadline: BigNumber.from(2).pow(256).sub(1)
        }
      );

      subjectTokenId = await uniswapSetup.nftPositionManager.totalSupply();

      await uniswapSetup.nftPositionManager.connect(subjectCaller).approve(rebalancer.address, subjectTokenId);
    });

    async function subject(): Promise<ContractTransaction> {
      return await rebalancer.connect(subjectCaller).rebalancePosition(subjectTokenId, subjectNewTickLower, subjectNewTickUpper);
    }

    context("when rebalancing to an entirely inactive position", async () => {

      beforeEach(async () => {
        const tickSpacing = 3000 / 50;

        const priceUpper = new Price(token1, token2, 3200, 1);
        subjectNewTickUpper = Math.floor(priceToClosestTick(priceUpper) / tickSpacing) * tickSpacing;
  
        const priceLower = new Price(token1, token2, 1500, 1);
        subjectNewTickLower = Math.floor(priceToClosestTick(priceLower) / tickSpacing) * tickSpacing;
  
        if (subjectNewTickLower > subjectNewTickUpper) {
          [ subjectNewTickLower, subjectNewTickUpper ] = [ subjectNewTickUpper, subjectNewTickLower ];
        }
      });

      it("should remove all liquidity from the initial position", async () => {
        const initPosition = await uniswapSetup.nftPositionManager.positions(subjectTokenId);

        await subject();

        const finalPosition = await uniswapSetup.nftPositionManager.positions(subjectTokenId);

        expect(initPosition.liquidity).to.gt(0);
        expect(finalPosition.liquidity).to.eq(0);
      });
  
      it("give caller new NFT with liquidity in new range", async () => {
        await subject();
      });
  
      it("should not leave any dust behind", async () => {
        await subject();
      });
    });
  });
});

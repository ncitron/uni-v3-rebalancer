import { BigNumberish, Signer } from "ethers";
import {
  TokenMock,
  TokenMock__factory,
  UniswapV3Factory,
  UniswapV3Factory__factory,
  SwapRouter,
  SwapRouter__factory,
  NonfungiblePositionManager,
  NonfungiblePositionManager__factory,
  Quoter,
  Quoter__factory,
  NFTDescriptor,
  NFTDescriptor__factory,
  Rebalancer,
  Rebalancer__factory,
} from "../typechain";

export class DeployHelper {

  public owner: Signer

  constructor(owner: Signer) {
    this.owner = owner;
  }

  // Mocks
  public async deployToken(name: string, decimals: number, amount: BigNumberish): Promise<TokenMock> {
    return new TokenMock__factory(this.owner).deploy(await this.owner.getAddress(), amount, name, name, decimals);
  }

  // Uniswap V3
  public async deployUniswapV3Factory(): Promise<UniswapV3Factory> {
    return await new UniswapV3Factory__factory(this.owner).deploy();
  }

  public async deploySwapRouter(factory: string, weth: string): Promise<SwapRouter> {
    return await new SwapRouter__factory(this.owner).deploy(factory, weth);
  }

  public async deployNftPositionManager(factory: string, weth: string, nftDesc: string): Promise<NonfungiblePositionManager> {
    return await new NonfungiblePositionManager__factory(this.owner).deploy(factory, weth, nftDesc);
  }

  public async deployQuoter(factory: string, weth: string): Promise<Quoter> {
    return await new Quoter__factory(this.owner).deploy(factory, weth);
  }

  public async deployNFTDescriptor(): Promise<NFTDescriptor> {
    return await new NFTDescriptor__factory(this.owner).deploy();
  }

  // Rebalancer
  public async deployRebalancer(swapRouter: string, nftManager: string): Promise<Rebalancer> {
    return await new Rebalancer__factory(this.owner).deploy(swapRouter, nftManager);
  }
}
pragma solidity 0.7.6;
pragma abicoder v2;

import { INonfungiblePositionManager } from "@uniswap/v3-periphery/contracts/interfaces/INonfungiblePositionManager.sol";
import { ISwapRouter } from "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";

import { console } from "hardhat/console.sol";

//type DecreaseLiquidtyParams = INonfungiblePositionManager.DecreaseLiquidityParams;

contract Rebalancer {

    ISwapRouter public router;
    INonfungiblePositionManager nftManager;

    constructor(ISwapRouter _router, INonfungiblePositionManager _nftManager) {
        router = _router;
        nftManager = _nftManager;
    }

    function rebalancePosition(uint256 _id, int24 _tickLower, int24 _tickUpper) external {
       
        nftManager.transferFrom(msg.sender, address(this), _id);

        (uint128 liquidity,,,) = _getPositionInfo(_id);(_id);

        //TODO: protect this call from MEV
        INonfungiblePositionManager.DecreaseLiquidityParams memory p = INonfungiblePositionManager.DecreaseLiquidityParams(
            _id,
            liquidity,
            0,
            0,
            uint256(-1)
        );
        
        nftManager.decreaseLiquidity(p);
    }

    function _getPositionInfo(uint256 _id) internal view returns (uint128 liquidity, address token0, address token1, uint24 fee) {
        (,,token0,token1,fee,,,liquidity,,,,) = nftManager.positions(_id);
    }
}

pragma solidity 0.7.6;

import { INonfungiblePositionManager } from "@uniswap/v3-periphery/contracts/interfaces/INonfungiblePositionManager.sol";
import { ISwapRouter } from "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";

import { console } from "hardhat/console.sol";

contract Rebalancer {

    ISwapRouter public router;
    INonfungiblePositionManager nftManager;

    constructor(ISwapRouter _router, INonfungiblePositionManager _nftManager) {
        router = _router;
        nftManager = _nftManager;
    }

    function rebalancePosition(uint256 _id, int24 _tickLower, int24 _tickUpper) external returns (uint256 newId) {

    }
}

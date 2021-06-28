pragma solidity 0.7.6;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TokenMock is ERC20 {

    uint8 numDecimals;

    constructor(
        address _initialAccount,
        uint256 _initialBalance,
        string memory _name,
        string memory _symbol,
        uint8 _decimals
    )
        ERC20(_name, _symbol)
    {
        _mint(_initialAccount, _initialBalance);
        numDecimals = _decimals;
    }

    function mint(address to, uint amount) external {
        _mint(to, amount);
    }

    function decimals() public view override returns (uint8) {
        return numDecimals;
    }
}

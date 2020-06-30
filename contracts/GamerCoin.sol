// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.6.0;

import "@openzeppelin/contracts/token/ERC20/ERC20Burnable.sol";


contract GamerCoin is ERC20Burnable {
    constructor(uint256 initialBalance) ERC20("GamerCoin", "GHX") public {
        _mint(msg.sender, initialBalance);
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockNativeERC20 is ERC20 {
    uint8 private _decimals;

    constructor() ERC20("Mock Native ERC20", "MTERC20") {
        _mint(msg.sender, 1000000 * 10 ** 18);
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

import {IBridgedERC20} from "./interfaces/IBridgedERC20.sol";

contract BridgedERC20 is ERC20, IBridgedERC20 {
    /** State Variables */
    uint8 private immutable _decimals;
    address public immutable override bridge;
    address public immutable override nativeToken;

    /** Modifier */
    modifier onlyBridge() {
        require(msg.sender == bridge, "ONLY_BRIDGE");
        _;
    }

    constructor(
        uint8 decimals_,
        string memory name_,
        string memory symbol_,
        address bridge_,
        address nativeToken_
    ) ERC20(name_, symbol_) {
        _decimals = decimals_;
        bridge = bridge_;
        nativeToken = nativeToken_;
    }

    /** Mint & Burn */
    function mint(address to, uint256 amount) public override onlyBridge {
        _mint(to, amount);
    }

    function burn(address from, uint256 amount) public override onlyBridge {
        _burn(from, amount);
    }

    /** View/Pure Functions */
    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }
}

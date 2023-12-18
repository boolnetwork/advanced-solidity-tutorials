// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import {IMessengerFee} from "../bool/interfaces/IMessengerFee.sol";

contract MockMessenger is IMessengerFee {
    uint256 public crossFee = 1;

    function cptTotalFee(
        address,
        uint32,
        uint32,
        bytes32,
        bytes memory
    ) external view override returns (uint256 feeInNative) {
        return crossFee;
    }
}

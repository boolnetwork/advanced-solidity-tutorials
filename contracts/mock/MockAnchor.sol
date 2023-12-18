// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {IAnchor} from "../bool/interfaces/IAnchor.sol";
import {IBoolConsumerBase} from "../bool/interfaces/IBoolConsumerBase.sol";

contract MockAnchor is IAnchor {
    event MessageSent(bytes payload);

    bytes32 public constant FIXED_TID = bytes32(abi.encodePacked("FIXED_TID"));
    uint256 public crossFee = 1;

    address public messenger;

    constructor(address messenger_) {
        messenger = messenger_;
    }

    function sendToMessenger(
        address payable,
        bytes32,
        bytes memory,
        uint32,
        bytes calldata payload
    ) external payable override returns (bytes32 txUniqueIdentification) {
        require(msg.value >= crossFee, "INSUFFICIENT_CROSS_FEE");
        emit MessageSent(payload);
        return FIXED_TID;
    }

    function receiveFromMessenger(
        address consumer,
        bytes32 txUniqueIdentification,
        bytes memory payload
    ) public {
        IBoolConsumerBase(consumer).receiveFromAnchor(txUniqueIdentification, payload);
    }
}

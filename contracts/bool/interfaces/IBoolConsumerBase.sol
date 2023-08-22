// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";

interface IBoolConsumerBase is IERC165 {
    function anchor() external view returns (address);

    function receiveFromAnchor(bytes32 txUniqueIdentification, bytes memory payload) external;
}

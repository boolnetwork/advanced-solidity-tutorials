// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface ITokenBridgeCrossSpecific {
    /** Cross-chain Related Functions */
    function bridgeToken() external view returns (address);

    function bridgeOut(uint32 dstChainId, uint256 amount, bytes32 dstRecipient) external payable;

    function getBridgeFee(
        uint32 dstChainId,
        uint256 amount,
        bytes32 dstRecipient
    ) external view returns (uint256 fee);
}

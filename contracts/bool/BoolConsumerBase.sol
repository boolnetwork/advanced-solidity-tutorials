// SPDX-License-Identifier: MIT
pragma solidity 0.8.16;

import {ERC165, IERC165} from "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import {IBoolConsumerBase} from "./interfaces/IBoolConsumerBase.sol";
import {IAnchor} from "./interfaces/IAnchor.sol";

abstract contract BoolConsumerBase is ERC165, IBoolConsumerBase {
    /** Erros */
    error NOT_ANCHOR(address wrongAnchor);

    /** Constants */
    bytes32 public constant PURE_MESSAGE = keccak256("PURE_MESSAGE");

    /** BoolAMT Specific */
    address internal immutable _anchor;

    /** Constructor */
    constructor(address anchor_) {
        _anchor = anchor_;
    }

    /** Modifiers */
    modifier onlyAnchor() {
        _checkAnchor(msg.sender);
        _;
    }

    /** Key Function on the Source Chain */
    // solhint-disable-next-line no-empty-blocks
    function receiveFromAnchor(
        bytes32 txUniqueIdentification,
        bytes memory payload
    ) external virtual override onlyAnchor {}

    /** Key Function on the Destination Chain */
    function _sendAnchor(
        uint256 callValue,
        address payable refundAddress,
        bytes32 crossType,
        bytes memory extraFeed,
        uint32 dstChainId,
        bytes memory payload
    ) internal virtual returns (bytes32 txUniqueIdentification) {
        txUniqueIdentification = IAnchor(_anchor).sendToMessenger{value: callValue}(
            refundAddress,
            crossType,
            extraFeed,
            dstChainId,
            payload
        );
    }

    /** Internal Functions */
    function _checkAnchor(address targetAnchor) internal view {
        if (targetAnchor != _anchor) revert NOT_ANCHOR(targetAnchor);
    }

    /** View Functions */
    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(ERC165, IERC165) returns (bool) {
        return
            interfaceId == type(IBoolConsumerBase).interfaceId ||
            super.supportsInterface(interfaceId);
    }

    function anchor() external view override returns (address) {
        return _anchor;
    }
}

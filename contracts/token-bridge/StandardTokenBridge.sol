// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import {IMessengerFee} from "../bool/interfaces/IMessengerFee.sol";

import {TokenBridgeBase} from "./base/TokenBridgeBase.sol";
import {ITokenBridgeCrossSpecific} from "./interfaces/ITokenBridgeCrossSpecific.sol";
import {IBridgedERC20} from "./interfaces/IBridgedERC20.sol";

contract StandardTokenBridge is TokenBridgeBase, ITokenBridgeCrossSpecific {
    using SafeERC20 for IERC20;

    /** State Variables */
    bool public initialized;
    address public override bridgeToken;

    /** Constructor */
    constructor(bool isNativeChain_, address anchor_) TokenBridgeBase(isNativeChain_, anchor_) {}

    /** Initialize the bridgeToken */
    function initialize(address bridgeToken_) external onlyOwner {
        require(!initialized, "INITIALIZED");
        bridgeToken = bridgeToken_;
        initialized = true;
    }

    /** Cross-chain Core Functions */
    /**
     * @notice Entry on the destination chain (Initiative)
     * @param dstChainId Destination chain ID
     * @param amount Amount of tokens to be bridged
     * @param dstRecipient Address of the recipient on the destination chain
     * @dev Security: sufficient allowance and balance is required
     */
    function bridgeOut(
        uint32 dstChainId,
        uint256 amount,
        address dstRecipient
    ) public payable override whenNotPaused {
        uint256 callValue = msg.value;
        address sender = msg.sender;

        address thisAddress = address(this);
        address token = bridgeToken;

        // Check the data validity
        require(amount > 0, "ZERO_AMOUNT");
        require(dstRecipient != address(0), "NULL_RECIPIENT");

        // Transfer the bridge token to the contract (Sufficient allowance and balance is required)
        IERC20(token).safeTransferFrom(sender, thisAddress, amount);
        if (!isNativeChain) {
            // Burn the bridge token is on a derivative chain
            IBridgedERC20(token).burn(thisAddress, amount);
        }

        // Check the cross-chain fee (optional)
        uint256 fee = getBridgeFee(dstChainId, amount, dstRecipient);
        require(callValue >= fee, "INSUFFICIENT_BRIDGE_FEE");

        // Construct the payload to be sent to the target chain
        bytes memory payload = encodePayload(amount, dstRecipient);

        // Send to the binding Anchor
        bytes32 txUniqueIdentification = _sendAnchor(
            callValue,
            payable(sender),
            PURE_MESSAGE,
            "",
            dstChainId,
            payload
        );

        // Emit the event
        emit BridgeOut(txUniqueIdentification, amount, sender);
    }

    /**
     * @notice Entry on the destination chain (Passive)
     * @param txUniqueIdentification Globally unique transaction ID defined by Bool Network
     * @param payload Payload sent from the source chain
     * @dev Security: onlyAnchor
     */
    function receiveFromAnchor(
        bytes32 txUniqueIdentification,
        bytes memory payload
    ) external override onlyAnchor whenNotPaused {
        // Decode the original payload
        (uint256 amount, address recipient) = decodePayload(payload);

        _bridgeIn(amount, recipient);

        // Emit the event
        emit BridgeIn(txUniqueIdentification, amount, recipient);
    }

    /**
     * @param amount The amount of tokens to be bridged
     * @param recipient The address of the recipient on the destination chain
     * @dev Security: private
     */
    function _bridgeIn(uint256 amount, address recipient) private {
        if (isNativeChain) {
            // Lock the bridge token if on the native chain
            IERC20(bridgeToken).safeTransfer(recipient, amount);
        } else {
            // Mint the bridge token if on a derivative chain
            IBridgedERC20(bridgeToken).mint(recipient, amount);
        }
    }

    /** Pure/View Functions */
    // Calculate the cross-chain fee
    function getBridgeFee(
        uint32 dstChainId,
        uint256 amount,
        address dstRecipient
    ) public view override returns (uint256 fee) {
        bytes memory payload = encodePayload(amount, dstRecipient);
        fee = IMessengerFee(messenger).cptTotalFee(
            _anchor,
            dstChainId,
            uint32(payload.length),
            PURE_MESSAGE,
            bytes("")
        );
    }
}

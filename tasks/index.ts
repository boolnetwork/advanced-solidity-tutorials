import { task } from "hardhat/config"

// General tasks
task("checkBalance", "Check the balance of an account", require("./checkBalance")).addParam(
    "addr",
    "The address to check the balance of"
)

task("newChainTest", "Test the functionality of newly added RPC", require("./newChainTest"))

// Anchor related tasks
task("updateRemoteAnchor", "Configure remote anchors", require("./anchor/updateRemoteAnchor"))
    .addParam("anchor", "Address of Anchor")
    .addParam("id", "Chain ID of the remote path")
    .addParam("remoteanchor", "Address of the remote anchor (in bytes32)")

task(
    "checkConsumer",
    "Check the binding consumer of Anchor",
    require("./anchor/checkConsumer")
).addParam("anchor", "Address of Anchor")

task("checkPath", "Check the remote path of Anchor", require("./anchor/checkPath"))
    .addParam("anchor", "Address of Anchor")
    .addParam("id", "Chain ID of the remote path")

task("updateConsumer", "Update the consumer of Anchor", require("./anchor/updateConsumer"))
    .addParam("anchor", "Address of Anchor")
    .addParam("consumer", "Address of Consumer")

// Bridge related tasks
task("bridgeOut", "Call BridgeOut", require("./bridge/bridgeOut"))
    .addParam("bridge", "Address of MappedBridge")
    .addParam("id", "Chain ID of the destination chain")
    .addParam("amount", "Amount of tokens to bridge")
    .addParam("recipient", "Address of dstRecipient")

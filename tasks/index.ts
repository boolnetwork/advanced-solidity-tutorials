import { task } from "hardhat/config"

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

task(
    "deployTokenBridge",
    "Deploy a new TokenBridge contract",
    require("./token-bridge/deployTokenBridge")
)
    .addParam("anchor", "Address of Anchor")
    .addParam("decimals", "Decimals of the token")
    .addParam("name", "Name of the token")
    .addParam("symbol", "Symbol of the token")

task("updateConsumer", "Update the consumer of Anchor", require("./anchor/updateConsumer"))
    .addParam("anchor", "Address of Anchor")
    .addParam("consumer", "Address of Consumer")

task("tokenBridgeDeposit", "Deposit and ", require("./token-bridge/tokenBridgeDeposit"))
    .addParam("bridge", "Address of TokenBridge")
    .addParam("id", "Chain ID of the remote path")
    .addParam("amount", "Amount of tokens to deposit")

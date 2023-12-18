import { EXTRA_NETWORK_CONFIG } from "../../utils/constants"

module.exports = async function (taskArgs: any, hre: any) {
    const { bridge, id, amount, recipient } = taskArgs
    const { ethers, network } = hre
    const networkConfig = EXTRA_NETWORK_CONFIG[network.config.chainId]

    const bridgeC = await ethers.getContractAt("StandardTokenBridge", bridge)
    const bridgedTokenC = await ethers.getContractAt("BridgedERC20", await bridgeC.bridgeToken())
    const sender = (await ethers.getSigners())[0]

    // Check approval
    if ((await bridgedTokenC.allowance(sender.address, bridge)).toString() === "0") {
        const approveTxResponse = await bridgedTokenC
            .connect(sender)
            .approve(bridge, ethers.constants.MaxUint256)
        await approveTxResponse.wait(networkConfig.blockConfirmations)
        console.log(`Approve transaction hash: ${approveTxResponse.hash}`)
    }

    const crossFee = await bridgeC.getBridgeFee(id, amount, recipient)

    const txResponse = await bridgeC
        .connect(sender)
        .bridgeOut(id, amount, recipient, { value: crossFee })
    await txResponse.wait(networkConfig.blockConfirmations)
    console.log(`Transaction hash: ${txResponse.hash}`)
}

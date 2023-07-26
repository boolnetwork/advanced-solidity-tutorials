import { EXTRA_NETWORK_CONFIG } from "../../utils/constants"

module.exports = async function (taskArgs: any, hre: any) {
    const { bridge, id, amount } = taskArgs
    const { ethers, network } = hre
    const networkConfig = EXTRA_NETWORK_CONFIG[network.config.chainId]

    const tokenBridgeC = await ethers.getContractAt("TokenBridge", bridge)

    const sender = (await ethers.getSigners())[0]
    const dstRecipient = ethers.utils.hexZeroPad(sender.address, 32)

    const crossFee = await tokenBridgeC.calculateFee(id, amount, dstRecipient)

    console.log(
        `Depositing ${ethers.utils.formatUnits(
            amount,
            await tokenBridgeC.decimals()
        )} ${await tokenBridgeC.symbol()} to chain ${id}`
    )
    const txResponse = await tokenBridgeC.deposit(id, sender.address, amount, dstRecipient, {
        value: crossFee,
    })
    await txResponse.wait(networkConfig.blockConfirmations)
    console.log(`Transaction hash: ${txResponse.hash}`)
}

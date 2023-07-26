import { ANCHOR_ABI } from "../../utils/bool-abis"
import { EXTRA_NETWORK_CONFIG } from "../../utils/constants"

module.exports = async function (taskArgs: any, hre: any) {
    const { anchor, id, remoteanchor } = taskArgs
    const { ethers, network } = hre
    const networkConfig = EXTRA_NETWORK_CONFIG[network.config.chainId]

    const anchorC = await ethers.getContractAt(ANCHOR_ABI, anchor)

    const sender = (await ethers.getSigners())[0]
    const anchorManager = await anchorC.manager()
    if (sender.address.toLowerCase() !== anchorManager.toLowerCase()) {
        console.log(
            `ERROR: The Manager of Anchor is not the sender: \nExpected: ${anchorManager} \nGot: ${sender.address}`
        )
    } else {
        console.log("Updating the remote anchors...")
        const txResponse = await anchorC.batchUpdateRemoteAnchors([id], [remoteanchor])
        await txResponse.wait(networkConfig.blockConfirmations)
        console.log(`Transaction hash: ${txResponse.hash}`)
    }
}

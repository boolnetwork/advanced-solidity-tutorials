import { ANCHOR_ABI } from "../../utils/bool-abis"

module.exports = async function (taskArgs: any, hre: any) {
    const { anchor, id } = taskArgs
    const { ethers } = hre

    let consumer: string

    const anchorC = await ethers.getContractAt(ANCHOR_ABI, anchor)
    const isPathEnabled = await anchorC.isPathEnabled(id)
    if (isPathEnabled) {
        const remoteAnchor = await anchorC.fetchRemoteAnchor(id)
        console.log(`Path has been enabled with remote Anchor ${remoteAnchor} on chain ${id}`)
    } else {
        console.log("Path is disabled")
    }
}

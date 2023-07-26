import { ANCHOR_ABI } from "../../utils/bool-abis"

module.exports = async function (taskArgs: any, hre: any) {
    const { anchor } = taskArgs
    const { ethers } = hre

    let consumer: string
    const anchorC = await ethers.getContractAt(ANCHOR_ABI, anchor)
    consumer = await anchorC.consumer()
    console.log(`The binding consumer: ${consumer}`)
}

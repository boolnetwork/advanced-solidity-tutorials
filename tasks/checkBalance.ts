import { EXTRA_NETWORK_CONFIG } from "../utils/constants"

module.exports = async function (taskArgs: any, hre: any) {
    const { addr } = taskArgs
    const { ethers, network } = hre

    const chainId = network.config.chainId
    const networkConfig = EXTRA_NETWORK_CONFIG[chainId]

    const balance = await ethers.provider.getBalance(addr)
    console.log(ethers.utils.formatEther(balance), networkConfig.networkTokenSymbol)
}

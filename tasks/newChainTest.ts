import { EXTRA_NETWORK_CONFIG } from "../utils/constants"

module.exports = async function (taskArgs: any, hre: any) {
    const { ethers, network } = hre

    const chainId = network.config.chainId

    const latestBlock = await ethers.provider.getBlockNumber()
    console.log(`The latest block number is ${latestBlock}`)

    const gasPrice = await ethers.provider.getGasPrice()
    console.log(`The gas price is ${gasPrice}`)
}

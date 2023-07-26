import { Contract, Wallet } from "ethers"
import { ethers } from "hardhat"
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { Network } from "hardhat/types"

export const addressToBytes32 = (address: string): string => {
    return ethers.utils.hexZeroPad(address, 32)
}

export const bytes32ToAddress = (bytes32: string): string => {
    return ethers.utils.getAddress(ethers.utils.hexStripZeros(bytes32))
}

export const deployNewContract = async (
    contractName: string,
    deployer: SignerWithAddress | Wallet,
    args: any[]
): Promise<Contract> => {
    const contractFactory = await ethers.getContractFactory(contractName, deployer)
    const targetC = await contractFactory.deploy(...args)
    await targetC.deployed()
    return targetC
}

export const getNetworkId = (network: Network): number => {
    // if network.config.chaindId is undefined, log error and return 0
    if (typeof network.config.chainId === "undefined") {
        console.error("chainId is undefined")
        return 0
    } else {
        return network.config.chainId
    }
}

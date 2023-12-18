import * as fs from "fs"
import { ethers } from "hardhat"
import { Contract } from "ethers"
import { DeployFunction } from "hardhat-deploy/dist/types"
import { HardhatRuntimeEnvironment } from "hardhat/types"
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { EXTRA_NETWORK_CONFIG } from "../utils/constants"

/** 1. Define your preamble */
const contractName = "MockNativeERC20"
let targetC: Contract
let whetherLog = true
let deployer: SignerWithAddress

const deployMockNativeERC20: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, network } = hre
    const { deploy, log } = deployments
    const chainId = network.config.chainId as any
    const networkConfig = EXTRA_NETWORK_CONFIG[chainId]
    deployer = (await ethers.getSigners())[0]

    /** Check the deployment env */
    if (networkConfig.isMainnet) {
        throw new Error("*** WARN: You should not deploy MockNativeERC20 to a mainnet***")
    }

    /** 1. Define your deployment args */
    let deploymentArgs: any
    deploymentArgs = []

    /** 2. Start the contract Deployment */
    log("  --------------------<MockNativeERC20>-Deployment-Start--------------------")
    log(`******Deploying <${contractName}> to ${network.name}-${chainId} network******`)

    const deploymentReceipt = await deploy(contractName, {
        from: deployer.address,
        args: deploymentArgs,
        log: whetherLog,
    })

    targetC = await ethers.getContractAt(contractName, deploymentReceipt.address)
    log("  --------------------<MockNativeERC20>-Deployment-End--------------------")
}

export default deployMockNativeERC20
deployMockNativeERC20.tags = [contractName.toLowerCase()]
deployMockNativeERC20.dependencies = []

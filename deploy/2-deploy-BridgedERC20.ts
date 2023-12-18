import * as fs from "fs"
import { ethers } from "hardhat"
import { Contract } from "ethers"
import { DeployFunction } from "hardhat-deploy/dist/types"
import { HardhatRuntimeEnvironment } from "hardhat/types"
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { DEPLOYMENT_RECORD_FRAMEWORK, EXTRA_NETWORK_CONFIG } from "../utils/constants"

/** 1. Define your preamble */
const tag = "all"
const contractName = "BridgedERC20"
let targetC: Contract
let whetherLog = true
let deployer: SignerWithAddress

// Import the configuration file
let deploymentConfig = JSON.parse(
    fs.readFileSync("./configs/deployment-configuration.json", "utf8")
)

const deployBridgedERC20: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, network } = hre
    const { deploy, log } = deployments
    const chainId = network.config.chainId as any
    const networkConfig = EXTRA_NETWORK_CONFIG[chainId]
    deployer = (await ethers.getSigners())[0]

    /** 2. Define where to store your deployment results */
    const deploymentDataPath = `./configs/contract-address.json`
    let deploymentData = JSON.parse(fs.readFileSync(deploymentDataPath, "utf8"))

    /** 3. Define your deployment args */
    let deploymentArgs: any
    deploymentConfig = deploymentConfig[chainId]

    if (deploymentConfig.isNativeChain) {
        console.log("***Native Chain: No need to deploy BridgedERC20***")
    } else {
        deploymentArgs = [
            deploymentConfig.bridgeTokenDetails.decimals,
            deploymentConfig.bridgeTokenDetails.name,
            deploymentConfig.bridgeTokenDetails.symbol,
            deploymentData[chainId]["StandardTokenBridge"],
            deploymentConfig.bridgeTokenDetails.sourceTokenAddress,
        ]

        /** 4. Start the contract Deployment */
        log("  --------------------<CONTRACT>-Deployment-Start--------------------")
        log(`******Deploying <${contractName}> to ${network.name}-${chainId} network******`)

        console.log(deploymentArgs)

        const deploymentReceipt = await deploy(contractName, {
            from: deployer.address,
            args: deploymentArgs,
            log: whetherLog,
        })

        targetC = await ethers.getContractAt(contractName, deploymentReceipt.address)

        /** 5. Define how to save your deployment results */
        let nullRecord = DEPLOYMENT_RECORD_FRAMEWORK
        let isInRecord = false

        for (let id in deploymentData) {
            if (id === chainId.toString()) {
                deploymentData[id][contractName] = targetC.address
                isInRecord = true
            }
        }
        // Initialize the record if it is not in the record
        if (!isInRecord) {
            deploymentData[chainId] = nullRecord
            deploymentData[chainId][contractName] = targetC.address
        }

        fs.writeFileSync(deploymentDataPath, JSON.stringify(deploymentData))
    }

    /** 6. Initialize StandardTokenBridge */

    const bridgeC = await ethers.getContractAt(
        "StandardTokenBridge",
        deploymentData[chainId]["StandardTokenBridge"]
    )
    console.log(
        `***Derivative Chain: initialize StandardTokenBridge with Bridge Token ${deploymentData[chainId]["BridgedERC20"]}***`
    )
    if (await bridgeC.initialized()) {
        console.log("StandardTokenBridge has been initialized!")
    } else {
        console.log("Initializing StandardTokenBridge...")
        const txResponse = await bridgeC.initialize(deploymentData[chainId]["BridgedERC20"])
        await txResponse.wait()
    }
}

export default deployBridgedERC20
deployBridgedERC20.tags = [tag, contractName.toLowerCase()]
deployBridgedERC20.dependencies = ["standardtokenbridge"]

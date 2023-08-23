import { HardhatUserConfig } from "hardhat/config"

import "@matterlabs/hardhat-zksync-deploy"
import "@matterlabs/hardhat-zksync-solc"
import "@matterlabs/hardhat-zksync-verify"

import "@typechain/hardhat"
import "@nomiclabs/hardhat-waffle"
import "@nomiclabs/hardhat-ethers"
import "@nomiclabs/hardhat-etherscan"
import "dotenv/config"
import "hardhat-deploy"
import "hardhat-gas-reporter"
import "solidity-coverage"

import "./tasks"

/**####TESTNET CONFIGS##### */
const ETHEREUM_GOERLI_RPC_URL =
    process.env.ETHEREUM_GOERLI_RPC_URL || "https://rpc.ankr.com/eth_goerli"

const TESTNET_DEPLOYER_PRIVATE_KEY = process.env.TESTNET_DEPLOYER_PRIVATE_KEY

/**####MAINNET CONFIGS##### */
const ETHEREUM_MAINNET_RPC_URL = process.env.ETHEREUM_MAINNET_RPC_URL || "https://rpc.ankr.com/eth"

const MAINNET_DEPLOYER_PRIVATE_KEY = process.env.MAINNET_DEPLOYER_PRIVATE_KEY

// Hardhat user-specific configs
const config: HardhatUserConfig = {
    defaultNetwork: "hardhat",
    networks: {
        hardhat: {
            // // If you want to do some forking, uncomment this
            // forking: {
            //     url: ETHEREUM_GOERLI_RPC_URL,
            // },
            chainId: 31337,
            saveDeployments: false,
            zksync: false,
        },
        localhost: {
            url: "http://127.0.0.1:8545/",
            accounts: [
                TESTNET_DEPLOYER_PRIVATE_KEY !== undefined ? TESTNET_DEPLOYER_PRIVATE_KEY : "",
            ],
            chainId: 31337,
            saveDeployments: true,
            zksync: false,
        },
        /** Testnets */
        ethereum_goerli: {
            url: ETHEREUM_GOERLI_RPC_URL,
            accounts: [
                TESTNET_DEPLOYER_PRIVATE_KEY !== undefined ? TESTNET_DEPLOYER_PRIVATE_KEY : "",
            ],
            saveDeployments: true,
            chainId: 5,
            zksync: false,
        },
        zksync_goerli: {
            url: process.env.ZKSYNC_GOERLI_RPC_URL || "https://testnet.era.zksync.dev",
            accounts: [
                TESTNET_DEPLOYER_PRIVATE_KEY !== undefined ? TESTNET_DEPLOYER_PRIVATE_KEY : "",
            ],
            ethNetwork: ETHEREUM_GOERLI_RPC_URL,
            saveDeployments: true,
            chainId: 280,
            zksync: true,
        },
        optimism_goerli: {
            url: process.env.OPTIMISM_GOERLI_RPC_URL || "https://optimism-goerli.publicnode.com",
            accounts: [
                TESTNET_DEPLOYER_PRIVATE_KEY !== undefined ? TESTNET_DEPLOYER_PRIVATE_KEY : "",
            ],
            saveDeployments: true,
            chainId: 420,
            zksync: false,
        },
        arbitrum_goerli: {
            url: process.env.ARBITRUM_GOERLI_RPC_URL || "https://arbitrum-goerli.publicnode.com",
            accounts: [
                TESTNET_DEPLOYER_PRIVATE_KEY !== undefined ? TESTNET_DEPLOYER_PRIVATE_KEY : "",
            ],
            saveDeployments: true,
            chainId: 421613,
            zksync: false,
        },
        filecoin_testnet: {
            url: process.env.FIL_CALIBRATION_RPC_URL || "",
            accounts: [
                TESTNET_DEPLOYER_PRIVATE_KEY !== undefined ? TESTNET_DEPLOYER_PRIVATE_KEY : "",
            ],
            saveDeployments: true,
            chainId: 314159,
            zksync: false,
        },
    },
    gasReporter: {
        enabled: false,
        token: "ETH",
        currency: "USD",
        outputFile: "./gas-reports.txt",
        noColors: true,
        coinmarketcap: process.env.COINMARKETCAP_API_KEY,
        gasPrice: 15,
        gasPriceApi: "https://api.etherscan.io/api?module=proxy&action=eth_gasPrice",
    },
    namedAccounts: {
        deployer: {
            default: 0,
        },
    },
    solidity: {
        compilers: [
            {
                version: "0.8.13",
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 50,
                    },
                },
            },
        ],
    },
    zksolc: {
        version: "latest",
        compilerSource: "binary",
        settings: {},
    },
    mocha: {
        timeout: 200000, // 200 seconds max for running tests
    },
}

export default config

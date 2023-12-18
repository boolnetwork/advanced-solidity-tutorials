import { HardhatUserConfig } from "hardhat/config"

import "@matterlabs/hardhat-zksync-deploy"
import "@matterlabs/hardhat-zksync-solc"
import "@matterlabs/hardhat-zksync-verify"

import "@typechain/hardhat"
import "@nomiclabs/hardhat-waffle"
import "@nomiclabs/hardhat-web3"
import "@nomiclabs/hardhat-ethers"
import "@nomiclabs/hardhat-etherscan"
import "dotenv/config"
import "hardhat-deploy"
import "hardhat-gas-reporter"
import "solidity-coverage"

import "./tasks"

/**####TESTNET CONFIGS##### */
const POLYGON_MUMBAI_RPC_URL =
    process.env.POLYGON_MUMBAI_RPC_URL || "https://rpc.ankr.com/polygon_mumbai"
const ETHEREUM_SEPOLIA_RPC_URL =
    process.env.ETHEREUM_SEPOLIA_RPC_URL || "https://rpc.ankr.com/eth_sepolia"

const TESTNET_DEPLOYER_PRIVATE_KEY = process.env.TESTNET_DEPLOYER_PRIVATE_KEY

/**####MAINNET CONFIGS##### */
const POLYGON_MAINNET_RPC_URL =
    process.env.POLYGON_MAINNET_RPC_URL || "https://rpc.ankr.com/polygon"
const ETHEREUM_MAINNET_RPC_URL = process.env.ETHEREUM_MAINNET_RPC_URL || "https://rpc.ankr.com/eth"

const MAINNET_DEPLOYER_PRIVATE_KEY = process.env.MAINNET_DEPLOYER_PRIVATE_KEY

// Hardhat user-specific configs
const config: HardhatUserConfig = {
    defaultNetwork: "hardhat",
    networks: {
        hardhat: {
            // If you want to do some forking, uncomment this
            // forking: {
            //     url: ETHEREUM_GOERLI_RPC_URL,
            // },
            chainId: 31337,
            saveDeployments: false,
            zksync: false,
        },
        localhost: {
            url: "http://127.0.0.1:8545/",
            chainId: 31337,
            saveDeployments: true,
            zksync: false,
        },
        /** Mainnets */
        polygon_mainnet: {
            url: POLYGON_MAINNET_RPC_URL,
            accounts: [
                MAINNET_DEPLOYER_PRIVATE_KEY !== undefined ? MAINNET_DEPLOYER_PRIVATE_KEY : "",
            ],
            saveDeployments: true,
            chainId: 137,
            zksync: false,
        },
        ethereum_mainnet: {
            url: ETHEREUM_MAINNET_RPC_URL,
            accounts: [
                MAINNET_DEPLOYER_PRIVATE_KEY !== undefined ? MAINNET_DEPLOYER_PRIVATE_KEY : "",
            ],
            saveDeployments: true,
            chainId: 1,
            zksync: false,
        },
        /** Testnets */
        polygon_mumbai: {
            url: POLYGON_MUMBAI_RPC_URL,
            accounts: [
                TESTNET_DEPLOYER_PRIVATE_KEY !== undefined ? TESTNET_DEPLOYER_PRIVATE_KEY : "",
                MAINNET_DEPLOYER_PRIVATE_KEY !== undefined ? MAINNET_DEPLOYER_PRIVATE_KEY : "",
            ],
            saveDeployments: true,
            chainId: 80001,
            zksync: false,
        },
        ethereum_sepolia: {
            url: ETHEREUM_SEPOLIA_RPC_URL,
            accounts: [
                MAINNET_DEPLOYER_PRIVATE_KEY !== undefined ? MAINNET_DEPLOYER_PRIVATE_KEY : "",
            ],
            saveDeployments: true,
            chainId: 11155111,
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
                version: "0.8.18",
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

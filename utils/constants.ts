import { ExtraNetworkConfig } from "./types"

export const LOCAL_DEV_NETWORK_NAMES = ["hardhat", "localhost"]
export const ENVs = ["dev", "test", "alpha"]

export const DEPLOYMENT_RECORD_FRAMEWORK = {
    StandardTokenBridge: "",
    BridgedERC20: "",
}

export const EXTRA_NETWORK_CONFIG: Record<number, ExtraNetworkConfig> = {
    // Local testnet
    31337: {
        name: "hardhat",
        blockConfirmations: 1,
        isLocalDev: true,
        isTestnet: false,
        isMainnet: false,
        networkTokenSymbol: "ETH",
        isActive: false,
    },
    /**
     * EVM-Compatible Mainnets
     */
    1: {
        name: "ethereum_mainnet",
        blockConfirmations: 3,
        isLocalDev: false,
        isTestnet: false,
        isMainnet: true,
        networkTokenSymbol: "ETH",
        isActive: true,
    },
    137: {
        name: "polygon_mainnet",
        blockConfirmations: 3,
        isLocalDev: false,
        isTestnet: false,
        isMainnet: true,
        networkTokenSymbol: "MATIC",
        isActive: true,
    },
    /**
     * EVM-Compatible Testnets
     */
    80001: {
        name: "polygon_mumbai",
        blockConfirmations: 3,
        isLocalDev: false,
        isTestnet: true,
        isMainnet: false,
        networkTokenSymbol: "MATIC",
        isActive: true,
    },
    11155111: {
        name: "ethereum_sepolia",
        blockConfirmations: 3,
        isLocalDev: false,
        isTestnet: true,
        isMainnet: false,
        networkTokenSymbol: "ETH",
        isActive: true,
    },
}

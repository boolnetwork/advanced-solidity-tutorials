import { ExtraNetworkConfig } from "./types"

export const LOCAL_DEV_NETWORK_NAMES = ["hardhat", "localhost"]
export const ENVs = ["dev", "test", "alpha"]
export const CHAINID_TO_CHAINNAME: any = {
    5: "ethereum_goerli",
    280: "zksync_goerli",
    420: "optimism_goerli",
    421613: "arbitrum_goerli",
}

export const EXTRA_NETWORK_CONFIG: Record<number, ExtraNetworkConfig> = {
    // Local testnet
    31337: {
        name: "hardhat",
        blockConfirmations: 1,
    },
    /**
     * EVM-Compatible Testnets
     */
    5: {
        name: "ethereum_goerli",
        blockConfirmations: 6,
    },
    // zkSync Era Testnet
    280: {
        name: "zksync_goerli",
        blockConfirmations: 6,
    },
    // Optimism Goerli
    420: {
        name: "optimism_goerli",
        blockConfirmations: 6,
    },
    421613: {
        name: "arbitrum_goerli",
        blockConfirmations: 6,
    },
}

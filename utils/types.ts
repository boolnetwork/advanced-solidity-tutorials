export type ExtraNetworkConfig = {
    name: string
    blockConfirmations: number
    isLocalDev: boolean
    isTestnet: boolean
    isMainnet: boolean
    networkTokenSymbol: string
    isActive: boolean
    gasPrice?: number
}

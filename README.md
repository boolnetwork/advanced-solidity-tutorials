

# ERC20 Token Bridge - Lock and Mint

## Installation
- Add dependencies
    ```sh
    yarn install
    ```

## Pre-requisites

### Environment variables
Rename `.env.example` to `.env` and enter your private key and the corresponding addresses for deploying.

NOTE: the configuration on RPCs is optional since the default values have been provided in `hardhat.config.ts`.

```
TESTNET_DEPLOYER_ADDRESS=123cde574ccff....
TESTNET_DEPLOYER_PRIVATE_KEY=0x123cde574ccff....

MAINNET_DEPLOYER_ADDRESS=123cde574ccff....
MAINNET_DEPLOYER_PRIVATE_KEY=0x123cde574ccff....
```

### Contract addresses

We assume an `AMT` bridge has been deployed via [BoolScan](https://github.com/boolnetwork/advanced-solidity-tutorials#build-an-amt-bridge). Fill in the following addresses in `./configs/deployment-configuration`:

```json
{
    "11155111": {
        "isNativeChain": true,
        "anchor": "<AMT-Anchor-EthereumSepolia>",
        "sourceToken": "<Your-ERC20-EthereumSepolia>"
    },
    "80001": {
        "isNativeChain": false,
        "anchor": "<AMT-Anchor-PolygonMumbai>",
        "bridgeTokenDetails": {
            "name": "<Bridge-Token-Name>",
            "symbol": "<Bridge-Token-Symbol>",
            "decimals": "<Bridge-Token-Decimals>",
            "sourceTokenAddress": "<Source-Token-Address-Source-Chain>"
        }
    }
}

For example:
{
    "11155111": {
        "isNativeChain": true,
        "anchor": "0x86f4a1fb7f64c8f5427c4a08fc8314ec5a7d1711",
        "sourceToken": "0x9bc6c59062ffac7238513946f26621618da46ad0"
    },
    "80001": {
        "isNativeChain": false,
        "anchor": "0x97b82852c7becfe8e896860adfd364ad286b8334",
        "bridgeTokenDetails": {
            "name": "Bridged Mock Native ERC20",
            "symbol": "MTERC20.b",
            "decimals": 18,
            "sourceTokenAddress": "0x9bc6c59062ffac7238513946f26621618da46ad0"
        }
    }
}
```

## Start development

1. Deploy and initialize contracts
    ```bash
    yarn hardhat deploy --tags all --network ethereum_sepolia
    yarn hardhat deploy --tags all --network polygon_mumbai
    ```

    For example, the output in `./configs/contract-address.json` is:
    ```json
    {
        "80001": {
            "StandardTokenBridge": "0x2Da39e43e915E72Eb33EfD0596007dd32A63e892",
            "BridgedERC20": "0xec856b1D3778b28C09C983F452Ba7891fcf63462"
        },
        "11155111": {
            "StandardTokenBridge": "0x0dCe2A3585d2aeB6ACEA3381227Fec4eB248a6ff"
        }
    }
    ```

2. Binding each StandardTokenBridge to an Anchor
    ```angular2html
    Format: yarn hardhat updateConsumer --anchor <anchor address> --consumer <StandardTokenBridge address> --network <network name>
    ```

    ```angular2html
        yarn hardhat updateConsumer --anchor 0x97b82852c7becfe8e896860adfd364ad286b8334 --consumer 0x2Da39e43e915E72Eb33EfD0596007dd32A63e892 --network polygon_mumbai

        Output:
        The current consumer: 0x0000000000000000000000000000000000000000
        Updating the consumer...
        Transaction hash: 0x4f4bf1722159c73794c6a5b448608624ca06526397afef630b1f83cd3bb6a84e
        The new consumer: 0x2Da39e43e915E72Eb33EfD0596007dd32A63e892
    ```
    ```angular2html
        yarn hardhat updateConsumer --anchor 0x86f4a1fb7f64c8f5427c4a08fc8314ec5a7d1711 --consumer 0x0dCe2A3585d2aeB6ACEA3381227Fec4eB248a6ff --network ethereum_sepolia

        Output:
        The current consumer: 0x0000000000000000000000000000000000000000
        Updating the consumer...
        Transaction hash: 0x9e9728b2a1410d675a19fc1d2207fa24da2bd0b9adda765dacfce8d92adb1e23
        The new consumer: 0x0dCe2A3585d2aeB6ACEA3381227Fec4eB248a6ff
    ```

3. Configure the "remote anchors" so each of them can receive messages from one another, and `only` one another on a specific chain.

    ```angular2html
    Format: yarn hardhat updateRemoteAnchor --anchor <anchor address> --id <remote chain id> --remoteanchor <remote anchor address in bytes32> --network <network name>
    ```

    ```angular2html
    yarn hardhat updateRemoteAnchor --anchor 0x97b82852c7becfe8e896860adfd364ad286b8334 --id 11155111 --remoteanchor 0x00000000000000000000000086f4a1fb7f64c8f5427c4a08fc8314ec5a7d1711 --network polygon_mumbai

    Output:
    Updating the remote anchors...
    Transaction hash: 0x9b645020acd14048d6e284b5073e06fe11b285a5d8e20d9d0f629f4cf8f897e9
    ```

    ```angular2html
    yarn hardhat updateRemoteAnchor --anchor 0x86f4a1fb7f64c8f5427c4a08fc8314ec5a7d1711 --id 80001 --remoteanchor 0x00000000000000000000000097b82852c7becfe8e896860adfd364ad286b8334 --network ethereum_sepolia

    Output:
    Updating the remote anchors...
    Transaction hash: 0x85693196b32dc88779673c47174387c73c144520fdb5caa13bd245041ac7232c
    ```
4. Deposit tokens on Ethereum Sepolia and receive them on Polygon Mumbai.
    ```angular2html
    Format: yarn hardhat tokenBridgeDeposit --bridge <tokenBridge address> --amount <deposit amount> --id <destination chain id> --recipient <destination receiver address> --network <network name>
    ```
    ```angular2html
    yarn hardhat bridgeOut --bridge 0x0dCe2A3585d2aeB6ACEA3381227Fec4eB248a6ff --id 80001 --amount 1000000000000000000 --recipient 0x66feD255e376c5E5495384A8aBc01a1AA65aFE8a --network ethereum_sepolia

    Output:
    Approve transaction hash: 0xc4f270c5e7cd82d913bbb2b215abe1a42e707508421b15fc406997184fe7fb94
    Transaction hash: 0x760f816fdcd8dd95695595f97cffa765a22497d1324b33608ce20be34107d3e8
    ```
5. Track the lifecycle of the transaction on [BoolScan](https://boolscan.com/bridge/amt/?network=testnet).
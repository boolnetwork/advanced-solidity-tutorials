<div align="center">
    <img alt="BoolNetwork" src="images/BoolNetworkLogo.jpg"/>
</div>

---

# Bool Network Advanced Solidity Examples
Advanced Solidity examples for developing on Bool Network.
## Installation
-   Clone this repository
    ```sh
    git clone https://github.com/boolnetwork/advanced-solidity-tutorials.git
    cd advanced-solidity-tutorials
    ```
- Add dependencies
    ```sh
    yarn install
    ```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Project structure

- `/contracts`: smart contracts.
- `/tasks`: extra Hardhat tasks to build omni-chain applications on Bool Network.
- `hardhat.config.ts`: configuration file.
<!-- - `/deploy`: deployment and contract interaction scripts.
- `/test`: test files -->

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Environment variables
In order to prevent users to leak private keys, this project includes the dotenv package which is used to load environment variables. It's used to load the wallet private key, required to run the deploy script.

To use it, rename `.env.example` to `.env` and enter your private key. And do remember to fund your `DEPLOYER_ADDRESS` in order to build!

```
TESTNET_DEPLOYER_PRIVATE_KEY=123cde574ccff....
TESTNET_DEPLOYER_ADDRESS=0x123cde574ccff....
```

In addition, set the RPC URLs of the networks you want to test with.

```
ETHEREUM_GOERLI_RPC_URL = 
ZKSYNC_GOERLI_RPC_URL = 
OPTIMISM_GOERLI_RPC_URL = 
ARBITRUM_GOERLI_RPC_URL = 
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Commands

- `yarn hardhat compile` will compile the contracts.
- `yarn hardhat compile --network zksync_goerli` will specifically compile the contracts for the zkSync Goerli network.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

# AMT Bridge in Bool Network

## About AMT Bridge

### What is an AMT Bridge?
Arbitrary Message Transmission (AMT) bridges are a type of bridge defined by Bool Network that allows for the transfer of arbitrary data across multiple chains. This is in contrast to a token bridge, which only allows for the transfer of a specific token. 

Each AMT bridge is defined by a group of `Anchor` contracts, one on each chain. Each `Anchor` contract is responsible for helping its uniquely binding `Consumer` contract to interact with Bool Network by sending and receiving cross-chain messages.

The security of each `Anchor` is preserved by a distinctive [Dynamic Hidden Committee](https://boolnetwork.gitbook.io/docs/concepts/dynamic-hidden-committee-dhc) in Bool Network.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### How does an AMT Bridge work?

The diagram below visually depicts the complete lifecycle of a cross-chain transaction processed by Bool Network. 

<div align="center">
    <img alt="AMTInfrastructure" src="images/AMTInfrastructure.png"/>
</div>

`Consumer` in the diagram is **instantiated** by a liquidity pool for USDT, which also effectively illustrates the process of a cross-chain asset transfer conducted by our SWAP application, BoolSwap. The detailed process is as follows:

- `Source Step1`: When the source `Pool` receives a specific amount of the designated token, it generates a message including the informaiton of the amount of token and the address of the destination recipient, and sends it in the form of a `payload` to its binding `Anchor` on the source chain. 
- `Source Step2`: The source `Anchor` then sends a **standardized message** to the source `Messenger` and triggers the standard cross-chain event that can be monitored by Bool Network
- `Off-chain Step1`: The `Committeee` binding to the destination `Anchor` will verify the finality of the source chain transaction and the validity of the message. If the verification is successful, the `Committee` will sign the message content with its private key.
- `Off-chain Step2`: The `Deliverer` service (previously known as `Relayer`) will collect the `signature` and the corresponding `message`, and send them to the destination `Messenger`.
- `Destination Step1`: The destination `Messenger` will verify the validity of the message versus the signature based on the public key stored on the destination `Anchor`, and then send the message to the destination `Anchor`.
- `Destination Step2`: The destination `Anchor` then sends the message to the destination `Pool`, which will release the designated amount of token to the destination recipient.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Build an AMT Bridge

In this section, we provide an outline for developers to build an Arbitrary Message Transmission (AMT) bridge on Bool Network.

> WARNING: **You must build an AMT bridge before deploying an omni-chain application on Bool Network.**

1. Get tBOOL tokens from [Bool Network Testnet Faucet](https://faucet.bool.network/).
2. Open [Bool Network Explorer (Testnet)](https://boolscan.com/dashboard/committee?network=testnet).
3. Connect your MetaMask to Bool Network Testnet ([configuration here](https://boolnetwork.gitbook.io/docs/evm-ecosystem/amt-bridges/network-configuration)).
4. Create two `ECDSA`-type committees, one for each chain ([link here](https://boolnetwork.gitbook.io/docs/evm-ecosystem/amt-bridges/create-committees)).
5. Build an AMT bridge by deploying two `Anchor` contracts to two chains respectively ([link here](https://boolnetwork.gitbook.io/docs/evm-ecosystem/amt-bridges/build-a-bridge)).
6. You should see your newly created AMT bridge under the `Dashboard/Bridge` tab ([link here](https://boolscan.com/dashboard/bridge?network=testnet)). An example is given as follows: 

<div align="center">
    <img alt="AMTBridgeInstance" src="images/AMTBridgeInstance.png"/>
</div>

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Remaining Work
After completing the creation of an AMT bridge, there are still the following necessary steps to complete the development of an omni-chain dApp:

1. Design your `Consumer` contract that should comply with our standards where the `Anchor` address is cofigured as one of the constructor parameters ([link here](#consumer)).
2. Deploy your `Consumer` contracts on each chain you intend to support.
3. Bind each `Consumer` contract to its corresponding `Anchor` contract by calling the `updateConsumer` function on the `Anchor` contract.
4. Update the remote `Anchor` addresses with remote `chainIds` on each `Anchor` contract by calling the `batchUpdateRemoteAnchors` function on the `Anchor` contract.
5. Send transactions by calling the cross-chain functions in your `Consumer` contract, e.g. `deposit()` in the TokenBridge.sol, and track the lifecycle of the transaction via [BoolScan](https://boolscan.com/bridge/amt/?network=testnet).

**Suggestion:** For steps 3 and 4, you can use the `updateConsumer` and `updateRemoteAnchor` tasks provided by this repository.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

# Consumer

In this section, we will introduce dApp developers on how to design a `Consumer` contract that complies with the Bool Network standards.

## Contract Inheritance
Your `Consumer` contract must inherit from `./contracts/bool/BoolConsumerBase.sol`

## Required Functions

- `Send logic`: an **external payable** function to call `_sendAnchor` in order to send a cross-chain message to the `Anchor` contract on the source chain.
- `Receive logic`: implement the `receiveFromAnchor` function to receive cross-chain message. **WARNING**: you must use the `onlyAnchor` modifier to restrict the access of this function to the binding `Anchor` contract.

## Optional Functions

- `Encode & Decode logic`: implement the `encodePayload` and `decodePayload` functions to encode and decode the message content. **Suggestions**: we recommend set the visibility of these two functions as `public`.
- `Calculate fee`: implement the `calculateFee` function to calculate the fee for sending a cross-chain message based on your payload. This functin can provide convenience for the front-end by directly calculating the fee from your `Consumer` contract before initiating a cross-chain transaction.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

# TokenBridge

## About TokenBridge

> WARNING: **TokenBridge is designed for testing purposes only.**

This section provides an outline for deploying a burn & mint ERC20 token bridge on Bool Network.

## Deploy Setup
Deploy an AMT Bridge ([Build an AMT Bridge](#build-an-amt-bridge)) and get two `Anchor` addresses through `BoolScan/Dashboard/Bridge/<your bridge>`. For example:
- `0xe59a9ab6a5732d5f7a89d9c7f31964c459456f70` on Arbitrum Goerli
- `0x7eb25a4ab45e29c9306a1987c664111bf7ebd002` on zkSync Goerli

## TokenBridge.sol - a burn & mint ERC20 token bridge

> WARNING: **You must deploy an AMT bridge through BoolScan before building a TokenBridge.**
1. Deploy two TokenBridge contracts.
    ```angular2html
    Format: yarn hardhat deployTokenBridge --anchor <anchor address> --decimals <decimals> --name <token name> --symbol <token symbol> --network <network name>
    ```
    ```angular2html
    yarn hardhat deployTokenBridge --anchor 0xe59a9ab6a5732d5f7a89d9c7f31964c459456f70 --decimals 9 --name BoolTestToken --symbol BTT --network arbitrum_goerli

    Output:
    Deploying TokenBridge...
    Deploying a new TokenBridge contract on chain 421613...
    TokenBridge deployed at 0x565D09b0cd1c8B7Ca4846c06cc9Ec4a92a01012d
    ```
    ```angular2html
    yarn hardhat deployTokenBridge --anchor 
    0x7eb25a4ab45e29c9306a1987c664111bf7ebd002 --decimals 9 --name BoolTestToken --symbol BTT --network zksync_goerli

    Output:
    Deploying TokenBridge...
    Deploying a new TokenBridge contract on chain 280...
    TokenBridge deployed at 0x281b5702012654065733A0b763e2F3494663968b
    ```
2. Binding each TokenBridge to an Anchor.
    ```angular2html
    Format: yarn hardhat updateConsumer --anchor <anchor address> --consumer <tokenBridge address> --network <network name>
    ```
    ```angular2html
    yarn hardhat updateConsumer --anchor 0xe59a9ab6a5732d5f7a89d9c7f31964c459456f70 --consumer 0x565D09b0cd1c8B7Ca4846c06cc9Ec4a92a01012d --network arbitrum_goerli

    Output:
    The current consumer: 0x0000000000000000000000000000000000000000
    Updating the consumer...
    Transaction hash: 0x9bb73e827f490d7863bb23696ee55c8f0ce9395a64c1b67edc1b7fb1127446a5
    The new consumer: 0x565D09b0cd1c8B7Ca4846c06cc9Ec4a92a01012d
    ```
    ```angular2html
    yarn hardhat updateConsumer --anchor 0x7eb25a4ab45e29c9306a1987c664111bf7ebd002 --consumer 0x281b5702012654065733A0b763e2F3494663968b --network zksync_goerli

    Output:
    The current consumer: 0x0000000000000000000000000000000000000000
    Updating the consumer...
    Transaction hash: 0x139d4589783d96a36d7a40748a7e090e844feb131b007850a4a3ed9ca06bb673
    The new consumer: 0x281b5702012654065733A0b763e2F3494663968bb
    ```
3. Configure the "remote anchors" so each of them can receive messages from one another, and `only` one another on a specific chain.
    ```angular2html
    Format: yarn hardhat updateRemoteAnchor --anchor <anchor address> --id <remote chain id> --remoteanchor <remote anchor address in bytes32> --network <network name>
    ```
    ```angular2html
    yarn hardhat updateRemoteAnchor --anchor 0xe59a9ab6a5732d5f7a89d9c7f31964c459456f70 --id 280 --remoteanchor 0x0000000000000000000000007eb25a4ab45e29c9306a1987c664111bf7ebd002 --network arbitrum_goerli

    Output:
    Updating the remote anchors...
    Transaction hash: 0x3ef9850d957763db1eb9a0fc3526ba6a70f67e64b547a7569e87102314629854
    ```
    ```angular2html
    yarn hardhat updateRemoteAnchor --anchor 0x7eb25a4ab45e29c9306a1987c664111bf7ebd002 --id 421613 --remoteanchor 0x000000000000000000000000e59a9ab6a5732d5f7a89d9c7f31964c459456f70 --network zksync_goerli

    Output:
    Updating the remote anchors...
    Transaction hash: 0x46660f869763dedb4a3697cb08fbb51b666bef6204e3c7eabd2c66481ae34e56
    ```
4. Deposit tokens on Arbitrum Goerli and receive them on zkSync Goerli.
    ```angular2html
    Format: yarn hardhat tokenBridgeDeposit --amount <deposit amount> --bridge <tokenBridge address> --id <destination chain id> --network <network name>
    ```
    ```angular2html
    yarn hardhat tokenBridgeDeposit --amount 1000000000 --bridge 0x565D09b0cd1c8B7Ca4846c06cc9Ec4a92a01012d --id 280 --network arbitrum_goerli

    Output:
    Depositing 1.0 BTT to chain 280
    Transaction hash: 0x4de93d3f6ae3d301e0ceffbee3e87203db98aa8017e2f66321f547d4431a5d32
    ```
5. Track the lifecycle of the transaction on [BoolScan](https://boolscan.com/bridge/amt/?network=testnet).


<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Official Links

- [Website](https://bool.network/)
- [Documentation](https://boolnetwork.gitbook.io/docs/)
- [GitHub](https://github.com/boolnetwork)
- [Twitter](https://twitter.com/Bool_Official)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

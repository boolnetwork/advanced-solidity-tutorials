import { ethers, network } from "hardhat"
import { LOCAL_DEV_NETWORK_NAMES } from "../utils/constants"
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"

import * as C from "../typechain-types"
import { expect } from "chai"
import { deployNewContract } from "../utils/helpers"

const NULL_ADDRESS = "0x0000000000000000000000000000000000000000"

!LOCAL_DEV_NETWORK_NAMES.includes(network.name)
    ? describe.skip
    : describe("BridgedToken", () => {
          let deployer: SignerWithAddress
          let user: SignerWithAddress
          let bridgeC: C.StandardTokenBridge
          let anchorC: C.MockAnchor
          let messengerC: C.MockMessenger
          let bridgeTokenC: C.BridgedERC20

          beforeEach(async () => {
              deployer = (await ethers.getSigners())[0]
              user = (await ethers.getSigners())[1]

              messengerC = (await deployNewContract(
                  "MockMessenger",
                  deployer,
                  []
              )) as C.MockMessenger
              anchorC = (await deployNewContract("MockAnchor", deployer, [
                  messengerC.address,
              ])) as C.MockAnchor

              bridgeC = (await deployNewContract("StandardTokenBridge", deployer, [
                  true,
                  anchorC.address,
              ])) as C.StandardTokenBridge

              bridgeTokenC = (await deployNewContract("BridgedERC20", deployer, [
                  18,
                  "Test Standard Bridge Token",
                  "TSBT",
                  bridgeC.address,
                  NULL_ADDRESS, // for testing
              ])) as C.BridgedERC20

              await bridgeC.connect(deployer).initialize(bridgeTokenC.address)
          })

          it("initial states", async () => {
              expect(await bridgeTokenC.decimals()).to.be.equal(18)
              expect(await bridgeTokenC.bridge()).to.be.equal(bridgeC.address)
          })

          it("only bridge can mint", async () => {
              await expect(
                  bridgeTokenC.connect(deployer).mint(deployer.address, 1)
              ).to.be.revertedWith("ONLY_BRIDGE")
          })

          it("only bridge can burn", async () => {
              await expect(bridgeTokenC.connect(deployer).burn(user.address, 1)).to.be.revertedWith(
                  "ONLY_BRIDGE"
              )
          })
      })

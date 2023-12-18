import { ethers, network } from "hardhat"
import { LOCAL_DEV_NETWORK_NAMES } from "../utils/constants"
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"

import * as C from "../typechain-types"
import { expect } from "chai"
import { deployNewContract, encodeParams } from "../utils/helpers"

const NULL_ADDRESS = "0x0000000000000000000000000000000000000000"

!LOCAL_DEV_NETWORK_NAMES.includes(network.name)
    ? describe.skip
    : describe("StandardTokenBridge", () => {
          let deployer: SignerWithAddress
          let user: SignerWithAddress
          let bridgeC: C.StandardTokenBridge
          let anchorC: C.MockAnchor
          let messengerC: C.MockMessenger
          let sourceTokenC: C.MockNativeERC20

          const bridgeAmount = ethers.utils.parseUnits("10", "18")
          const dstChainId = 137

          beforeEach(async () => {
              deployer = (await ethers.getSigners())[0]
              user = (await ethers.getSigners())[1]

              sourceTokenC = (await deployNewContract(
                  "MockNativeERC20",
                  deployer,
                  []
              )) as C.MockNativeERC20
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

              await bridgeC.connect(deployer).initialize(sourceTokenC.address)

              await sourceTokenC.connect(deployer).transfer(user.address, bridgeAmount)
          })

          it("initial states", async () => {
              expect(await bridgeC.anchor()).to.equal(anchorC.address)
              expect(await bridgeC.messenger()).to.equal(messengerC.address)
              expect(await bridgeC.owner()).to.equal(deployer.address)
              expect(await bridgeC.paused()).to.equal(false)
              expect(await bridgeC.bridgeToken()).to.equal(sourceTokenC.address)
          })

          it("Pause and unpause", async () => {
              await expect(bridgeC.connect(user).pause()).to.be.revertedWith(
                  "Ownable: caller is not the owner"
              )

              await bridgeC.connect(deployer).pause()
              expect(await bridgeC.paused()).to.equal(true)

              await expect(bridgeC.connect(user).unpause()).to.be.revertedWith(
                  "Ownable: caller is not the owner"
              )
              await bridgeC.connect(deployer).unpause()
              expect(await bridgeC.paused()).to.equal(false)
          })

          it("encode & decode payload", async () => {
              const amount = ethers.utils.parseUnits("100", "18")
              const dstRecipient = user.address
              const encodedPayload = await bridgeC.encodePayload(amount, dstRecipient)
              expect(encodedPayload).to.be.equal(
                  encodeParams(["uint256", "address"], [amount, dstRecipient])
              )
              const decodedRes = await bridgeC.decodePayload(encodedPayload)
              expect(decodedRes.amount).to.be.equal(amount)
              expect(decodedRes.recipient).to.be.equal(dstRecipient)
          })

          describe("bridgeOut", () => {
              it("zero amount", async () => {
                  await expect(
                      bridgeC.connect(user).bridgeOut(dstChainId, 0, user.address, {
                          value: 0,
                      })
                  ).to.be.revertedWith("ZERO_AMOUNT")
              })

              it("null recipient", async () => {
                  await expect(
                      bridgeC.connect(user).bridgeOut(dstChainId, bridgeAmount, NULL_ADDRESS, {
                          value: 0,
                      })
                  ).to.be.revertedWith("NULL_RECIPIENT")
              })

              it("insufficient allowance", async () => {
                  await expect(
                      bridgeC.connect(user).bridgeOut(dstChainId, bridgeAmount, user.address, {
                          value: 0,
                      })
                  ).to.be.revertedWith("ERC20: insufficient allowance")
              })

              it("insufficient balance", async () => {
                  await sourceTokenC
                      .connect(user)
                      .approve(bridgeC.address, ethers.constants.MaxUint256)
                  await expect(
                      bridgeC
                          .connect(user)
                          .bridgeOut(dstChainId, bridgeAmount.mul(2), user.address, {
                              value: 0,
                          })
                  ).to.be.revertedWith("ERC20: transfer amount exceeds balance")
              })

              it("insufficient bridge fee", async () => {
                  await sourceTokenC
                      .connect(user)
                      .approve(bridgeC.address, ethers.constants.MaxUint256)
                  await expect(
                      bridgeC.connect(user).bridgeOut(dstChainId, bridgeAmount, user.address, {
                          value: 0,
                      })
                  ).to.be.revertedWith("INSUFFICIENT_BRIDGE_FEE")
              })
          })
      })

import { ethers, network } from "hardhat"
import { LOCAL_DEV_NETWORK_NAMES } from "../utils/constants"
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"

import * as C from "../typechain-types"
import { expect } from "chai"
import { deployNewContract, getTransactionReceipt } from "../utils/helpers"

!LOCAL_DEV_NETWORK_NAMES.includes(network.name)
    ? describe.skip
    : describe("Full Process", () => {
          let deployer: SignerWithAddress
          let user: SignerWithAddress
          let dstRecipient: SignerWithAddress

          let aBridgeC: C.StandardTokenBridge
          let aSourceTokenC: C.MockNativeERC20
          let aAnchorC: C.MockAnchor
          let aMessengerC: C.MockMessenger
          let bBridgeC: C.StandardTokenBridge
          let bStandardBridgeTokenC: C.BridgedERC20
          let bAnchorC: C.MockAnchor
          let bMessengerC: C.MockMessenger

          beforeEach(async () => {
              deployer = (await ethers.getSigners())[0]
              user = (await ethers.getSigners())[1]
              dstRecipient = (await ethers.getSigners())[2]

              /** Mock Bool Deployment */
              aMessengerC = (await deployNewContract(
                  "MockMessenger",
                  deployer,
                  []
              )) as C.MockMessenger
              aAnchorC = (await deployNewContract("MockAnchor", deployer, [
                  aMessengerC.address,
              ])) as C.MockAnchor

              bMessengerC = (await deployNewContract(
                  "MockMessenger",
                  deployer,
                  []
              )) as C.MockMessenger
              bAnchorC = (await deployNewContract("MockAnchor", deployer, [
                  bMessengerC.address,
              ])) as C.MockAnchor

              // Deploy Mock Source Token
              aSourceTokenC = (await deployNewContract(
                  "MockNativeERC20",
                  deployer,
                  []
              )) as C.MockNativeERC20

              /** Token Bridge Deployment */
              aBridgeC = (await deployNewContract("StandardTokenBridge", deployer, [
                  true,
                  aAnchorC.address,
              ])) as C.StandardTokenBridge

              bBridgeC = (await deployNewContract("StandardTokenBridge", deployer, [
                  false,
                  bAnchorC.address,
              ])) as C.StandardTokenBridge

              /** Bridged Token Deployment on the derivate chain*/
              bStandardBridgeTokenC = (await deployNewContract("BridgedERC20", deployer, [
                  18,
                  "Test Standard Bridge Token",
                  "TSBT",
                  bBridgeC.address,
                  aSourceTokenC.address,
              ])) as C.BridgedERC20

              /** StandardTokenBridge Initialization */
              await aBridgeC.connect(deployer).initialize(aSourceTokenC.address)
              await bBridgeC.connect(deployer).initialize(bStandardBridgeTokenC.address)
          })

          it("lock & mint", async () => {
              const dstChainId = 137
              const amount = ethers.utils.parseUnits("100", "6")
              const payload = await aBridgeC.encodePayload(amount, dstRecipient.address)
              const fee = await aBridgeC.getBridgeFee(dstChainId, amount, dstRecipient.address)
              // Transfer test tokens to user
              await aSourceTokenC.connect(deployer).transfer(user.address, amount)

              // Approve tokens to be locked
              await aSourceTokenC.connect(user).approve(aBridgeC.address, amount)

              await aBridgeC
                  .connect(user)
                  .bridgeOut(dstChainId, amount, user.address, { value: fee })

              expect(await aSourceTokenC.balanceOf(user.address)).to.be.equal(0)
              expect(await aSourceTokenC.balanceOf(aBridgeC.address)).to.be.equal(amount)

              // Submit on the destination chain (should mint on the derivative chain)
              await bAnchorC
                  .connect(deployer)
                  .receiveFromMessenger(bBridgeC.address, await aAnchorC.FIXED_TID(), payload)

              expect(await bStandardBridgeTokenC.balanceOf(dstRecipient.address)).to.be.equal(
                  amount
              )
              expect(await bStandardBridgeTokenC.totalSupply()).to.be.equal(amount)
          })

          it("burn & unlock", async () => {
              const aChainId = 1
              const bChainId = 137
              const amount = ethers.utils.parseUnits("100", "18")
              const payload = await aBridgeC.encodePayload(amount, user.address)
              const fee = await aBridgeC.getBridgeFee(bChainId, amount, user.address)

              // Transfer test tokens to user
              await aSourceTokenC.connect(deployer).transfer(user.address, amount)

              // Approve tokens to be locked
              await aSourceTokenC.connect(user).approve(aBridgeC.address, amount)
              await aBridgeC.connect(user).bridgeOut(bChainId, amount, user.address, { value: fee })
              // Submit on the other chain
              await bAnchorC
                  .connect(deployer)
                  .receiveFromMessenger(bBridgeC.address, await aAnchorC.FIXED_TID(), payload)

              expect(await bStandardBridgeTokenC.balanceOf(user.address)).to.be.equal(amount)
              expect(await bStandardBridgeTokenC.totalSupply()).to.be.equal(amount)

              await expect(
                  bBridgeC
                      .connect(user)
                      .bridgeOut(aChainId, amount, dstRecipient.address, { value: fee })
              ).to.be.revertedWith("ERC20: insufficient allowance")

              await bStandardBridgeTokenC
                  .connect(user)
                  .approve(bBridgeC.address, ethers.constants.MaxUint256)

              await expect(
                  bBridgeC
                      .connect(user)
                      .bridgeOut(aChainId, amount.mul(2), dstRecipient.address, { value: fee })
              ).to.be.revertedWith("ERC20: transfer amount exceeds balance")

              const txReceipt = await getTransactionReceipt(
                  await bBridgeC
                      .connect(user)
                      .bridgeOut(aChainId, amount, dstRecipient.address, { value: fee }),
                  1
              )

              expect(await bStandardBridgeTokenC.balanceOf(bBridgeC.address)).to.be.equal(0)
              expect(await bStandardBridgeTokenC.balanceOf(user.address)).to.be.equal(0)
              expect(await bStandardBridgeTokenC.totalSupply()).to.be.equal(0)

              const returnPayload = await bBridgeC.encodePayload(amount, dstRecipient.address)

              const preABridgeBalance = await aSourceTokenC.balanceOf(aBridgeC.address)
              const preDstRecipientBalance = await aSourceTokenC.balanceOf(dstRecipient.address)

              expect(preABridgeBalance).to.be.equal(amount)
              expect(preDstRecipientBalance).to.be.equal(0)

              await aAnchorC
                  .connect(deployer)
                  .receiveFromMessenger(aBridgeC.address, await bAnchorC.FIXED_TID(), returnPayload)
              const postABridgeBalance = await aSourceTokenC.balanceOf(aBridgeC.address)
              const postDstRecipientBalance = await aSourceTokenC.balanceOf(dstRecipient.address)

              expect(preABridgeBalance.sub(postABridgeBalance)).to.be.equal(amount)
              expect(postDstRecipientBalance.sub(preDstRecipientBalance)).to.be.equal(amount)
          })
      })

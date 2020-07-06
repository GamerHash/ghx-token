import {constants, Contract, utils, Wallet} from 'ethers'
import {deployContract, loadFixture, MockProvider} from 'ethereum-waffle'
import {expect} from 'chai'
import GamerCoin from '../../build/GamerCoin.json'
import LockingContract from '../../build/LockingContract.json'
import {GREGORIAN_YEAR} from '../utils/timeConstants'
import {skippableBeforeEach} from '../utils/skippableHooks'
import {increaseTime} from '../utils/timeTravel'

describe('LockingContract', () => {
  const totalTokens = utils.parseEther(`${880_000_000}`)

  // `gasLimit` is set for certain transactions to make the `revertedWith` matcher work.
  // See https://github.com/EthWorks/Waffle/issues/255
  const overrides = {gasLimit: 6_000_000}

  let provider: MockProvider
  let deployer: Wallet
  let beneficiary: Wallet
  let token: Contract
  let lockingContract: Contract

  async function fixture([deployer, beneficiary]: Wallet[], provider: MockProvider) {
    const token = await deployContract(deployer, GamerCoin, [totalTokens])
    const lockingContract = await deployContract(deployer, LockingContract, [token.address, beneficiary.address])
    return {provider, deployer, beneficiary, token, lockingContract}
  }

  beforeEach(async () => {
    ({provider, deployer, beneficiary, token, lockingContract} = await loadFixture(fixture))
  })

  describe('constructor', () => {
    it('sets correct token and beneficiary address', async () => {
      await expect(lockingContract._token()).to.eventually.eq(token.address)
      await expect(lockingContract._beneficiary()).to.eventually.eq(beneficiary.address)
    })

    it('validates token and beneficiary address', async () => {
      await expect(deployContract(deployer, LockingContract, [constants.AddressZero, beneficiary.address]))
        .to.be.revertedWith('token is the zero address')
      await expect(deployContract(deployer, LockingContract, [token.address, constants.AddressZero]))
        .to.be.revertedWith('beneficiary is the zero address')
    })
  })

  // Example params:
  //   - 40% of locked tokens released after 1 year
  //   - 20% of locked tokens released every next 2 months
  //   - total lock duration: 1 year 6 months
  const lockedTokens = utils.parseEther(`${132_000_000}`)
  const cliffDuration = GREGORIAN_YEAR
  const cliffAmount = lockedTokens.mul(4).div(10)
  const numSteps = 3
  const stepDuration = GREGORIAN_YEAR / 6
  const stepAmount = lockedTokens.mul(2).div(10)

  describe('lockTokens', () => {
    let startTime: number

    beforeEach(async () => {
      await token.approve(lockingContract.address, lockedTokens)
      const latestBlock = await deployer.provider.getBlock('latest')
      startTime = latestBlock.timestamp
    })

    it('transfers tokens to LockingContract', async () => {
      await lockingContract.lockTokens(startTime, cliffDuration, cliffAmount, numSteps, stepDuration, stepAmount)
      await expect(token.balanceOf(lockingContract.address)).to.eventually.eq(lockedTokens)
    })

    it('emits TokensLocked event and prevents future calls', async () => {
      await expect(
        lockingContract.lockTokens(startTime, cliffDuration, cliffAmount, numSteps, stepDuration, stepAmount),
      ).to.emit(lockingContract, 'TokensLocked')

      await expect(
        lockingContract.lockTokens(
          startTime, cliffDuration, cliffAmount, numSteps, stepDuration, stepAmount, overrides,
        ),
      ).to.be.revertedWith('already locked')
    })

    it('can only be called by deployer', async () => {
      const contract = lockingContract.connect(beneficiary)
      await expect(
        contract.lockTokens(startTime, cliffDuration, cliffAmount, numSteps, stepDuration, stepAmount, overrides),
      ).to.be.revertedWith('caller is not the owner')
    })

    it('validates input arguments', async () => {
      const badStartTime = startTime - 2 * GREGORIAN_YEAR
      await expect(
        lockingContract.lockTokens(
          badStartTime, cliffDuration, cliffAmount, numSteps, stepDuration, stepAmount, overrides,
        ),
      ).to.be.revertedWith('cliff end time is before current time')

      await expect(
        lockingContract.lockTokens(startTime + 30, 0, cliffAmount, numSteps, stepDuration, stepAmount, overrides),
      ).to.be.revertedWith('cliffDuration is 0')

      await expect(
        lockingContract.lockTokens(startTime, cliffDuration, 0, numSteps, stepDuration, stepAmount, overrides),
      ).to.be.revertedWith('cliffAmount is 0')

      await expect(
        lockingContract.lockTokens(startTime, cliffDuration, cliffAmount, 0, stepDuration, stepAmount, overrides),
      ).to.be.revertedWith('numSteps is 0')

      await expect(lockingContract.lockTokens(
        startTime, cliffDuration, cliffAmount, numSteps, 0, stepAmount, overrides),
      ).to.be.revertedWith('stepDuration is 0')

      await expect(
        lockingContract.lockTokens(startTime, cliffDuration, cliffAmount, numSteps, stepDuration, 0, overrides),
      ).to.be.revertedWith('stepAmount is 0')
    })
  })

  describe('releaseTokens', () => {
    let asBeneficiary: Contract

    skippableBeforeEach(async function () {
      await token.approve(lockingContract.address, lockedTokens)
      const latestBlock = await provider.getBlock('latest')
      const startTime = latestBlock.timestamp
      await lockingContract.lockTokens(startTime, cliffDuration, cliffAmount, numSteps, stepDuration, stepAmount)
      asBeneficiary = lockingContract.connect(beneficiary)
    })

    it('can only be called by beneficiary', async () => {
      await expect(lockingContract.releaseTokens(overrides))
        .to.be.revertedWith('caller is not the beneficiary')
    })

    it('can only be called in locked state (skip beforeEach)', async () => {
      await expect(asBeneficiary.releaseTokens(overrides))
        .to.be.revertedWith('not locked yet')
    })

    it('does not release any tokens before cliff end', async () => {
      await expect(asBeneficiary.releaseTokens(overrides))
        .to.be.revertedWith('called before cliff end')
    })

    it('releases cliff amount after cliff end', async () => {
      await increaseTime(provider, cliffDuration)
      await asBeneficiary.releaseTokens()
      await expect(token.balanceOf(beneficiary.address)).to.eventually.eq(cliffAmount)
    })

    it('emits TokensReleased event with the cliff amount released', async () => {
      await increaseTime(provider, cliffDuration)
      await expect(asBeneficiary.releaseTokens())
        .to.emit(asBeneficiary, 'TokensReleased')
        .withArgs(cliffAmount)
    })

    it('does not release cliff amount twice', async () => {
      await increaseTime(provider, cliffDuration)
      await asBeneficiary.releaseTokens()
      await expect(asBeneficiary.releaseTokens(overrides))
        .to.be.revertedWith('called before current step end')
    })

    it('releases 1st step amount after 1st step end', async () => {
      await increaseTime(provider, cliffDuration)
      await asBeneficiary.releaseTokens()
      await increaseTime(provider, stepDuration)
      await asBeneficiary.releaseTokens()
      await expect(token.balanceOf(beneficiary.address))
        .to.eventually.eq(cliffAmount.add(stepAmount))
    })

    it('emits TokensReleased event with the step amount released', async () => {
      await increaseTime(provider, cliffDuration)
      await asBeneficiary.releaseTokens()
      await increaseTime(provider, stepDuration)
      await expect(asBeneficiary.releaseTokens())
        .to.emit(asBeneficiary, 'TokensReleased')
        .withArgs(stepAmount)
    })

    it('does not release 1st step amount twice', async () => {
      await increaseTime(provider, cliffDuration)
      await asBeneficiary.releaseTokens()
      await increaseTime(provider, stepDuration)
      await asBeneficiary.releaseTokens()
      await expect(asBeneficiary.releaseTokens(overrides))
        .to.be.revertedWith('called before current step end')
    })

    it('releases 2nd step amount after 2nd step end, prevents premature 3rd step release', async () => {
      await increaseTime(provider, cliffDuration)
      await asBeneficiary.releaseTokens()
      for (let i = 0; i < 2; i++) {
        await increaseTime(provider, stepDuration)
        await asBeneficiary.releaseTokens()
      }
      await expect(token.balanceOf(beneficiary.address))
        .to.eventually.eq(cliffAmount.add(stepAmount.mul(2)))
      await expect(asBeneficiary.releaseTokens(overrides))
        .to.be.revertedWith('called before current step end')
    })

    it('releases last step amount after last step end', async () => {
      await increaseTime(provider, cliffDuration)
      await asBeneficiary.releaseTokens()
      for (let i = 0; i < 3; i++) {
        await increaseTime(provider, stepDuration)
        await asBeneficiary.releaseTokens()
      }
      await expect(token.balanceOf(beneficiary.address)).to.eventually.eq(lockedTokens)
    })

    it('enables release of cliff and 1st step amounts at once', async () => {
      await increaseTime(provider, cliffDuration + stepDuration)
      await expect(asBeneficiary.releaseTokens())
        .to.emit(asBeneficiary, 'TokensReleased')
        .withArgs(cliffAmount.add(stepAmount))
      await expect(token.balanceOf(beneficiary.address)).to.eventually.eq(cliffAmount.add(stepAmount))
    })

    it('enables release of all locked tokens at once', async () => {
      await increaseTime(provider, cliffDuration + stepDuration * numSteps)
      await expect(asBeneficiary.releaseTokens())
        .to.emit(asBeneficiary, 'TokensReleased')
        .withArgs(lockedTokens)
      await expect(token.balanceOf(beneficiary.address)).to.eventually.eq(lockedTokens)
    })

    it('enables release of 1st and 2nd step amounts at once', async () => {
      await increaseTime(provider, cliffDuration)
      await asBeneficiary.releaseTokens()
      await increaseTime(provider, stepDuration * 2)
      await expect(asBeneficiary.releaseTokens())
        .to.emit(asBeneficiary, 'TokensReleased')
        .withArgs(stepAmount.mul(2))
      await expect(token.balanceOf(beneficiary.address))
        .to.eventually.eq(cliffAmount.add(stepAmount.mul(2)))
    })

    it('enables release of 2nd and 3rd step amounts at once', async () => {
      await increaseTime(provider, cliffDuration + stepDuration)
      await asBeneficiary.releaseTokens()
      await increaseTime(provider, stepDuration * 2)
      await expect(asBeneficiary.releaseTokens())
        .to.emit(asBeneficiary, 'TokensReleased')
        .withArgs(stepAmount.mul(2))
      await expect(token.balanceOf(beneficiary.address)).to.eventually.eq(lockedTokens)
    })

    it('reverts after all tokens has been released', async () => {
      await increaseTime(provider, cliffDuration + stepDuration * numSteps)
      await asBeneficiary.releaseTokens()

      await expect(asBeneficiary.releaseTokens(overrides))
        .to.be.revertedWith('all tokens released')

      await increaseTime(provider, stepDuration)
      await expect(asBeneficiary.releaseTokens(overrides))
        .to.be.revertedWith('all tokens released')
    })
  })

  describe('unlockedAmount', () => {
    it('returns 0 before locking', async () => {
      await expect(lockingContract.unlockedAmount()).to.eventually.eq(0)
    })
  })

  describe('totalAmount', () => {
    let asBeneficiary: Contract

    skippableBeforeEach(async () => {
      await token.approve(lockingContract.address, lockedTokens)
      const latestBlock = await provider.getBlock('latest')
      const startTime = latestBlock.timestamp
      await lockingContract.lockTokens(startTime, cliffDuration, cliffAmount, numSteps, stepDuration, stepAmount)
      asBeneficiary = lockingContract.connect(beneficiary)
    })

    it('returns 0 before locking (skip beforeEach)', async () => {
      await expect(lockingContract.totalAmount()).to.eventually.eq(0)
    })

    it('returns the total amount of tokens originally locked', async () => {
      await expect(lockingContract.totalAmount()).to.eventually.eq(lockedTokens)
    })

    it('is not affected by token releases', async () => {
      await increaseTime(provider, cliffDuration)
      await asBeneficiary.releaseTokens()
      await expect(lockingContract.totalAmount()).to.eventually.eq(lockedTokens)

      await increaseTime(provider, stepDuration)
      await asBeneficiary.releaseTokens()
      await expect(lockingContract.totalAmount()).to.eventually.eq(lockedTokens)
    })
  })

  describe('releasableAmount', () => {
    let asBeneficiary: Contract

    skippableBeforeEach(async () => {
      await token.approve(lockingContract.address, lockedTokens)
      const latestBlock = await provider.getBlock('latest')
      const startTime = latestBlock.timestamp
      await lockingContract.lockTokens(startTime, cliffDuration, cliffAmount, numSteps, stepDuration, stepAmount)
      asBeneficiary = lockingContract.connect(beneficiary)
    })

    it('returns 0 before locking (skip beforeEach)', async () => {
      await expect(lockingContract.releasableAmount()).to.eventually.eq(0)
    })

    it('returns the amount of tokens that can be released', async () => {
      await expect(lockingContract.releasableAmount()).to.eventually.eq(0)

      await increaseTime(provider, cliffDuration)
      await expect(lockingContract.releasableAmount()).to.eventually.eq(cliffAmount)

      await increaseTime(provider, stepDuration)
      await expect(lockingContract.releasableAmount()).to.eventually.eq(cliffAmount.add(stepAmount))
    })

    it('takes into account already released tokens', async () => {
      await increaseTime(provider, cliffDuration)
      await asBeneficiary.releaseTokens()
      await expect(lockingContract.releasableAmount()).to.eventually.eq(0)

      await increaseTime(provider, stepDuration)
      await expect(lockingContract.releasableAmount()).to.eventually.eq(stepAmount)
    })
  })

  describe('cliffUnlockTime', () => {
    let startTime: number
    let asBeneficiary: Contract

    skippableBeforeEach(async () => {
      await token.approve(lockingContract.address, lockedTokens)
      const latestBlock = await provider.getBlock('latest')
      startTime = latestBlock.timestamp
      await lockingContract.lockTokens(startTime, cliffDuration, cliffAmount, numSteps, stepDuration, stepAmount)
      asBeneficiary = lockingContract.connect(beneficiary)
    })

    it('returns 0 before locking (skip beforeEach)', async () => {
      await expect(lockingContract.cliffUnlockTime()).to.eventually.eq(0)
    })

    it('returns end-of-cliff time', async () => {
      await expect(lockingContract.cliffUnlockTime()).to.eventually.eq(startTime + cliffDuration)
    })

    it('returns end-of-cliff time after this time', async () => {
      await increaseTime(provider, cliffDuration)
      await expect(lockingContract.cliffUnlockTime()).to.eventually.eq(startTime + cliffDuration)
    })

    it('return end-of-cliff time after releasing cliff amount', async () => {
      await increaseTime(provider, cliffDuration)
      await asBeneficiary.releaseTokens()
      await expect(lockingContract.cliffUnlockTime()).to.eventually.eq(startTime + cliffDuration)
    })
  })

  describe('stepUnlockTime', () => {
    let startTime: number
    let asBeneficiary: Contract

    skippableBeforeEach(async () => {
      await token.approve(lockingContract.address, lockedTokens)
      const latestBlock = await provider.getBlock('latest')
      startTime = latestBlock.timestamp
      await lockingContract.lockTokens(startTime, cliffDuration, cliffAmount, numSteps, stepDuration, stepAmount)
      asBeneficiary = lockingContract.connect(beneficiary)
    })

    it('returns 0 before locking (skip beforeEach)', async () => {
      await expect(lockingContract.stepUnlockTime(1)).to.eventually.eq(0)
    })

    it('validates stepNumber', async () => {
      await expect(lockingContract.stepUnlockTime(0)).to.be.revertedWith('stepNumber is 0')
      await expect(lockingContract.stepUnlockTime(4)).to.be.revertedWith('stepNumber is greater than the number of steps')
    })

    it('returns end-of-step time', async () => {
      await expect(lockingContract.stepUnlockTime(1)).to.eventually.eq(startTime + cliffDuration + stepDuration)
      await expect(lockingContract.stepUnlockTime(2)).to.eventually.eq(startTime + cliffDuration + 2 * stepDuration)
      await expect(lockingContract.stepUnlockTime(3)).to.eventually.eq(startTime + cliffDuration + 3 * stepDuration)
    })

    it('returns end-of-step time after this time', async () => {
      await increaseTime(provider, cliffDuration + 2 * stepDuration)
      await expect(lockingContract.stepUnlockTime(1)).to.eventually.eq(startTime + cliffDuration + stepDuration)
    })

    it('return end-of-step time after releasing this step amount', async () => {
      await increaseTime(provider, cliffDuration + stepDuration)
      await asBeneficiary.releaseTokens()
      await expect(lockingContract.stepUnlockTime(1)).to.eventually.eq(startTime + cliffDuration + stepDuration)
    })
  })

  describe('nextUnlockTime', () => {
    let startTime: number

    skippableBeforeEach(async () => {
      await token.approve(lockingContract.address, lockedTokens)
      const latestBlock = await provider.getBlock('latest')
      startTime = latestBlock.timestamp
      await lockingContract.lockTokens(startTime, cliffDuration, cliffAmount, numSteps, stepDuration, stepAmount)
    })

    it('returns 0 before locking (skip beforeEach)', async () => {
      await expect(lockingContract.nextUnlockTime()).to.eventually.eq(0)
    })

    it('returns end-of-cliff time before cliff end', async () => {
      await expect(lockingContract.nextUnlockTime()).to.eventually.eq(startTime + cliffDuration)
    })

    it('returns end-of-step times correctly', async () => {
      await increaseTime(provider, cliffDuration)
      await expect(lockingContract.nextUnlockTime()).to.eventually.eq(startTime + cliffDuration + stepDuration)
      await increaseTime(provider, stepDuration)
      await expect(lockingContract.nextUnlockTime()).to.eventually.eq(startTime + cliffDuration + 2 * stepDuration)
      await increaseTime(provider, stepDuration)
      await expect(lockingContract.nextUnlockTime()).to.eventually.eq(startTime + cliffDuration + 3 * stepDuration)
    })

    it('returns end-of-last-step time after all tokens have been unlocked', async () => {
      await increaseTime(provider, cliffDuration + 3 * stepDuration)
      await expect(lockingContract.nextUnlockTime()).to.eventually.eq(startTime + cliffDuration + 3 * stepDuration)
    })
  })
})

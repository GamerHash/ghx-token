import {MockProvider} from 'ethereum-waffle'
import {Contract, utils} from 'ethers'
import {expect} from 'chai'
import {deployGamerCoin} from '../../src/deployGamerCoin'
import {DeploymentParams} from '../../src/model/DeploymentParams'
import {currentTimeSeconds} from '../utils/currentTimeSeconds'
import {DAY, GREGORIAN_YEAR, HOUR} from '../utils/timeConstants'
import {DeployedLockPool, DoneTransfers} from '../../src/model/DeploymentResult'
import GamerCoin from '../../build/GamerCoin.json'
import LockingContract from '../../build/LockingContract.json'

describe('deployGamerCoin', () => {
  const provider = new MockProvider()
  const [deployer, teamBeneficiary, ecosystemBeneficiary, liquidityBeneficiary] = provider.getWallets()

  const deploymentParams: DeploymentParams = {
    totalTokenSupply: utils.parseEther(`${880_000_000}`),
    lockPools: [
      {
        name: 'Team',
        lockedAmount: utils.parseEther(`${132_000_000}`),
        beneficiaryAddress: teamBeneficiary.address,
        releaseSchedule: {
          startTime: currentTimeSeconds() + HOUR,
          cliffDuration: GREGORIAN_YEAR,
          cliffAmount: utils.parseEther(`${13_200_000}`),
          numSteps: 18,
          stepDuration: GREGORIAN_YEAR / 12,
          stepAmount: utils.parseEther(`${6_600_000}`),
        },
      },
      {
        name: 'Ecosystem Fund',
        lockedAmount: utils.parseEther(`${105_600_000}`),
        beneficiaryAddress: ecosystemBeneficiary.address,
        releaseSchedule: {
          startTime: currentTimeSeconds() + HOUR,
          cliffDuration: 30 * DAY,
          cliffAmount: utils.parseEther(`${10_560_000}`),
          numSteps: 5,
          stepDuration: GREGORIAN_YEAR,
          stepAmount: utils.parseEther(`${19_008_000}`),
        },
      },
    ],
    instantTransfers: [
      {
        name: 'Liquidity Reserve',
        beneficiaryAddress: liquidityBeneficiary.address,
        tokenAmount: utils.parseEther(`${38_720_000}`),
      },
    ],
    transactionParams: {
      defaults: {
        gasPrice: utils.parseUnits('8', 'gwei'),
        gasLimit: 4_000_123,
      },
    },
  }

  let tokenAddress: string
  let lockPools: DeployedLockPool[]
  let instantTransfers: DoneTransfers[]

  before(async () => {
    ({tokenAddress, lockPools, instantTransfers} = await deployGamerCoin(deployer, deploymentParams))
  })

  it('deploys token and returns it address', async () => {
    await expect(provider.getCode(tokenAddress)).to.eventually.eq('0x' + GamerCoin.evm.deployedBytecode.object)
  })

  it('deploys lockingContracts and returns their addresses', async () => {
    expect(lockPools.length).to.eq(deploymentParams.lockPools.length)

    for (const {name} of deploymentParams.lockPools) {
      const lockPool = lockPools.find(pool => pool.name === name)

      expect(lockPool?.lockingContractAddress).to.be.properAddress
      await expect(provider.getCode(lockPool!.lockingContractAddress))
        .to.eventually.eq('0x' + LockingContract.evm.deployedBytecode.object)
    }
  })

  it('locks correct amounts of tokens', async () => {
    const token = new Contract(tokenAddress, GamerCoin.abi, provider)

    for (const {name, lockedAmount} of deploymentParams.lockPools) {
      const {lockingContractAddress} = lockPools.find(pool => pool.name === name)!
      await expect(token.balanceOf(lockingContractAddress)).to.eventually.eq(lockedAmount)
    }
  })

  it('locks tokens for correct beneficiaries', async () => {
    for (const {name, beneficiaryAddress} of deploymentParams.lockPools) {
      const {lockingContractAddress} = lockPools.find(pool => pool.name === name)!
      const lockingContract = new Contract(lockingContractAddress, LockingContract.abi, provider)
      await expect(lockingContract.beneficiary()).to.eventually.eq(beneficiaryAddress)
    }
  })

  it('does all instant transfers', async () => {
    const token = new Contract(tokenAddress, GamerCoin.abi, provider)

    for (const {beneficiaryAddress, tokenAmount} of deploymentParams.instantTransfers) {
      await expect(token.balanceOf(beneficiaryAddress)).to.eventually.eq(tokenAmount)
    }
  })

  it('uses specified default gasPrice and gasLimit for transfer transactions', async () => {
    expect(instantTransfers.length).to.eq(deploymentParams.instantTransfers.length)
    for (const {name} of deploymentParams.instantTransfers) {
      const transfer = instantTransfers.find(transfer => transfer.name === name)!
      const txReceipt = await provider.getTransaction(transfer.transactionHash)
      expect(txReceipt.gasPrice).to.eq(deploymentParams.transactionParams.defaults!.gasPrice)
      expect(txReceipt.gasLimit).to.eq(deploymentParams.transactionParams.defaults!.gasLimit)
    }
  })
})

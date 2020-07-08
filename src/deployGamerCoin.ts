import {BigNumber, Wallet} from 'ethers'
import {GamerCoinFactory} from '../build/GamerCoinFactory'
import {GamerCoin} from '../build/GamerCoin'
import {LockingContractFactory} from '../build/LockingContractFactory'
import {LockingContract} from '../build/LockingContract'
import {DeploymentParams, InstantParams, PoolParams} from './model/DeploymentParams'
import {GasParams} from './model/GasParams'
import {FilledGasParams, fillMissingWithDefaults} from './utils/fillMissingWithDefaults'
import {validateLockPoolParams} from './utils/validateLockPoolParams'
import {DeployedLockPool, DeploymentResult, DoneTransfers} from './model/DeploymentResult'
import {Logger, noOpLogger} from './model/Logger'

export async function deployGamerCoin(
  deployer: Wallet,
  deploymentParams: DeploymentParams,
  log = noOpLogger,
): Promise<DeploymentResult> {
  const {totalTokenSupply, lockPools, instantTransfers, transactionParams} = deploymentParams
  validateLockPoolParams(lockPools)
  const gasParams = fillMissingWithDefaults(transactionParams)

  // Deploy GamerCoin token
  const token = await deployToken(deployer, totalTokenSupply, gasParams.tokenDeploy, log)

  // Deploy all pools and lock tokens
  const deployedPools: DeployedLockPool[] = []
  for (const lockPool of lockPools) {
    const contract = await deployPoolAndLock(deployer, token, lockPool, gasParams, log)
    deployedPools.push({
      name: lockPool.name,
      lockingContractAddress: contract.address,
    })
  }

  // Do instant token transfers
  const doneTransfers: DoneTransfers[] = []
  for (const transfer of instantTransfers) {
    const txReceipt = await transferTokens(token, transfer, gasParams, log)
    doneTransfers.push({
      name: transfer.name,
      transactionHash: txReceipt.transactionHash,
    })
  }

  return {
    tokenAddress: token.address,
    lockPools: deployedPools,
    instantTransfers: doneTransfers,
  }
}

async function deployToken(
  deployer: Wallet,
  totalTokenSupply: BigNumber,
  gasParams: GasParams,
  log: Logger,
): Promise<GamerCoin> {
  const gamerCoinFactory = new GamerCoinFactory(deployer)
  const token = await gamerCoinFactory.deploy(totalTokenSupply, gasParams)
  await token.deployed()
  log.info(`Deployed GHX token at ${token.address}`)
  return token
}

async function deployPoolAndLock(
  deployer: Wallet,
  token: GamerCoin,
  {name, beneficiaryAddress, lockedAmount, releaseSchedule}: PoolParams,
  gasParams: FilledGasParams,
  log: Logger,
): Promise<LockingContract> {
  log.info(`Deploying "${name}" lock pool...`)
  const lockingContractFactory = new LockingContractFactory(deployer)
  const lockingContract = await lockingContractFactory.deploy(
    token.address,
    beneficiaryAddress,
    gasParams.lockingContractDeploy,
  )
  await lockingContract.deployed()
  log.info(`   - locking contract deployed at ${lockingContract.address}`)

  const approveResponse = await token.approve(lockingContract.address, lockedAmount)
  await approveResponse.wait()
  log.info('   - tokens approved')

  const {startTime, cliffDuration, cliffAmount, numSteps, stepDuration, stepAmount} = releaseSchedule
  const lockResponse = await lockingContract.lockTokens(
    startTime,
    cliffDuration,
    cliffAmount,
    numSteps,
    stepDuration,
    stepAmount,
    gasParams.lockTokensCall,
  )
  await lockResponse.wait()
  log.info('   - tokens locked')

  return lockingContract
}

async function transferTokens(
  token: GamerCoin,
  {beneficiaryAddress, name, tokenAmount}: InstantParams,
  gasParams: FilledGasParams,
  log: Logger,
) {
  log.info(`Doing "${(name)}" instant transfer...`)
  const txResponse = await token.transfer(beneficiaryAddress, tokenAmount, gasParams.transferCall)
  const txReceipt = await txResponse.wait()
  log.info(`   - transaction mined, hash: ${txReceipt.transactionHash}`)
  return txReceipt
}

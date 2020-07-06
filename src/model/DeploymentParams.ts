import {BigNumber} from 'ethers'
import {GasParams} from './GasParams'

export interface DeploymentParams {
  totalTokenSupply: BigNumber,
  lockPools: PoolParams[],
  instantTransfers: InstantParams[],
  transactionParams: TransactionParams,
}

export interface TransactionParams {
  defaults?: GasParams,
  tokenDeploy?: GasParams,
  lockingContractDeploy?: GasParams,
  lockTokensCall?: GasParams,
  approveCall?: GasParams,
  transferCall?: GasParams,
}

export interface PoolParams {
  name: string,
  lockedAmount: BigNumber,
  beneficiaryAddress: string,
  releaseSchedule: ReleaseParams,
}

export interface ReleaseParams {
  startTime: number,
  cliffDuration: number,
  cliffAmount: BigNumber,
  numSteps: number,
  stepDuration: number,
  stepAmount: BigNumber,
}

export interface InstantParams {
  name: string,
  beneficiaryAddress: string,
  tokenAmount: BigNumber,
}

export interface DeploymentResult {
  tokenAddress: string,
  lockPools: DeployedLockPool[],
  instantTransfers: DoneTransfers[],
}

export interface DeployedLockPool {
  name: string,
  lockingContractAddress: string,
}

export interface DoneTransfers {
  name: string,
  transactionHash: string,
}

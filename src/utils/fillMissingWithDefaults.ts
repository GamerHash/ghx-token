import {GasParams} from '../model/GasParams'
import {TransactionParams} from '../model/DeploymentParams'

type Params = GasParams

export interface FilledGasParams {
  tokenDeploy: Params,
  lockingContractDeploy: Params,
  lockTokensCall: Params,
  approveCall: Params,
  transferCall: Params,
}

export function fillMissingWithDefaults({defaults, ...params}: TransactionParams): FilledGasParams {
  return {
    tokenDeploy: {
      gasPrice: params.tokenDeploy?.gasPrice ?? defaults?.gasPrice,
      gasLimit: params.tokenDeploy?.gasLimit ?? defaults?.gasLimit,
    },
    lockingContractDeploy: {
      gasPrice: params.lockingContractDeploy?.gasPrice ?? defaults?.gasPrice,
      gasLimit: params.lockingContractDeploy?.gasLimit ?? defaults?.gasLimit,
    },
    lockTokensCall: {
      gasPrice: params.lockTokensCall?.gasPrice ?? defaults?.gasPrice,
      gasLimit: params.lockTokensCall?.gasLimit ?? defaults?.gasLimit,
    },
    approveCall: {
      gasPrice: params.approveCall?.gasPrice ?? defaults?.gasPrice,
      gasLimit: params.approveCall?.gasLimit ?? defaults?.gasLimit,
    },
    transferCall: {
      gasPrice: params.transferCall?.gasPrice ?? defaults?.gasPrice,
      gasLimit: params.transferCall?.gasLimit ?? defaults?.gasLimit,
    },
  }
}

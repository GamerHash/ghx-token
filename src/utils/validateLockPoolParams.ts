import {PoolParams} from '../model/DeploymentParams'

export function validateLockPoolParams(lockPools: PoolParams[]): void {
  for (const {name, lockedAmount, releaseSchedule} of lockPools) {
    const {cliffAmount, numSteps, stepAmount} = releaseSchedule
    const releaseScheduleSum = cliffAmount.add(stepAmount.mul(numSteps))
    if (!lockedAmount.eq(releaseScheduleSum)) {
      throw new Error(`Invalid params for ${name} lock pool`)
    }
  }
}

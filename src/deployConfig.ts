import {utils, Wallet} from 'ethers'
import {currentTimeSeconds} from '../test/utils/currentTimeSeconds'
import {DAY, GREGORIAN_MONTH, GREGORIAN_YEAR, HOUR} from '../test/utils/timeConstants'
import {DeploymentParams} from './model/DeploymentParams'
import {parseTokens} from './utils/parseTokens'

// TODO set actual beneficiary addresses
// TODO set desired start times
// TODO add 'Token Contributors' instant transfer?

export const deployConfig: DeploymentParams = {
  totalTokenSupply: parseTokens(880_000_000),
  instantTransfers: [
    {
      name: 'Liquidity Reserve',
      beneficiaryAddress: Wallet.createRandom().address,
      tokenAmount: parseTokens(38_720_000),
    },
  ],
  lockPools: [
    {
      name: 'Team',
      lockedAmount: parseTokens(132_000_000),
      beneficiaryAddress: Wallet.createRandom().address,
      releaseSchedule: {
        startTime: currentTimeSeconds() + HOUR,
        cliffDuration: GREGORIAN_YEAR,
        cliffAmount: parseTokens(13_200_000),
        numSteps: 18,
        stepDuration: GREGORIAN_MONTH,
        stepAmount: parseTokens(6_600_000),
      },
    },
    {
      name: 'Community & Game mining',
      lockedAmount: parseTokens(44_000_000),
      beneficiaryAddress: Wallet.createRandom().address,
      releaseSchedule: {
        startTime: currentTimeSeconds() + HOUR,
        cliffDuration: 30 * DAY,
        cliffAmount: parseTokens(1_760_000),
        numSteps: 32,
        stepDuration: GREGORIAN_MONTH,
        stepAmount: parseTokens(1_320_000),
      },
    },
    {
      name: 'Foundation',
      lockedAmount: parseTokens(123_200_000),
      beneficiaryAddress: Wallet.createRandom().address,
      releaseSchedule: {
        startTime: currentTimeSeconds() + HOUR,
        cliffDuration: GREGORIAN_YEAR,
        cliffAmount: parseTokens(30_800_000),
        numSteps: 3,
        stepDuration: GREGORIAN_YEAR,
        stepAmount: parseTokens(30_800_000),
      },
    },
    {
      name: 'Advisors',
      lockedAmount: parseTokens(35_200_000),
      beneficiaryAddress: Wallet.createRandom().address,
      releaseSchedule: {
        startTime: currentTimeSeconds() + HOUR,
        cliffDuration: 90 * DAY,
        cliffAmount: parseTokens(8_800_000),
        numSteps: 3,
        stepDuration: 3 * GREGORIAN_MONTH,
        stepAmount: parseTokens(8_800_000),
      },
    },
    {
      name: 'Ecosystem Fund',
      lockedAmount: parseTokens(105_600_000),
      beneficiaryAddress: Wallet.createRandom().address,
      releaseSchedule: {
        startTime: currentTimeSeconds() + HOUR,
        cliffDuration: 30 * DAY,
        cliffAmount: parseTokens(10_560_000),
        numSteps: 5,
        stepDuration: GREGORIAN_YEAR,
        stepAmount: parseTokens(19_008_000),
      },
    },
    {
      name: 'Marketing',
      lockedAmount: parseTokens(35_200_000),
      beneficiaryAddress: Wallet.createRandom().address,
      releaseSchedule: {
        startTime: currentTimeSeconds() + HOUR,
        cliffDuration: 90 * DAY,
        cliffAmount: parseTokens(8_800_000),
        numSteps: 3,
        stepDuration: 3 * GREGORIAN_MONTH,
        stepAmount: parseTokens(8_800_000),
      },
    },
    {
      name: 'Strategic partnership',
      lockedAmount: parseTokens(44_000_000),
      beneficiaryAddress: Wallet.createRandom().address,
      releaseSchedule: {
        startTime: currentTimeSeconds() + HOUR,
        cliffDuration: 2 * GREGORIAN_YEAR,
        cliffAmount: parseTokens(22_000_000),
        numSteps: 1,
        stepDuration: GREGORIAN_YEAR,
        stepAmount: parseTokens(22_000_000),
      },
    },
  ],
  transactionParams: {
    defaults: {},
  },
}

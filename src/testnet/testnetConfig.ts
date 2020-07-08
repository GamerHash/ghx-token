import {currentTimeSeconds} from '../../test/utils/currentTimeSeconds'
import {HOUR} from '../../test/utils/timeConstants'
import {DeploymentParams} from '../model/DeploymentParams'
import {parseTokens} from '../utils/parseTokens'

export const testnetConfig: DeploymentParams = {
  totalTokenSupply: parseTokens(880_000_000),
  instantTransfers: [
    {
      name: 'Token Sale Contributors',
      beneficiaryAddress: '0x0fe9d1CFd4e671A36a64092bc87beFE9952eA672',
      tokenAmount: parseTokens(322_080_000),
    },
    {
      name: 'Liquidity Reserve',
      beneficiaryAddress: '0xC429A23072935c3dA626B47B57Abba3699Eab032',
      tokenAmount: parseTokens(38_720_000),
    },
  ],
  lockPools: [
    {
      name: 'Team',
      lockedAmount: parseTokens(132_000_000),
      beneficiaryAddress: '0xCfC99a10332D4992a9a96485a577F6c6dF77Ea98',
      releaseSchedule: {
        startTime: currentTimeSeconds(),
        cliffDuration: 12 * HOUR,
        cliffAmount: parseTokens(66_000_000),
        numSteps: 2,
        stepDuration: 6 * HOUR,
        stepAmount: parseTokens(33_000_000),
      },
    },
    {
      name: 'Ecosystem Fund',
      lockedAmount: parseTokens(105_600_000),
      beneficiaryAddress: '0x7B4395Eec8Ac4196Fdd1F9C4d057Afc636deAA79',
      releaseSchedule: {
        startTime: currentTimeSeconds(),
        cliffDuration: 12 * HOUR,
        cliffAmount: parseTokens(52_800_000),
        numSteps: 2,
        stepDuration: 6 * HOUR,
        stepAmount: parseTokens(26_400_000),
      },
    },
    {
      name: 'Foundation',
      lockedAmount: parseTokens(123_200_000),
      beneficiaryAddress: '0x72AE2C5A9985b5DAb9a5a6C134763Eb4247F3b6e',
      releaseSchedule: {
        startTime: currentTimeSeconds(),
        cliffDuration: 12 * HOUR,
        cliffAmount: parseTokens(61_600_000),
        numSteps: 2,
        stepDuration: 6 * HOUR,
        stepAmount: parseTokens(30_800_000),
      },
    },
    {
      name: 'Marketing and Strategic partnership',
      lockedAmount: parseTokens(79_200_000),
      beneficiaryAddress: '0x577584EeBF32F0863202b5166c2Bb9738e1A3601',
      releaseSchedule: {
        startTime: currentTimeSeconds(),
        cliffDuration: 12 * HOUR,
        cliffAmount: parseTokens(39_600_000),
        numSteps: 2,
        stepDuration: 6 * HOUR,
        stepAmount: parseTokens(19_800_000),
      },
    },
    {
      name: 'Community & Game mining',
      lockedAmount: parseTokens(44_000_000),
      beneficiaryAddress: '0x96e5fc4c3B30164c9eAF5a6d8b176973995EC379',
      releaseSchedule: {
        startTime: currentTimeSeconds(),
        cliffDuration: 12 * HOUR,
        cliffAmount: parseTokens(22_000_000),
        numSteps: 2,
        stepDuration: 6 * HOUR,
        stepAmount: parseTokens(11_000_000),
      },
    },
    {
      name: 'Advisors',
      lockedAmount: parseTokens(35_200_000),
      beneficiaryAddress: '0xDF6B2dDEE4FBACbdb5045327176454963c7f0069',
      releaseSchedule: {
        startTime: currentTimeSeconds(),
        cliffDuration: 12 * HOUR,
        cliffAmount: parseTokens(17_600_000),
        numSteps: 2,
        stepDuration: 6 * HOUR,
        stepAmount: parseTokens(8_800_000),
      },
    },
  ],
  transactionParams: {
    defaults: {},
  },
}

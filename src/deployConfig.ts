import {DeploymentParams} from './model/DeploymentParams'
import {parseTokens} from './utils/parseTokens'
import {DAY, GREGORIAN_MONTH, GREGORIAN_YEAR} from './utils/timeConstants'

// this is in unix time, unix time 1609369200 is Wed Dec 30 23:00:00 UTC 2020
// confirm with `date --date=@1609369200`
export const START_TIME = 1609369200;

export const deployConfig: DeploymentParams = {
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
        startTime: START_TIME,
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
      beneficiaryAddress: '0x96e5fc4c3B30164c9eAF5a6d8b176973995EC379',
      releaseSchedule: {
        startTime: START_TIME,
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
      beneficiaryAddress: '0x72AE2C5A9985b5DAb9a5a6C134763Eb4247F3b6e',
      releaseSchedule: {
        startTime: START_TIME,
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
      beneficiaryAddress: '0xDF6B2dDEE4FBACbdb5045327176454963c7f0069',
      releaseSchedule: {
        startTime: START_TIME,
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
      beneficiaryAddress: '0x7B4395Eec8Ac4196Fdd1F9C4d057Afc636deAA79',
      releaseSchedule: {
        startTime: START_TIME,
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
      beneficiaryAddress: '0x577584EeBF32F0863202b5166c2Bb9738e1A3601',
      releaseSchedule: {
        startTime: START_TIME,
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
      beneficiaryAddress: '0xb1a17849627480eb750CbF9A75798C0036308c9F',
      releaseSchedule: {
        startTime: START_TIME,
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

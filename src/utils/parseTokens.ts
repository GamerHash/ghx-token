import {BigNumber, utils} from 'ethers'

export function parseTokens(numTokens: number): BigNumber {
  return utils.parseEther(`${numTokens}`)
}

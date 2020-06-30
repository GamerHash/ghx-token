import {providers} from 'ethers'

export async function increaseTime(provider: providers.JsonRpcProvider, seconds: number): Promise<number> {
  const timeAdjustment = await provider.send('evm_increaseTime', [seconds])
  await provider.send('evm_mine', [])
  return timeAdjustment
}

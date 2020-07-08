import {MockProvider} from 'ethereum-waffle'
import {expect} from 'chai'
import {deployGamerCoin} from '../../../src/deployGamerCoin'
import {testnetConfig} from '../../../src/testnet/testnetConfig'
import {consoleLogger} from '../../../src/model/Logger'

describe('deployGamerCoin - test on testnet deployment params', () => {
  const provider = new MockProvider()
  const [deployer] = provider.getWallets()

  it('does not throw', async () => {
    await expect(deployGamerCoin(deployer, testnetConfig, consoleLogger)).to.be.fulfilled
  })
})

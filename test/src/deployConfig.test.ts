import {MockProvider} from 'ethereum-waffle'
import {expect} from 'chai'
import {deployGamerCoin} from '../../src/deployGamerCoin'
import {deployConfig} from '../../src/deployConfig'
import {consoleLogger} from '../../src/model/Logger'

describe('deployGamerCoin - test on actual deployment params', () => {
  const provider = new MockProvider()
  const [deployer] = provider.getWallets()

  it('does not throw', async () => {
    await expect(deployGamerCoin(deployer, deployConfig, consoleLogger)).to.be.fulfilled
  })
})

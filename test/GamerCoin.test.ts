import {expect} from 'chai'
import {Contract, utils, Wallet} from 'ethers'
import {deployContract, loadFixture} from 'ethereum-waffle'
import GamerCoin from '../build/GamerCoin.json'

describe('GamerCoin', () => {
  const totalTokens = utils.parseEther(`${880_000_000}`)

  let deployer: Wallet
  let token: Contract

  async function fixture([deployer]: Wallet[]) {
    token = await deployContract(deployer, GamerCoin, [totalTokens])
    return {deployer, token}
  }

  beforeEach(async () => {
    ({deployer, token} = await loadFixture(fixture))
  })

  describe('constructor', () => {
    it('sets correct name and symbol', async () => {
      await expect(token.name()).to.eventually.equal('GamerCoin')
      await expect(token.symbol()).to.eventually.equal('GHX')
    })

    it('transfers initial balance to correct address', async () => {
      await expect(token.balanceOf(deployer.address)).to.eventually.eq(totalTokens)
    })
  })
})

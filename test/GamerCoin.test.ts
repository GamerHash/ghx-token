import {expect} from 'chai'
import {Contract, utils, Wallet} from 'ethers'
import {deployContract, loadFixture} from 'ethereum-waffle'
import GamerCoin from '../build/GamerCoin.json'

describe('GamerCoin', () => {
  const totalTokens = utils.parseEther(`${880_000_000}`)

  let wallet: Wallet
  let token: Contract

  async function fixture([wallet]: Wallet[]) {
    token = await deployContract(wallet, GamerCoin, [totalTokens])
    return {wallet, token}
  }

  beforeEach(async () => {
    ({wallet, token} = await loadFixture(fixture))
  })

  describe('constructor', () => {
    it('sets correct name and symbol', async () => {
      await expect(token.name()).to.eventually.equal('GamerCoin')
      await expect(token.symbol()).to.eventually.equal('GHX')
    })

    it('transfers initial balance to correct address', async () => {
      await expect(token.balanceOf(wallet.address)).to.eventually.eq(totalTokens)
    })
  })
})

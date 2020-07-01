import * as fs from 'fs'
import {getDefaultProvider, Wallet} from 'ethers'
import {deployGamerCoin} from './deployGamerCoin'
import {deployConfig} from './deployConfig'
import {consoleLogger} from './model/Logger'

async function run(args: string[]) {
  if (args.length !== 1) {
    throw new Error('Invalid number of arguments')
  }
  const secretsFile = fs.readFileSync(args[0], 'utf8')
  const secrets = JSON.parse(secretsFile)

  const provider = getDefaultProvider()
  const wallet = new Wallet(secrets.privateKey, provider)
  await deployGamerCoin(wallet, deployConfig, consoleLogger)
}

run(process.argv.slice(2))
  .catch(e => {
    console.error(e)
    process.exit(1)
  })

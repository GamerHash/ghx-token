import * as fs from 'fs'
import {providers, utils, Wallet} from 'ethers'
import {deployGamerCoin} from './deployGamerCoin'
import {deployConfig} from './deployConfig'
import {consoleLogger} from './model/Logger'

async function run(args: string[]) {
  if (args.length !== 2) {
    throw new Error('Invalid number of arguments')
  }
  const secretsFile = fs.readFileSync(args[0], 'utf8')
  const secrets = JSON.parse(secretsFile)

  const network = "homestead"
  const provider = new providers.InfuraProvider(network, {
    projectId: '',
    projectSecret: '',
  })
  const wallet = Wallet.fromEncryptedJsonSync(secretsFile, args[1]).connect(provider)

  consoleLogger.info(`Opened wallet ${wallet.address}, checking balance...`);
  let balance = await wallet.getBalance();
  consoleLogger.info(`network says we've got ${utils.formatEther(balance)} eth (${balance} wei)`);
  consoleLogger.info(`current gas price: ${utils.formatUnits(await provider.getGasPrice(), 'gwei')} gwei - compare this with https://ethgasstation.info/`);
  await deployGamerCoin(wallet, deployConfig, consoleLogger)
}

run(process.argv.slice(2))
  .catch(e => {
    console.error(e)
    process.exit(1)
  })

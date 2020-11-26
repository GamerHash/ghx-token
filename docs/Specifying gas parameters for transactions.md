# Specifying gas parameters for transactions
Both `gasPrice` and `gasLimit` can be specified for transactions made by the deployment script.
They are set using `transactionParams` object in configuration file.
You can set specific `gasPrice`/`gasLimit` values for each type of transactions being made:
* `tokenDeploy` - deployment od the GHX token
* `lockingContractDeploy` - deployment of the `LockingContract`s
* `approveCall` - transaction approving the `LockingContract` to take the GHX token
* `lockTokensCall` - transaction locking the tokens in the `LockingContract`
* `transferCall` - GHX token transfer transactions

You can also specify `default` values that the script will fall back to in case you don't specify some of the above.

In case you don't specify the `default` values, the script will estimate the proper `gasLimit` values itself and ask Infura for the current `gasPrice`.


### Example config

```ts
export const deployConfig: DeploymentParams = {
  transactionParams: {
    transferCall: {
      gasLimit: 60_000,
    },
    lockingContractDeploy: {
      gasPrice: utils.parseUnits('120', 'gwei'),
    },
    tokenDeploy: {
      gasPrice: utils.parseUnits('120', 'gwei'),
    },
    defaults: {
      gasPrice: utils.parseUnits('100', 'gwei'),
    },
  },
  // the rest of the config...
}
```

### Notes
* For the purpose of this deployment, I would advise against changing the `gasLimit` values and leaving it up to the script to choose the right values.
* `gasPrice` values should not be set lower than the `low` or `standard` values shown by gas trackers at the moment of deployment:
    * https://etherscan.io/gasTracker
    * https://ethgasstation.info/index.php

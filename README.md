# GamerCoin contracts

## Deployment

The deployment of GamerCoin system is done in the following way.
First GamerCoin (GHX) ERC20-compatible token contract is created. The deployer of the contract becomes the owner of the total initial balance of 880 000 000 tokens. Next step is to create locking contracts for each individual allocation (Team, Foundation etc.) and lock specified amounts of tokens for times defined by Release Schedule. This is a 3-step process:
1. Deployment of a LockingContract
2. Approval of the newly created contract to transfer the tokens
3. Invocation of locking method which transfers the tokens to the LockingContract's possession.

Finally, the remaining tokens are transferred to specified allocations (those that have "Instant" Release Schedule)


### Deployment to Rinkeby testnet

The result of testnet deployment done on 7th July 2020:
```
Deployed GHX token at 0xc9a93bD0CE2e87fF128c343070BD4eb627D1119A
Deploying "Team" lock pool...
   - locking contract deployed at 0x39cE493b1Ef62075bf191441928b296c5Fc9aAf3
   - tokens approved
   - tokens locked
Deploying "Ecosystem Fund" lock pool...
   - locking contract deployed at 0x765bb76509b87590f5Da1C4dc7053088630f8EbD
   - tokens approved
   - tokens locked
Deploying "Foundation" lock pool...
   - locking contract deployed at 0xe4EcEce825D49297716576A75D116e6DDE368dC4
   - tokens approved
   - tokens locked
Deploying "Marketing and Strategic partnership" lock pool...
   - locking contract deployed at 0xCDFf462f408728743629a3Cb570194C7f6E29374
   - tokens approved
   - tokens locked
Deploying "Community & Game mining" lock pool...
   - locking contract deployed at 0x154616cFF414f0de18af310e46058e36D79fDa33
   - tokens approved
   - tokens locked
Deploying "Advisors" lock pool...
   - locking contract deployed at 0xeB99ED86A8130e0f8Cd09e281A4d13e38b67A4e9
   - tokens approved
   - tokens locked
Doing "Token Sale Contributors" instant transfer...
   - transaction mined, hash: 0x859d0d734e7a989b79c89e0f99702e99f22ba92c9671560e8ad46e71de0200f8
Doing "Liquidity Reserve" instant transfer...
   - transaction mined, hash: 0x3223382dd26dd3bc73f8e5e75e7e9956d94a62657d33cda18963324d63b6fd1d
```
Each of the addresses / transaction hashes visible in the above output can be checked on [Rinkeby Etherscan](https://rinkeby.etherscan.io/).

The transfers of the tokens to the appropriate locking contract and instant allocation addresses are shown well at this page: https://rinkeby.etherscan.io/token/0xc9a93bD0CE2e87fF128c343070BD4eb627D1119A

## GamerCoin token contract

GamerCoin token is a standard ERC20 token with the additional feature enabling owners to get rid of (burn) their own tokens.

The core ERC20 methods are described here: https://docs.openzeppelin.com/contracts/3.x/api/token/erc20#IERC20

Additional burning capabilities are described here: https://docs.openzeppelin.com/contracts/3.x/api/token/erc20#ERC20Burnable


## LockingContract

During deployment an instance of LockingContract is created per each allocation (`benefiaciary`). Only the beneficiary can release tokens later on.

### Locking tokens

The contract can be configured to lock tokens for a specified amount of time and release them according to a schedule similar to this one:
> Initial release after 1 year from locking, at start 10% then 5% every next month (18 months). Total lock duration: 2.5 years.

In contract's nomenclature, **cliff** is the 1-year period mentioned above. After this time (`cliffDuration`) a specified amount of tokens is unlocked (`cllifAmount`). Cliff is followed by a number of unlock **steps** of equal length (`stepDuration`). After each step a specified amount of tokens is unlocked (`stepAmount`). One can also specify the beginning of the locking period (`startTime`) from which cliff end time and step end times can be calculated. The above release schedule becomes:

> startTime = now (for instance)
> cliffDuration = 1 year
> cliffAmount = 10% of tokens locked
> numSteps = 18
> stepDuration = 1 month
> stepAmount = 5% of tokens locked


### Releasing tokens

Tokens are released by invoking `releaseTokens` method. It can be done on Etherscan using a browser with MetaMask extension installed. Go to the *Write Contract* section on the desired locking contract's page, click *Write* button next to the `releaseTokens` method and proceed with MetaMask. All tokens unlocked up until now will be transferred to the beneficiary address. Example contract: https://rinkeby.etherscan.io/address/0x39ce493b1ef62075bf191441928b296c5fc9aaf3#writeContract

### Reading contract state

Contract's internal state can be checked on it's Etherscan page in *Read Contract* section. Example contract: https://rinkeby.etherscan.io/address/0x39ce493b1ef62075bf191441928b296c5fc9aaf3#readContract

Meaning of the contract fields / getter methods:
* `_beneficiary` - the account that has the right to withdraw tokens
* `owner` - the deployer of the contract who locked the tokens in it
* `releasableAmount` - tokens that can currently be withdrawn from the contract
* `_releasedAmount` - tokens that have been withdrawn up until now
* `totalAmount` - the amount of tokens originally locked
* `unlockedAmount` - tokens that have been made releasable up until now
* `cliffUnlockTime` - cliff end time (timestamp in seconds)
* `stepUnlockTime(uint256 stepNumber)` - returns step end time (timestamp in seconds)
* `nextUnlockTime` - time of the next unlock event (timestamp in seconds)

Note that:
`releasableAmount` = `unlockedAmount` - `_releasedAmount`

# node version

I'm using:

```
$ node --version
v10.23.0
```

I was using v14.15.1, but `yarn` complained that it couldn't compile optional `scrypt` dependency (from the looks of it, interface in `include/node/node.h` has changed).

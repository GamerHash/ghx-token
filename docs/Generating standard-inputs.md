# Generating standard-input files
The standard input files are used to [verify a contract on Etherscan](https://etherscan.io/verifyContract). They only need to be regenarted after a change to the Solidity code.

Right now, Waffle does not include a tool to generate them and for the purpose of this project I created them in the following way:

### Preparation
1. Go to the root repository directory and install project dependencies
    ```bash
    cd ghx-token/
    yarn install
    ```
2. Open file `node_modules/@ethereum-waffle/compiler/dist/cjs/compileSolcjs.js` and in `compileSolcjs` function add the following line (53rd line of the file):

       ```diff
       function compileSolcjs(config) {
           return async function compile(sources) {
               const solc = await loadCompiler(config);
               const input = compilerInput_1.getCompilerInput(sources, config.compilerOptions, 'Solidity');
       +       require('fs').writeFileSync(require('path').join(process.cwd(), 'input.json'), input)
               const imports = findImports_1.findImports(sources);
               const output = solc.compile(input, { imports });
               return JSON.parse(output);
           };
       }
       ```

### Generation
1. First we will generate standard-input file for `GamerCoin` contract. In order to do this delete the other contract files: `Lockable.sol` and `LockingContract.sol` from `contracts/` directory.
2. Go to the root repository directory and run Waffle
    ```
    cd ghx-token/
    yarn waffle waffle-solcjs.json
    ```
3. This should generate a file named `input.json` in  the current working directory. This is a standard-input file for our contract.
4. In order to generate standard-input for `LockingContract` contract, repeat from step 1, but this time leave only `Lockable.sol` and `LockingContract.sol` in the `contracts/` directory.

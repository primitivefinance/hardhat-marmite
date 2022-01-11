import { Contract } from 'ethers';
import { task, types } from 'hardhat/config';

import runScript from './runner';
import marmite from './marmite';

task('golf:script', 'Runs a gas cost comparison using a script')
  .addPositionalParam('path', 'Path to the script')
  .setAction(async (args) => {
    await runScript(args.path);
  });

task('golf:contract', 'Runs a gas cost comparison using a contract')
  .addPositionalParam('contract', 'Name of the contract')
  .addOptionalParam('ctorParams', 'Constructor parameters', undefined, types.string)
  .addParam('func', 'Function to call')
  .addOptionalParam('params', 'Function parameters', undefined, types.string)
  .addOptionalParam('impls', 'Name of the implementations to compare', undefined, types.string)
  .setAction(async (args, hre) => {
    await marmite(hre, async (flag) => {
      const Factory = await hre.ethers.getContractFactory(args.contract);

      let contract: Contract;

      if (args.ctorParams !== undefined) {
        contract = await Factory.deploy(...args.ctorParams.split(','));
      } else {
        contract = await Factory.deploy();
      }

      let tx: any;

      if (args.params !== undefined) {
        tx = await contract[args.func](...args.params.split(','));
      } else {
        tx = await contract[args.func]();
      }

      await flag(args.func, tx);
    }, args.impls !== undefined ? args.impls.split(',') : []);
  });

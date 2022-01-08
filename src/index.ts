import { Contract } from 'ethers';
import { task, types } from 'hardhat/config';

import runScript from './runner';
import { marmite } from './utils';

task('golf:script', 'Runs a gas cost comparison using a script')
  .addPositionalParam('path', 'Path to the script')
  .setAction(async (args) => {
    await runScript(args.path);
  });

task('golf:contract', 'Runs a gas cost comparison on a contract')
  .addPositionalParam('contract', 'Name of the contract')
  .addOptionalParam('constructorParams', 'Constructor params', undefined, types.string)
  .addParam('func', 'Func to call')
  .addOptionalParam('params', 'params', undefined, types.string)
  .setAction(async (args, hre) => {
    await marmite(hre, ['Different-from', 'Greater-than'], async (flag) => {
      const Factory = await hre.ethers.getContractFactory(args.contract);

      let contract: Contract;

      if (args.constructorParams !== undefined) {
        contract = await Factory.deploy(...args.ctorparams.split(','));
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
    });
  });

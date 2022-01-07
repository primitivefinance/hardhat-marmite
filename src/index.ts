/* eslint-disable no-param-reassign, no-await-in-loop */

import fs from 'fs';
import path from 'path';
import { TASK_COMPILE } from 'hardhat/builtin-tasks/task-names';
import { task } from 'hardhat/config';
import fg from 'fast-glob';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import Table from 'cli-table3';
import colors from 'colors';
import { ContractTransaction } from 'ethers';
import { TransactionResponse } from '@ethersproject/abstract-provider';

import { ScriptFunction, GasReport } from './types';
import runScript from './runner';
import { checkMinOrMax } from './utils';

task('marmite', 'Run gas cost comparisons among different Solidity code snippets')
  .addParam('script', 'Path to the script to run')
  .setAction(async (args) => {
    await runScript(args.script);
  });

/**
 * Marmite context function
 * @param hre Hardhat global variable
 * @param implementations Array of implementations to compare
 * @param script Function deploying contracts and flagging transactions
 */
export default async function marmite(
  hre: HardhatRuntimeEnvironment,
  implementations: string[],
  script: ScriptFunction,
): Promise<void> {
  const entries = await fg('contracts/**/*.sol', {
    absolute: false,
    onlyFiles: true,
  });

  hre.config.paths.root = path.join(process.cwd(), '.gas');
  hre.config.paths.sources = path.join(process.cwd(), '.gas', 'contracts');
  hre.config.paths.artifacts = path.join(process.cwd(), '.gas', 'artifacts');
  hre.config.paths.cache = path.join(process.cwd(), '.gas', 'cache');

  const table = new Table({
    rowHeights: [3],
    rowAligns: ['center'],
    style: {
      'padding-left': 4,
      'padding-right': 4,
    },
    colAligns: ['center'],
  });

  const gasReport: GasReport = {};

  for (let i = 0; i < implementations.length; i += 1) {
    const currentImplementation = implementations[i];

    await fs.promises.rm('.gas', {
      recursive: true,
      force: true,
    });

    for (let j = 0; j < entries.length; j += 1) {
      const source = await fs.promises.readFile(entries[j], {
        encoding: 'utf-8',
      });

      const matches = source.match(/@start([\s\S]*?)@end/g) || [];
      let newSource: string = source;

      for (let k = 0; k < matches.length; k += 1) {
        if (matches[k].includes(currentImplementation) === false) {
          newSource = newSource.replace(matches[k], '');
        }
      }

      newSource = newSource.replace(`@start:${currentImplementation}`, '');
      newSource = newSource.replace('@end', '');

      await fs.promises.mkdir(path.join('.gas', path.dirname(entries[j])), {
        recursive: true,
      });

      await fs.promises.writeFile(path.join('.gas', entries[j]), newSource, {
        encoding: 'utf-8',
      });
    }

    await hre.run(TASK_COMPILE);

    await script(async (name: string, tx: ContractTransaction | TransactionResponse) => {
      const receipt = await tx.wait();
      if (gasReport[name] === undefined) gasReport[name] = [];
      gasReport[name].push(receipt.cumulativeGasUsed.toNumber());
    });
  }

  table.push(
    [
      '',
      {
        content: `🥘 ${'Implementations'.magenta.bold}`,
        colSpan: implementations.length,
        hAlign: 'center',
      },
    ],
    [
      { content: colors.bold('🚩 Flags'.blue), colSpan: 1 },
      ...implementations.map((impl) => colors.bold(impl.magenta)),
    ],
    [
      Object.keys(gasReport)[0].blue,
      ...gasReport[Object.keys(gasReport)[0]].map((gas) => checkMinOrMax(
        gasReport[Object.keys(gasReport)[0]],
        gas,
      )),
    ],
    ...Object.keys(gasReport).slice(1).map((flag) => [
      flag.blue,
      ...gasReport[flag].map((gas) => checkMinOrMax(gasReport[flag], gas)),
    ]),
  );

  console.log(table.toString());
  console.log(table);

  await fs.promises.rm('.gas', {
    recursive: true,
    force: true,
  });
}

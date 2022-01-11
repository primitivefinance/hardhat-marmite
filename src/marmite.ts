/* eslint-disable no-param-reassign, no-await-in-loop */
import fs from 'fs';
import path from 'path';
import { TASK_COMPILE } from 'hardhat/builtin-tasks/task-names';
import fg from 'fast-glob';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import Table from 'cli-table3';
import colors from 'colors';
import { ContractTransaction } from 'ethers';
import { TransactionResponse } from '@ethersproject/abstract-provider';

import { ScriptFunction, GasReport } from './types';
import { renderTable } from './utils';

/**
 * Marmite context function
 * @param hre Hardhat global variable
 * @param implementations Array of implementations to compare
 * @param script Function deploying contracts and flagging transactions
 */
export default async function marmite(
  hre: HardhatRuntimeEnvironment,
  script: ScriptFunction,
  implementations: string[] = [],
): Promise<void> {
  const entries = await fg('**/*.sol', {
    absolute: false,
    onlyFiles: true,
  });

  let foundImplementations: string[] = [];

  if (implementations.length === 0) {
    for (let i = 0; i < entries.length; i += 1) {
      const source = await fs.promises.readFile(entries[i], {
        encoding: 'utf-8',
      });

      const matches = source.match(/@start<([\s\S]*?)>/g) || [];
      const impls = matches.map((match) => match.replace('@start<', '').replace('>', ''));
      foundImplementations.push(...impls);
    }
  } else {
    foundImplementations = implementations;
  }

  const sources = path.relative(process.cwd(), hre.config.paths.sources);

  hre.config.paths.root = path.join(process.cwd(), '.gas');
  hre.config.paths.sources = path.join(process.cwd(), '.gas', sources);
  hre.config.paths.artifacts = path.join(process.cwd(), '.gas', 'artifacts');
  hre.config.paths.cache = path.join(process.cwd(), '.gas', 'cache');

  const gasReport: GasReport = {};

  for (let i = 0; i < foundImplementations.length; i += 1) {
    const currentImplementation = foundImplementations[i];

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

      newSource = newSource.replace(`@start<${currentImplementation}>`, '');
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

  const table = renderTable(gasReport, foundImplementations);

  console.log(
    '\nDisplaying the results for',
    `${Object.keys(gasReport).length} flag(s)`.blue,
    'with',
    `${foundImplementations.length} implementation(s):`.magenta,
    '\n',
  );

  console.log(table.toString());

  console.log('\n');

  await fs.promises.rm('.gas', {
    recursive: true,
    force: true,
  });
}

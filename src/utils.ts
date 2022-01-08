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

export function checkMinOrMax(values: number[], value: number): Table.Cell {
  if (Math.max(...values) === value) {
    return {
      content: colors.red(value.toString()),
    };
  }

  if (Math.min(...values) === value) {
    return {
      content: colors.green(value.toString()),
    };
  }

  return value.toString().dim;
}

/**
 * Marmite context function
 * @param hre Hardhat global variable
 * @param implementations Array of implementations to compare
 * @param script Function deploying contracts and flagging transactions
 */
export async function marmite(
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

  table.push(
    [
      '',
      {
        content: `🥘 ${'Implementations'.magenta.bold}`,
        colSpan: foundImplementations.length,
        hAlign: 'center',
      },
    ],
    [
      { content: colors.bold('🚩 Flags'.blue), colSpan: 1 },
      ...foundImplementations.map((impl) => colors.bold(impl.magenta)),
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

  await fs.promises.rm('.gas', {
    recursive: true,
    force: true,
  });
}

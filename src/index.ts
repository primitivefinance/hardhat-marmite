/* eslint-disable no-param-reassign, no-await-in-loop */

import fs from 'fs';
import path from 'path';
import { TASK_COMPILE } from 'hardhat/builtin-tasks/task-names';
import { task } from 'hardhat/config';
import fg from 'fast-glob';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { ContractTransaction } from 'ethers';
import Table from 'cli-table3';
import colors from 'colors';

import runScript from './runner';

type FlagFunction = (name: string, tx: ContractTransaction) => void;
type ScriptFunction = (flag: FlagFunction) => void;

task('marmite', 'Gas optimizoooor')
  .addParam('script', 'Script to run')
  .setAction(async (args) => {
    await runScript(args.script);
  });

type GasReport = {
  [key: string]: number[];
}

function checkMinOrMax(values: number[], value: number): Table.Cell {
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

export default async function marmite(
  hre: HardhatRuntimeEnvironment,
  recipes: string[],
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
    /* chars: {
      top: '-',
      'top-mid': '+',
      'top-left': '+',
      'top-right': '+',
      bottom: '-',
      'bottom-mid': '+',
      'bottom-left': '+',
      'bottom-right': '+',
      left: '|',
      'left-mid': '|',
      mid: '-',
      'mid-mid': '|',
      right: '|',
      'right-mid': '|',
      middle: '|',
    }, */
    rowHeights: [3],
    rowAligns: ['center'],
    style: {
      'padding-left': 4,
      'padding-right': 4,
      // compact: true,
    },
    colAligns: ['center'],
  });

  const gasReport: GasReport = {};

  for (let i = 0; i < recipes.length; i += 1) {
    const currentRecipe = recipes[i];

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
        if (matches[k].includes(currentRecipe) === false) {
          newSource = newSource.replace(matches[k], '');
        }
      }

      newSource = newSource.replace(`@start:${currentRecipe}`, '');
      newSource = newSource.replace('@end', '');

      await fs.promises.mkdir(path.join('.gas', path.dirname(entries[j])), {
        recursive: true,
      });

      await fs.promises.writeFile(path.join('.gas', entries[j]), newSource, {
        encoding: 'utf-8',
      });
    }

    await hre.run(TASK_COMPILE);

    await script(async (name: string, tx: ContractTransaction) => {
      const receipt = await tx.wait();
      if (gasReport[name] === undefined) gasReport[name] = [];
      gasReport[name].push(receipt.cumulativeGasUsed.toNumber());
    });
  }

  table.push(
    [
      '',
      {
        content: `🥘 ${'Recipes'.magenta.bold}`,
        colSpan: recipes.length,
        hAlign: 'center',
      },
    ],
    [
      { content: colors.bold('🚩 Flags'.blue), colSpan: 1 },
      ...recipes.map((recipe) => colors.bold(recipe.magenta)),
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

import Table from 'cli-table3';
import colors from 'colors';

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

const recipes = ['Foo', 'Bar', 'Yay', 'Nay'];
const gasReport: GasReport = {
  boop: [20, 21, 26, 23],
  beep: [20, 12, 32, 18],
  baap: [30, 21, 28, 17],
  buup: [33, 22, 18, 16],
};

const table = new Table({
  rowHeights: [3],
  rowAligns: ['center'],
  style: {
    'padding-left': 4,
    'padding-right': 4,
    compact: true,
  },
  colAligns: ['center'],
});

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
  ...Object.keys(gasReport).map((flag) => [
    flag.blue,
    ...gasReport[flag].map((gas) => checkMinOrMax(gasReport[flag], gas)),
  ]),
);

console.log(table.toString());

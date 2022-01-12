import colors from 'colors';

import { TableChars, GasReport } from './types';

export function checkMinOrMax(values: number[], value: number): string {
  if (Math.max(...values) === value) {
    return colors.red(value.toString());
  }

  if (Math.min(...values) === value) {
    return colors.green(value.toString());
  }

  return colors.dim(value.toString());
}

const defaultTableChars: TableChars = {
  leftTopCorner: '┌',
  rightTopCorner: '┐',
  rightBottomCorner: '┘',
  leftBottomCorner: '└',
  middle: '┼',
  bottomMiddle: '┴',
  leftMiddle: '├',
  rightMiddle: '┤',
  column: '│',
  line: '─',
};

export function renderTable(
  gasReport: GasReport,
  implementations: string[],
  padding: number = 4,
  tableChars: TableChars = defaultTableChars,
  implementationsTitle: string = ' 📝 Implementations ',
  flagsTitle: string = ' 🚩 Flags ',
): string {
  const flags = Object.keys(gasReport);
  let flagsColSize = flagsTitle.length + padding * 2;

  for (let i = 0; i < flags.length; i += 1) {
    const checkSize = flags[i].length + padding * 2;

    if (checkSize > flagsColSize) {
      flagsColSize = checkSize;
    }
  }

  let implementationsTitleColSize = implementationsTitle.length + padding * 2;
  const implementationsColSizes: {[key: number]: number} = {};

  for (let i = 0; i < implementations.length; i += 1) {
    const size = implementations[i].length + padding * 2;
    implementationsColSizes[i] = size;
  }

  for (let i = 0; i < flags.length; i += 1) {
    for (let j = 0; j < gasReport[flags[i]].length; j += 1) {
      const size = gasReport[flags[i]][j].toString().length + padding * 2;

      if (size > implementationsColSizes[j]) implementationsColSizes[j] = size;
    }
  }

  let checkSize = 0;

  for (let i = 0; i < implementations.length; i += 1) {
    checkSize += implementationsColSizes[i];
  }

  checkSize += implementations.length - 1;

  if (checkSize > implementationsTitleColSize) {
    implementationsTitleColSize = checkSize;
  }

  let output = ' '.repeat(flagsColSize + 1);
  output += tableChars.leftTopCorner;

  const titlePadding = implementationsTitleColSize - implementationsTitle.length;

  output += tableChars.line.repeat(titlePadding / 2);
  output += implementationsTitle;
  output += tableChars.line.repeat(Math.ceil(titlePadding / 2));
  output += tableChars.rightTopCorner;
  output += '\n';
  output += ' '.repeat(flagsColSize + 1);
  output += tableChars.column;

  for (let i = 0; i < implementations.length; i += 1) {
    output += ' '.repeat((implementationsColSizes[i] - implementations[i].length) / 2);
    output += implementations[i];
    output += ' '.repeat(Math.ceil((implementationsColSizes[i] - implementations[i].length) / 2));
    output += tableChars.column;
  }

  output += '\n';
  output += tableChars.leftTopCorner;
  output += tableChars.line.repeat((flagsColSize - flagsTitle.length) / 2);
  output += flagsTitle;
  output += tableChars.line.repeat(Math.ceil((flagsColSize - flagsTitle.length) / 2));
  output += tableChars.middle;

  for (let i = 0; i < implementations.length; i += 1) {
    output += tableChars.line.repeat(implementationsColSizes[i]);
    output += tableChars.middle;
  }

  output = output.slice(0, -1);
  output += tableChars.rightMiddle;
  output += '\n';

  for (let i = 0; i < flags.length; i += 1) {
    const flagsPadding = flagsColSize - flags[i].length;

    output += tableChars.column;
    output += ' '.repeat(flagsPadding / 2);
    output += flags[i];
    output += ' '.repeat(Math.ceil(flagsPadding / 2));
    output += tableChars.column;

    for (let j = 0; j < implementations.length; j += 1) {
      const colPadding = implementationsColSizes[j] - gasReport[flags[i]][j].toString().length;

      output += ' '.repeat(colPadding / 2);
      output += checkMinOrMax(gasReport[flags[i]], gasReport[flags[i]][j]);
      output += ' '.repeat(Math.ceil(colPadding / 2));
      output += tableChars.column;
    }

    output += '\n';
  }

  output += tableChars.leftBottomCorner;
  output += tableChars.line.repeat(flagsColSize);
  output += tableChars.bottomMiddle;

  for (let i = 0; i < implementations.length; i += 1) {
    output += tableChars.line.repeat(implementationsColSizes[i]);
    output += tableChars.bottomMiddle;
  }

  output = output.slice(0, -1);
  output += tableChars.rightBottomCorner;

  return output;
}

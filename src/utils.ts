/* eslint-disable import/prefer-default-export */
import Table from 'cli-table3';
import colors from 'colors';

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

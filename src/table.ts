import { GasReport } from './types';
import { checkMinOrMax } from './utils';

const gasReport: GasReport = {
  beep: [21000, 22000, 20000],
  boop: [21000, 22000, 26000],
  fab: [21000, 22005, 24253],
};

console.log('\n');
console.log(renderTable(gasReport, ['Greater-than', 'Different-from', 'Foo-from']));
console.log('\n');

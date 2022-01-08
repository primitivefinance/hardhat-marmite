/* eslint-disable import/prefer-default-export */
import hre, { ethers } from 'hardhat';

import { marmite } from '../../src/utils';

async function main() {
  await marmite(hre, ['Different-from', 'Greater-than'], async (flag) => {
    const Foo = await ethers.getContractFactory('Foo');
    const foo = await Foo.deploy();

    const tx = await foo.set(42);
    await flag('set', tx);
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

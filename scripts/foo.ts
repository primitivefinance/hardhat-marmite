/* eslint-disable import/prefer-default-export */
import hre, { ethers } from 'hardhat';
import { ContractTransaction } from 'ethers';

import marmite from '../src';

async function main() {
  await marmite(hre, ['Foo', 'Bar', 'Beep', 'Yay'], async (flag) => {
    const Foo = await ethers.getContractFactory('Foo');
    const foo = await Foo.deploy();
    await foo.deployed();

    const tx = await foo.boop(42) as ContractTransaction;
    await flag('boop', tx);
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

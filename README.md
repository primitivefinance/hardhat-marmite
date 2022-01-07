# 🥘 Marmite

![version](https://img.shields.io/npm/v/@primitivefi/hardhat-marmite) ![npm](https://img.shields.io/npm/dt/@primitivefi/hardhat-marmite) ![license](https://img.shields.io/npm/l/@primitivefi/hardhat-marmite)

Flexible Hardhat plugin to run gas cost comparisons among different Solidity code snippets.

- 📊 Compare snippets of code directly in your contracts
- ✅ Compatible with any Solidity versions
- 🔍 Supports function calls and contract deployments
- 💯 Accurate gas cost (based on preprocessing)

**PUT LIVE EXAMPLE HERE**

## 📦 Installation

First thing to do is to install the plugin in your Hardhat project:

```bash
# Using yarn
yarn add @primitivefi/hardhat-marmite

# Or using npm
npm i @primitivefi/hardhat-marmite
```

Next step is simply to include the plugin into your `hardhat.config.js` or `hardhat.config.ts` file:

```typescript
// Using JavaScript
require('@primitivefi/hardhat-marmite');

// Using ES6 or TypeScript
import '@primitivefi/hardhat-marmite';
```

## ⛽️ Usage

Marmite is extremely simple to use and only requires you to perform a couple of steps:
- Write your different Solidity implementations
- Create a script to deploy your contracts
- Tell the plugin what it should compare

### 📝 Solidity Implementations

"Implementations" are referring to the snippets of Solidity code that you want to compare. They are declared using the following tags `@start:Name-of-your-implementation` and `@end`.

Let's say that you want to know if it's cheaper to check if a variable is "different from 0" or "higher than 0", inside of your Solidity contract, you can write:

```solidity
// SPDX-License-Identifier: WTFPL
pragma solidity 0.8.9;

contract Foo {
    uint256 public bar;

    function set(uint256 newBar) external {
        // Declaring our first implementation
        @start:Different-from
        if (newBar != 0) {
            bar = newBar;
        }
        @end

        // Declaring our second implementation
        @start:Greater-than
        if (newBar > 0) {
            bar = newBar;
        }
        @end
    }
}
```

### 🚩 Deployment and flagging

The last step is simply to write your deployment script and to tell Marmite what it should compare. You can do that by:
- Creating a new JavaScript or TypeScript file
- Import the `marmite` context function from the `@primitivefi/hardhat-marmite` package
- Pass to the function the global Hardhat `hre` object, the name of your different implementations in an array and a function deploying your contracts
- Last step is to use the `flag` function to signal the transactions you want to Marmite to track measure

```typescript
import hre, { ethers } from 'hardhat';
import { ContractTransaction } from 'ethers';

// Imports the `marmite` context function
import marmite from '@primitivefi/hardhat-marmite';

async function main() {
  await marmite(
      // Passes the global `hre` Hardhat object to Marmite
      hre,
      // Declares your different implementations
      ['Different-from', 'Greater-than'],
      // Deployment function
      async (flag) => {
        // Deploys the contract `Foo`
        const Foo = await ethers.getContractFactory('Foo');
        const foo = await Foo.deploy();

        // Calls the function `set` from the `Foo` contract
        const tx = await foo.set(42) as ContractTransaction;

        // Flags the transaction
        await flag('set', tx);
      },
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

### 📊 Results

Now that everything is set up, you can run Marmite in your terminal with:

```bash
npx hardhat marmite --script ./yourScript.js
```

Marmite will then compile your contracts, deploy them and measure your flagged transactions using all your different implementations. Once finished, you'll get the following table with the results:

![Results](https://i.imgur.com/YMlQcVF.png)

## ⛑ Help

Feel free to open an issue if you need help or if you encounter a problem! Here are some already known problems though:
- Naming a flag `constructor` might create a JavaScript issue, thus avoid writing `await flag('constructor', tx);` for now
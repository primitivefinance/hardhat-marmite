import { ContractTransaction } from 'ethers';
import { TransactionResponse } from '@ethersproject/abstract-provider';

export type FlagFunction = (name: string, tx: ContractTransaction | TransactionResponse) => void;

export type ScriptFunction = (flag: FlagFunction) => void;

export type GasReport = {
  [key: string]: number[];
}

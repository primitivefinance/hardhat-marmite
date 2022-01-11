import { ContractTransaction } from 'ethers';
import { TransactionResponse } from '@ethersproject/abstract-provider';

export type FlagFunction = (name: string, tx: ContractTransaction | TransactionResponse) => void;

export type ScriptFunction = (flag: FlagFunction) => void;

export type GasReport = {
  [key: string]: number[];
}

export type TableChars = {
  leftTopCorner: string;
  rightTopCorner: string;
  rightBottomCorner: string;
  leftBottomCorner: string;
  middle: string;
  bottomMiddle: string;
  leftMiddle: string;
  rightMiddle: string;
  column: string;
  line: string;
};

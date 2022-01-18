import { ContractTransaction } from 'ethers';
import { TransactionResponse } from '@ethersproject/abstract-provider';

/**
 * Flags a transaction
 * @param name Name of the flag
 * @param tx Transaction to flag
 */
export type FlagFunction = (name: string, tx: ContractTransaction | TransactionResponse) => Promise<void>;

export type CallbackFunction = (flag: FlagFunction) => Promise<void>;

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

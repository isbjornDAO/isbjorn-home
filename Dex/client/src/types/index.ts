import BN from "bn.js";

export type Account = {
  address: string | null;
  name: string | null;
  balances: { [address: string]: BN };
  deposits: { [address: string]: BN };
  allowances: { [address: string]: BN };
};

export type Token = {
  address: string;
  name: string;
  ticker: string;
  imgUrl: string;
  decimals: number;
  rank: string;
};

export type LPToken = {
  token: string;
  addresses: string[];
};

import BN from "bn.js";

export type Account = {
  address: string | null;
  name: string | null;
  balances: { [address: string]: BN };
};

export type Token = {
  address: string;
  name: string;
  ticker: string;
  imgUrl: string;
  decimals: number;
  rank: string;
};

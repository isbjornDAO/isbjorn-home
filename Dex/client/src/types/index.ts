export type Account = {
  address: string | null;
  name: string | null;
};

export type Token = {
  address: string;
  name: string;
  ticker: string;
  imgUrl: string;
  decimals: number;
  rank: string;
};

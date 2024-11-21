import { Token } from "@/types";

export const main_site_url = "https://isbjorn.co.nz/";

export const isbjorn_head_logo_url =
  "https://cdn.prod.website-files.com/61b2c2eb638aa348792d99d4/61b2dc99fa55b6632e77070b_Isbjorn%20PNG%20(3).png";

export const isbjorn_head_w_text_logo_url =
  "https://cdn.prod.website-files.com/61b2c2eb638aa348792d99d4/61b2dcbcac4228310e9fda70_Isbjorn%20PNG%20(5)-p-500.png";

export const sample_token_list: { [address: string]: Token } = {
  "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7": {
    address: "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
    name: "Wrapped AVAX",
    ticker: "WAVAX",
    imgUrl:
      "https://static.debank.com/image/avax_token/logo_url/0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7/753d82f0137617110f8dec56309b4065.png",
    decimals: 18,
    rank: "1",
  },
  "0xc970D70234895dD6033f984Fd00909623C666e66": {
    address: "0xc970D70234895dD6033f984Fd00909623C666e66",
    name: "Quasi",
    ticker: "QUASI",
    imgUrl:
      "https://static.debank.com/image/avax_token/logo_url/0xc970d70234895dd6033f984fd00909623c666e66/2f944911078af60e4dd571995986ba1c.png",
    decimals: 18,
    rank: "2",
  },
  "0x152b9d0FdC40C096757F570A51E494bd4b943E50": {
    address: "0x152b9d0FdC40C096757F570A51E494bd4b943E50",
    name: "Avalanche Bridged Bitcoin",
    ticker: "BTC.b",
    imgUrl:
      "https://static.debank.com/image/avax_token/logo_url/0x152b9d0fdc40c096757f570a51e494bd4b943e50/2411fb147c1cc4328edff5d204f09f80.png",
    decimals: 8,
    rank: "3",
  },
};

export const WAVAX_ADDRESS = "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7";
export const QUASI_ADDRESS = "0xc970D70234895dD6033f984Fd00909623C666e66";

export const avvy_resolver_addr = "0xBf49Da93bE8879A912838B1457922A78a81D6ee3";

export const avvy_resolver_abi = [
  {
    inputs: [
      {
        internalType: "contractContractRegistryInterface",
        name: "_contractRegistry",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "contractRegistry",
    outputs: [
      {
        internalType: "contractContractRegistryInterface",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "string", name: "name", type: "string" },
      { internalType: "string", name: "key", type: "string" },
    ],
    name: "resolve",
    outputs: [{ internalType: "string", name: "value", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "string", name: "name", type: "string" },
      { internalType: "uint256", name: "key", type: "uint256" },
    ],
    name: "resolveStandard",
    outputs: [{ internalType: "string", name: "value", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "addy", type: "address" }],
    name: "reverseResolveEVMToName",
    outputs: [{ internalType: "string", name: "preimage", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "string", name: "value", type: "string" },
      { internalType: "uint256", name: "key", type: "uint256" },
    ],
    name: "reverseResolveToName",
    outputs: [{ internalType: "string", name: "preimage", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
];

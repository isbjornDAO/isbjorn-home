import Web3 from "web3";
import BN from "bn.js";

import { useAccountConnect } from "@/lib/react-query/queriesAndMutations";
import { INITIAL_ACCOUNT, useUserContext } from "@/context/AuthContext";
import { useEffect } from "react";
import { Account } from "@/types";
import { getCookie, isAddress, setCookie, sqrtBN } from "../utils";
import {
  avvy_resolver_abi,
  avvy_resolver_addr,
  chain_id,
  erc20_abi,
  factory_abi,
  Factory_address,
  ice_pond_abi,
  pair_abi,
  router_abi,
  Router_address,
  wavax_abi,
  WAVAX_ADDRESS,
} from "@/constants";

export const initializeWeb3 = async () => {
  let provider: any;

  if (window.ethereum) {
    provider = window.ethereum;
    await provider.request({ method: "eth_requestAccounts" });
  } else {
    throw new Error("No wallet provider.");
  }
  window.w3 = new Web3(provider);
  window.avvyW3 = new Web3("https://avalanche-c-chain-rpc.publicnode.com");
};

export const connectWallet = async (): Promise<string | null> => {
  let account = null;
  let provider;
  try {
    if (window.ethereum) {
      provider = window.ethereum;
      await provider.request({ method: "eth_requestAccounts" });
    } else {
      throw new Error("No wallet provider.");
    }

    window.w3 = new Web3(provider);

    const accounts: string[] = await window.w3.eth.getAccounts();
    account = accounts[0];

    console.log(`Selected account is ${account}`);
  } catch (error) {
    console.error("Failed to connect wallet:", error);
  }
  return account;
};

export const cacheAccount = (account: Account) => {
  const cachedAccountsStr = getCookie("cachedAccounts");
  const cachedAccounts = cachedAccountsStr ? JSON.parse(cachedAccountsStr) : {};

  cachedAccounts[account.address!.toLowerCase()] = account;

  setCookie("cachedAccounts", JSON.stringify(cachedAccounts), 30); // Store for 30 days
};

export const getCachedAccount = (address: string): Account | null => {
  const cachedAccountsStr = getCookie("cachedAccounts");
  if (!cachedAccountsStr) return null;

  const cachedAccounts = JSON.parse(cachedAccountsStr);
  const cachedAccount = cachedAccounts[address.toLowerCase()] || null;

  if (cachedAccount && cachedAccount.address) {
    // Convert hex strings in balances back to BN objects
    const convertedBalances = Object.entries(cachedAccount.balances).reduce(
      (acc, [tokenAddress, balance]) => {
        if (typeof balance !== "string") {
          console.warn(
            `Unexpected balance format for ${tokenAddress}:`,
            balance
          );
          return acc; // Skip invalid balance
        }
        return {
          ...acc,
          [tokenAddress]: new BN(balance, 16), // Convert valid balance string to BN
        };
      },
      {} as { [key: string]: BN }
    );

    return {
      ...cachedAccount,
      balances: convertedBalances,
    };
  }
  return null;
};

export const removeCachedAccount = (address: string) => {
  const cachedAccountsStr = getCookie("cachedAccounts");
  if (!cachedAccountsStr) return;

  const cachedAccounts = JSON.parse(cachedAccountsStr);

  delete cachedAccounts[address.toLowerCase()];

  setCookie("cachedAccounts", JSON.stringify(cachedAccounts), 30); // Store for 30 days
};

export const getDomainName = async (
  address: string
): Promise<string | null> => {
  let domainName: string | null = null;
  try {
    if (!isAddress(address)) {
      throw new Error(`${address} is not a valid EVM address`);
    }
    const avvyResolverContract = new window.avvyW3.eth.Contract(
      avvy_resolver_abi,
      avvy_resolver_addr
    );

    const result = await avvyResolverContract.methods
      .reverseResolveEVMToName(address)
      .call();
    if (result) {
      domainName = result.toString();
    }
  } catch (error) {
    console.log(`Error fetching domain name for ${address}: `, error);
  }
  return domainName;
};

export const useHandleConnectWallet = () => {
  const { setAccount, setIsConnected, currentChainId, switchNetwork } =
    useUserContext();
  const { mutateAsync: connectUser, isLoading: isWalletLoading } =
    useAccountConnect();

  const handleConnectWallet = async () => {
    try {
      if (!window.w3) {
        let provider: any;
        if (window.ethereum) {
          provider = window.ethereum;
          await provider.request({ method: "eth_requestAccounts" });
        } else {
          throw new Error("No wallet provider.");
        }

        window.w3 = new Web3(provider);
      }
      const accounts: string[] = await window.w3.eth.getAccounts();
      const address = accounts[0];

      if (!address) {
        console.error("Failed to connect wallet: No address found");
        return;
      }

      const cachedAccount = getCachedAccount(address);
      if (cachedAccount) {
        setAccount(cachedAccount);
        setIsConnected(true);
        switchNetwork(chain_id);
      }

      const connectedAddress = await connectUser();
      if (connectedAddress) {
        const domainName = await getDomainName(connectedAddress);
        setIsConnected(true);
        setAccount({
          address: connectedAddress,
          name: domainName,
          balances: {},
        });

        cacheAccount({
          address: connectedAddress,
          name: domainName,
          balances: {},
        });

        switchNetwork(chain_id);
      }
    } catch (err) {
      console.error("Failed to connect wallet:", err);
    }
  };

  useEffect(() => {
    if (window.ethereum?.on) {
      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);
    }

    return () => {
      if (window.ethereum?.removeListener) {
        window.ethereum.removeListener(
          "accountsChanged",
          handleAccountsChanged
        );
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      }
    };
  }, []);

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      console.log("Please connect to a wallet.");
      setAccount(INITIAL_ACCOUNT);
      setIsConnected(false);
    } else {
      handleConnectWallet();
    }
  };

  const handleChainChanged = (chainId: string) => {
    console.log(`Chain changed to ${parseInt(chainId)}`);
  };

  return { handleConnectWallet, isWalletLoading };
};

export const getERC20Balance = async (
  accountAddress: string,
  tokenAddress: string
): Promise<BN | null> => {
  let balance: BN | null = null;
  try {
    if (tokenAddress.toLowerCase() === "0xAVAX".toLowerCase()) {
      let result = await window.w3.eth.getBalance(accountAddress);
      if (result || (result as unknown as bigint) === 0n) {
        balance = new BN((result as unknown).toString());
      }
    } else {
      const contract = new window.w3.eth.Contract(erc20_abi, tokenAddress);
      let result = await contract.methods.balanceOf(accountAddress).call();
      if (result || (result as unknown as bigint) === 0n) {
        balance = new BN((result as unknown).toString());
      }
    }
  } catch (error) {
    console.log(error);
  }
  return balance;
};

export const getERC20Allowance = async (
  accountAddress: string,
  spenderAddress: string,
  tokenAddress: string
): Promise<BN | null> => {
  let allowance: BN | null = null;
  try {
    const contract = new window.w3.eth.Contract(erc20_abi, tokenAddress);
    let result = await contract.methods
      .allowance(accountAddress, spenderAddress)
      .call();
    if (result) {
      allowance = new BN(result.toString());
    }
  } catch (error) {
    console.log(error);
  }
  return allowance;
};

export const approveERC20Amount = async (
  accountAddress: string,
  spenderAddress: string,
  tokenAddress: string,
  amount: BN
): Promise<{
  success: boolean;
  txHash?: string;
  error?: unknown;
}> => {
  try {
    const contract = new window.w3.eth.Contract(erc20_abi, tokenAddress);
    const data = await contract.methods
      .approve(spenderAddress, amount.toString())
      .encodeABI();

    const txParams = {
      to: tokenAddress,
      from: accountAddress,
      data: data,
    };
    console.log(txParams);

    const txHash = await window.ethereum?.request({
      method: "eth_sendTransaction",
      params: [txParams],
    });

    const receipt = await waitForTransactionReceipt(txHash);

    if (receipt && receipt.status) {
      console.log("Transaction successful:", receipt);
      return { success: true, txHash };
    } else {
      console.error("Transaction failed:", receipt);
      return { success: false, txHash };
    }
  } catch (error) {
    console.log(error);
    return { success: false, error: error };
  }
};

export const getPairAddress = async (
  token0Address: string,
  token1Address: string
): Promise<string | null> => {
  await initializeWeb3();
  let pairAddress: string | null = null;
  try {
    const contract = new window.w3.eth.Contract(factory_abi, Factory_address);
    let result = await contract.methods
      .getPair(
        token0Address === "0xAVAX" ? WAVAX_ADDRESS : token0Address,
        token1Address === "0xAVAX" ? WAVAX_ADDRESS : token1Address
      )
      .call();
    if (result) {
      pairAddress = result.toString();
    }
  } catch (error) {
    console.log(error);
  }
  return pairAddress;
};

export const getAmountOut = async (
  tokenInAddress: string,
  tokenOutAddress: string,
  tokenInAmount: BN
): Promise<BN | null> => {
  let amountOut: BN | null = null;
  const tokens = [tokenInAddress, tokenOutAddress].sort((a, b) =>
    a.toLowerCase().localeCompare(b.toLowerCase())
  );
  try {
    const factoryContract = new window.w3.eth.Contract(
      factory_abi,
      Factory_address
    );
    const pairContractAddress = await factoryContract.methods
      .getPair(tokenInAddress, tokenOutAddress)
      .call();
    let pairAddress;
    if (pairContractAddress) {
      pairAddress = pairContractAddress.toString();
    } else {
      throw new Error("Error: getAmountOut() could not retrive pair address!");
    }
    const pairContract = new window.w3.eth.Contract(pair_abi, pairAddress);

    const reserveResult = await pairContract.methods.getReserves().call();
    let reserve0: BN, reserve1: BN, last: number;
    if (reserveResult) {
      reserve0 = new BN(reserveResult[0]);
      reserve1 = new BN(reserveResult[1]);
      last = Number(reserveResult[2]);
    } else {
      throw new Error("Error: getAmountOut() could not retrive pair reserves!");
    }
    let reserveIn: BN, reserveOut: BN;
    if (tokens[0].toLowerCase() === tokenInAddress.toLowerCase()) {
      reserveIn = reserve0;
      reserveOut = reserve1;
    } else {
      reserveIn = reserve1;
      reserveOut = reserve0;
    }
    const routerContract = new window.w3.eth.Contract(
      router_abi,
      Router_address
    );
    const quoteResult = await routerContract.methods
      .getAmountOut(
        tokenInAmount.toString(),
        reserveIn.toString(),
        reserveOut.toString()
      )
      .call();
    if (quoteResult) {
      amountOut = new BN(quoteResult.toString())
        .mul(new BN(996))
        .div(new BN(1000)); //adjust for 0.4% fee
    } else {
      throw new Error("Error: getAmountOut() could not retrive quote!");
    }
  } catch (error) {
    console.log(error);
  }
  return amountOut;
};

export const getAmountIn = async (
  tokenInAddress: string,
  tokenOutAddress: string,
  tokenOutAmount: BN
): Promise<BN | null> => {
  let amountIn: BN | null = null;
  const tokens = [tokenInAddress, tokenOutAddress].sort((a, b) =>
    a.toLowerCase().localeCompare(b.toLowerCase())
  );
  try {
    const factoryContract = new window.w3.eth.Contract(
      factory_abi,
      Factory_address
    );
    const pairContractAddress = await factoryContract.methods
      .getPair(tokenInAddress, tokenOutAddress)
      .call();
    let pairAddress;
    if (pairContractAddress) {
      pairAddress = pairContractAddress.toString();
    } else {
      throw new Error("Error: getAmountOut() could not retrive pair address!");
    }
    const pairContract = new window.w3.eth.Contract(pair_abi, pairAddress);

    const reserveResult = await pairContract.methods.getReserves().call();
    let reserve0: BN, reserve1: BN, last: number;
    if (reserveResult) {
      reserve0 = new BN(reserveResult[0]);
      reserve1 = new BN(reserveResult[1]);
      last = Number(reserveResult[2]);
    } else {
      throw new Error("Error: getAmountOut() could not retrive pair reserves!");
    }
    let reserveIn: BN, reserveOut: BN;
    if (tokens[0].toLowerCase() === tokenInAddress.toLowerCase()) {
      reserveIn = reserve0;
      reserveOut = reserve1;
    } else {
      reserveIn = reserve1;
      reserveOut = reserve0;
    }
    const routerContract = new window.w3.eth.Contract(
      router_abi,
      Router_address
    );
    const quoteResult = await routerContract.methods
      .getAmountIn(
        tokenOutAmount.toString(),
        reserveIn.toString(),
        reserveOut.toString()
      )
      .call();
    if (quoteResult) {
      amountIn = new BN(quoteResult.toString())
        .mul(new BN(996))
        .div(new BN(1000)); //adjust for 0.4% fee
    } else {
      throw new Error("Error: getAmountOut() could not retrive quote!");
    }
  } catch (error) {
    console.log(error);
  }
  console.log(amountIn);
  return amountIn;
};

export const waitForTransactionReceipt = async (
  txHash: string,
  initialDelay: number = 5000,
  pollingInterval: number = 2500,
  maxRetries: number = 10 // Add a maxRetries parameter to limit the number of retries
): Promise<any> => {
  console.log(
    `Waiting for ${initialDelay / 1000} seconds before polling for receipt...`
  );
  await new Promise((resolve) => setTimeout(resolve, initialDelay));

  let receipt = null;
  let attempt = 0;

  while (receipt === null && attempt < maxRetries) {
    try {
      receipt = await window.w3.eth.getTransactionReceipt(txHash);
      if (receipt === null) {
        console.log(
          `Waiting for transaction to be mined... Attempt ${attempt + 1}`
        );
        attempt++;
        await new Promise((resolve) => setTimeout(resolve, pollingInterval)); // Wait before checking again
      }
    } catch (error) {
      console.error(
        `Error fetching transaction receipt: ${error}. Retrying... (${
          attempt + 1
        }/${maxRetries})`
      );
      attempt++;
      await new Promise((resolve) => setTimeout(resolve, pollingInterval)); // Wait before retrying
    }
  }

  if (receipt === null && attempt >= maxRetries) {
    throw new Error(
      `Failed to retrieve transaction receipt after ${maxRetries} attempts.`
    );
  }

  return receipt;
};

export const createSwapTransaction = async (
  accountAddress: string,
  tokenInAddress: string,
  tokenOutAddress: string,
  isFromExact: boolean,
  amountIn: BN,
  amountOut: BN,
  slippage: number
): Promise<{
  success: boolean;
  txHash?: string;
  error?: unknown;
}> => {
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const deadline = currentTimestamp + 300;
  let data, amountInMax;
  try {
    const contract = new window.w3.eth.Contract(router_abi, Router_address);
    console.log(isFromExact);
    if (isFromExact) {
      const amountOutMin = amountOut
        .mul(new BN(100 - slippage))
        .div(new BN(100));
      console.log(amountIn.toString());
      console.log(amountOutMin.toString());
      if (tokenInAddress === "0xAVAX") {
        data = await contract.methods
          .swapExactAVAXForTokens(
            amountOutMin.toString(),
            [WAVAX_ADDRESS.toString(), tokenOutAddress],
            accountAddress,
            deadline
          )
          .encodeABI();
      } else if (tokenOutAddress === "0xAVAX") {
        data = await contract.methods
          .swapExactTokensForAVAX(
            amountIn.toString(),
            0,
            [tokenInAddress, WAVAX_ADDRESS.toString()],
            accountAddress,
            deadline
          )
          .encodeABI();
      } else {
        data = await contract.methods
          .swapExactTokensForTokens(
            amountIn.toString(),
            amountOutMin.toString(),
            [tokenInAddress, tokenOutAddress],
            accountAddress,
            deadline
          )
          .encodeABI();
      }
    } else {
      // to amount exact
      amountInMax = amountIn.mul(new BN(100 + slippage)).div(new BN(100));
      console.log(amountOut.toString());
      console.log(amountInMax.toString());
      if (tokenInAddress === "0xAVAX") {
        data = await contract.methods
          .swapAVAXForExactTokens(
            amountOut.toString(),
            [WAVAX_ADDRESS.toString(), tokenOutAddress],
            accountAddress,
            deadline
          )
          .encodeABI();
      } else if (tokenOutAddress === "0xAVAX") {
        data = await contract.methods
          .swapTokensForExactAVAX(
            amountOut.toString(),
            amountInMax.toString(),
            [tokenInAddress, WAVAX_ADDRESS.toString()],
            accountAddress,
            deadline
          )
          .encodeABI();
      } else {
        data = await contract.methods
          .swapTokensForExactTokens(
            amountOut.toString(),
            amountInMax.toString(),
            [tokenInAddress, tokenOutAddress],
            accountAddress,
            deadline
          )
          .encodeABI();
      }
    }

    const txParams =
      tokenInAddress === "0xAVAX"
        ? {
            to: Router_address,
            from: accountAddress,
            data,
            value: isFromExact
              ? amountIn.toString(16)
              : amountInMax.toString(16),
          }
        : {
            to: Router_address,
            from: accountAddress,
            data,
          };
    console.log(txParams);

    const txHash = await window.ethereum?.request({
      method: "eth_sendTransaction",
      params: [txParams],
    });

    const receipt = await waitForTransactionReceipt(txHash);

    if (receipt && receipt.status) {
      console.log("Transaction successful:", receipt);
      return { success: true, txHash };
    } else {
      console.error("Transaction failed:", receipt);
      return { success: false, txHash };
    }
  } catch (error) {
    console.log(error);
    return { success: false, error: error };
  }
};

const createAddLiquidityTransaction = async (
  accountAddress: string,
  token0Address: string,
  token1Address: string,
  amount0: BN,
  amount1: BN,
  slippage: number
): Promise<{
  success: boolean;
  txHash?: string;
  error?: unknown;
}> => {
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const deadline = currentTimestamp + 300;
  const minAmount0 = amount0.mul(new BN(100 - slippage)).div(new BN(100));
  const minAmount1 = amount1.mul(new BN(100 - slippage)).div(new BN(100));
  let data;
  try {
    const contract = new window.w3.eth.Contract(router_abi, Router_address);

    if (token0Address === "0xAVAX") {
      data = contract.methods
        .addLiquidityAVAX(
          token1Address,
          amount1,
          minAmount1,
          minAmount0,
          accountAddress,
          deadline
        )
        .encodeABI();
    } else if (token1Address === "0xAVAX") {
      data = contract.methods
        .addLiquidityAVAX(
          token0Address,
          amount0,
          minAmount0,
          minAmount1,
          accountAddress,
          deadline
        )
        .encodeABI();
    } else {
      data = contract.methods
        .addLiquidity(
          token0Address,
          token1Address,
          amount0,
          amount1,
          minAmount0,
          minAmount1,
          accountAddress,
          deadline
        )
        .encodeABI();
    }

    const txParams =
      token0Address === "0xAVAX"
        ? {
            to: Router_address,
            from: accountAddress,
            data,
            value: amount0.toString(16),
          }
        : token1Address === "0xAVAX"
        ? {
            to: Router_address,
            from: accountAddress,
            data,
            value: amount1.toString(16),
          }
        : {
            to: Router_address,
            from: accountAddress,
            data,
          };
    console.log(txParams);

    const txHash = await window.ethereum?.request({
      method: "eth_sendTransaction",
      params: [txParams],
    });

    const receipt = await waitForTransactionReceipt(txHash);

    if (receipt && receipt.status) {
      console.log("Transaction successful:", receipt);
      return { success: true, txHash };
    } else {
      console.error("Transaction failed:", receipt);
      return { success: false, txHash };
    }
  } catch (error) {
    console.log(error);
    return { success: false, error: error };
  }
};

export const createRemoveLiquidityTransaction = async (
  accountAddress: string,
  token0Address: string,
  token1Address: string,
  liquidity: BN,
  amount0: BN,
  amount1: BN,
  slippage: number
): Promise<{
  success: boolean;
  txHash?: string;
  error?: unknown;
}> => {
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const deadline = currentTimestamp + 300;
  const minAmount0 = amount0.mul(new BN(100 - slippage)).div(new BN(100));
  const minAmount1 = amount1.mul(new BN(100 - slippage)).div(new BN(100));
  let data;
  try {
    const contract = new window.w3.eth.Contract(router_abi, Router_address);

    if (token0Address === "0xAVAX") {
      console.log(token1Address);
      data = contract.methods
        .removeLiquidityAVAX(
          token1Address,
          liquidity.toString(),
          minAmount1.toString(),
          minAmount0.toString(),
          accountAddress,
          deadline
        )
        .encodeABI();
    } else if (token1Address === "0xAVAX") {
      console.log(token0Address);
      data = contract.methods
        .removeLiquidityAVAX(
          token0Address,
          liquidity.toString(),
          minAmount0.toString(),
          minAmount1.toString(),
          accountAddress,
          deadline
        )
        .encodeABI();
    } else {
      data = contract.methods
        .removeLiquidity(
          token0Address,
          token1Address,
          liquidity.toString(),
          minAmount0.toString(),
          minAmount1.toString(),
          accountAddress,
          deadline
        )
        .encodeABI();
    }

    const txParams = {
      to: Router_address,
      from: accountAddress,
      data,
    };
    console.log(txParams);

    const txHash = await window.ethereum?.request({
      method: "eth_sendTransaction",
      params: [txParams],
    });

    const receipt = await waitForTransactionReceipt(txHash);

    if (receipt && receipt.status) {
      console.log("Transaction successful:", receipt);
      return { success: true, txHash };
    } else {
      console.error("Transaction failed:", receipt);
      return { success: false, txHash };
    }
  } catch (error) {
    console.log(error);
    return { success: false, error: error };
  }
};

export const createWrapAvaxTransaction = async (
  accountAddress: string,
  amount: BN
): Promise<{
  success: boolean;
  txHash?: string;
  error?: unknown;
}> => {
  try {
    const contract = new window.w3.eth.Contract(wavax_abi, WAVAX_ADDRESS);

    const data = contract.methods.deposit().encodeABI();

    const txParams = {
      to: WAVAX_ADDRESS,
      from: accountAddress,
      data,
      value: amount.toString(16),
    };
    console.log(txParams);

    const txHash = await window.ethereum?.request({
      method: "eth_sendTransaction",
      params: [txParams],
    });

    const receipt = await waitForTransactionReceipt(txHash);

    if (receipt && receipt.status) {
      console.log("Transaction successful:", receipt);
      return { success: true, txHash };
    } else {
      console.error("Transaction failed:", receipt);
      return { success: false, txHash };
    }
  } catch (error) {
    console.log(error);
    return { success: false, error: error };
  }
};

export const createUnwrapAvaxTransaction = async (
  accountAddress: string,
  amount: BN
): Promise<{
  success: boolean;
  txHash?: string;
  error?: unknown;
}> => {
  try {
    const contract = new window.w3.eth.Contract(wavax_abi, WAVAX_ADDRESS);

    const data = contract.methods.withdraw(amount.toString()).encodeABI();

    const txParams = {
      to: WAVAX_ADDRESS,
      from: accountAddress,
      data,
    };
    console.log(txParams);

    const txHash = await window.ethereum?.request({
      method: "eth_sendTransaction",
      params: [txParams],
    });

    const receipt = await waitForTransactionReceipt(txHash);

    if (receipt && receipt.status) {
      console.log("Transaction successful:", receipt);
      return { success: true, txHash };
    } else {
      console.error("Transaction failed:", receipt);
      return { success: false, txHash };
    }
  } catch (error) {
    console.log(error);
    return { success: false, error: error };
  }
};

export const getTokenAmountsOnRemoveLiquidity = async (
  token0Address: string,
  token1Address: string,
  liquidity: BN
): Promise<BN[] | null> => {
  let amounts: BN[] | null = null;
  try {
    const factoryContract = new window.w3.eth.Contract(
      factory_abi,
      Factory_address
    );
    const pairContractAddress = await factoryContract.methods
      .getPair(token0Address, token1Address)
      .call();
    let pairAddress;
    if (pairContractAddress) {
      pairAddress = pairContractAddress.toString();
    } else {
      throw new Error("Error: getAmountOut() could not retrive pair address!");
    }
    const token0Contract = new window.w3.eth.Contract(erc20_abi, token0Address);
    const token1Contract = new window.w3.eth.Contract(erc20_abi, token1Address);
    const pairContract = new window.w3.eth.Contract(ice_pond_abi, pairAddress);
    const lastK = new BN(await pairContract.methods.kLast().call());
    const reserveData: { _reserve0: string; _reserve1: string } =
      await pairContract.methods.getReserves().call();
    const _reserve0 = new BN(reserveData._reserve0);
    const _reserve1 = new BN(reserveData._reserve1);
    const balance0: BN = new BN(
      await token0Contract.methods.balanceOf(pairAddress).call()
    );
    const balance1: BN = new BN(
      await token1Contract.methods.balanceOf(pairAddress).call()
    );
    const totalSupply: BN = new BN(
      await pairContract.methods.totalSupply().call()
    );

    const rootK = sqrtBN(_reserve0.mul(_reserve1));
    const rootKLast = sqrtBN(lastK);

    let newSupply = totalSupply;
    if (rootK > rootKLast) {
      const numerator = totalSupply.mul(rootK.sub(rootKLast));
      const denominator = rootK.mul(new BN(5)).add(rootKLast);
      const liquidity = numerator.div(denominator);
      newSupply = newSupply.add(liquidity);
    }

    const amount0 = liquidity.mul(balance0).div(newSupply);
    const amount1 = liquidity.mul(balance1).div(newSupply);

    amounts = [amount0, amount1];
  } catch (error) {
    console.log(error);
  }
  return amounts;
};

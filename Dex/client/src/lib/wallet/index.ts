import Web3 from "web3";
import BN from "bn.js";

import { useAccountConnect } from "@/lib/react-query/queriesAndMutations";
import { INITIAL_ACCOUNT, useUserContext } from "@/context/AuthContext";
import { useEffect } from "react";
import { Account } from "@/types";
import { getCookie, isAddress, setCookie } from "../utils";
import {
  avvy_resolver_abi,
  avvy_resolver_addr,
  chain_id,
  erc20_abi,
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
    return cachedAccount;
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
  const { mutateAsync: connectUser, isLoading } = useAccountConnect();

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
        const domainName = getDomainName(address);
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
        });

        cacheAccount({
          address: connectedAddress,
          name: domainName,
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

  return { handleConnectWallet, isLoading };
};

export const getERC20Balance = async (
  accountAddress: string,
  tokenAddress: string
): Promise<BN | null> => {
  let balance: BN | null = null;
  try {
    const contract = new window.w3.eth.Contract(erc20_abi, tokenAddress);
    let result = await contract.methods.balanceOf(accountAddress).call();
    if (result) {
      balance = new BN(result.toString());
    }
  } catch (error) {
    console.log(error);
  }
  return balance;
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

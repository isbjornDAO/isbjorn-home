import Web3 from "web3";
import BN from "bn.js";

import { createContext, useContext, useEffect, useState } from "react";
import { Account } from "@/types";
import { cacheAccount, getCachedAccount, getDomainName, getERC20Balance, initializeWeb3 } from "@/lib/wallet";
import { chain_id, sample_token_list } from "@/constants";


export const INITIAL_ACCOUNT = {
    address: null,
    name: null,
    balances: {}
}

const INITIAL_STATE = {
    account: INITIAL_ACCOUNT,
    setAccount: () => { },
    isConnected: false,
    setIsConnected: () => { },
    currentChainId: chain_id,
    setCurrentChainId: () => { },
    switchNetwork: async (chainId: number) => { },
    getUserTokenBal: async (address: string) => { return null; }
}

type IContextType = {
    account: Account;
    setAccount: React.Dispatch<React.SetStateAction<Account>>;
    isConnected: boolean;
    setIsConnected: React.Dispatch<React.SetStateAction<boolean>>;
    currentChainId: number;
    setCurrentChainId: React.Dispatch<React.SetStateAction<number>>;
    switchNetwork: (chainId: number) => Promise<void>;
    getUserTokenBal: (address: string) => Promise<BN | null>;
}

const AuthContext = createContext<IContextType>(INITIAL_STATE);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [account, setAccount] = useState<Account>(INITIAL_ACCOUNT);
    const [balancesFetched, setBalancesFetched] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [currentChainId, setCurrentChainId] = useState<number>(chain_id);

    const switchNetwork = async (chainId: number) => {
        if (!window.ethereum) {
            console.error("Ethereum provider not available");
            return;
        }

        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: `0x${chainId.toString(16)}` }],
            });
        } catch (error) {
            console.error("Failed to switch network:", error);
        }
    };

    const checkIfConnectedUser = async () => {
        setIsLoading(true);
        if (window.ethereum) {
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            if (accounts.length > 0) {
                const address = accounts[0].toLowerCase();
                const domainName = await getDomainName(address);
                const cachedAccount = getCachedAccount(address);
                if (cachedAccount) {
                    setAccount({ address: cachedAccount.address, name: domainName || cachedAccount.name, balances: cachedAccount.balances });
                    setIsConnected(true);
                    setIsLoading(false);
                    return;
                } else {
                    setAccount({ address: accounts[0], name: domainName, balances: {} });
                    setIsConnected(true);
                    setIsLoading(false);
                    return;
                }
            }
        }
        setIsConnected(false);
        setIsLoading(false);
    };

    const handleAccountsChanged = async (accounts: string[]) => {
        if (accounts.length > 0) {
            const address = accounts[0];
            const cachedAccount = getCachedAccount(address);
            if (cachedAccount) {
                setAccount(cachedAccount);
                setIsConnected(true);
            } else {
                setBalancesFetched(false);
                setAccount({ address: address, name: await getDomainName(address), balances: {} });
                setIsConnected(true);
            }
        } else {
            setAccount({ address: null, name: null, balances: {} });
            setIsConnected(false);
            setBalancesFetched(false);
        }
    };

    const getUserTokenBal = async (address: string) => {
        if (account.address === null) return new BN(0);
        const result = await getERC20Balance(account.address, address);
        setAccount((prevAccount) => ({
            ...prevAccount,
            balances: {
                ...prevAccount.balances,
                [address.toLowerCase()]: result,
            },
        }));
        console.log(account);
        cacheAccount(account);
        return result;
    };


    const getAllUserTokenBals = async () => {
        const balances: { [key: string]: BN } = {};

        const balancePromises = Object.keys(sample_token_list)
            .map(async (address) => {
                const result = await getERC20Balance(account.address, address);
                balances[address.toLowerCase()] = result;
            });

        await Promise.all(balancePromises);

        setAccount((prevAccount) => ({
            ...prevAccount,
            balances: {
                ...prevAccount.balances,
                ...balances,
            },
        }));
        cacheAccount(account);
    };

    useEffect(() => {
        initializeWeb3();
    }, []);

    useEffect(() => {
        checkIfConnectedUser();

        if (window.ethereum) {
            window.ethereum.on("chainChanged", (chainId: string) => {
                const newChainId = parseInt(chainId, 16);
                setCurrentChainId(newChainId);
                if (newChainId !== chain_id) {
                    switchNetwork(chain_id);
                }
            });
            window.ethereum.on("accountsChanged", handleAccountsChanged);
        }

        return () => {
            if (window.ethereum) {
                window.ethereum.removeListener("chainChanged", (chainId: string) => {
                    const newChainId = parseInt(chainId, 16);
                    setCurrentChainId(newChainId);
                    if (newChainId !== 43114) {
                        switchNetwork(43114);
                    }
                });
                window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
            }
        };
    }, []);

    useEffect(() => {
        if (account.address && !balancesFetched) {
            getAllUserTokenBals();
            setBalancesFetched(true);
        }
    }, [account]);

    useEffect(() => {
        console.log("Updated balances:", account.balances);
    }, [account.balances]);


    const value = {
        account,
        setAccount,
        isConnected,
        setIsConnected,
        currentChainId,
        setCurrentChainId,
        switchNetwork,
        getUserTokenBal
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export const useUserContext = () => useContext(AuthContext);
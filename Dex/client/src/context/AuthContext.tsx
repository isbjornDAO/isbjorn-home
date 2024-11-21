import Web3 from "web3";
import BN from "bn.js";

import { createContext, useContext, useEffect, useState } from "react";
import { Account } from "@/types";
import { getCachedAccount, getDomainName, initializeWeb3 } from "@/lib/wallet";


export const INITIAL_ACCOUNT = {
    address: null,
    name: null
}

const INITIAL_STATE = {
    account: INITIAL_ACCOUNT,
    setAccount: () => { },
    isConnected: false,
    setIsConnected: () => { },
    currentChainId: 43114,
    setCurrentChainId: () => { },
    switchNetwork: async (chainId: number) => { }
}

type IContextType = {
    account: Account;
    setAccount: React.Dispatch<React.SetStateAction<Account>>;
    isConnected: boolean;
    setIsConnected: React.Dispatch<React.SetStateAction<boolean>>;
    currentChainId: number;
    setCurrentChainId: React.Dispatch<React.SetStateAction<number>>;
    switchNetwork: (chainId: number) => Promise<void>;
}

const AuthContext = createContext<IContextType>(INITIAL_STATE);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [account, setAccount] = useState<Account>(INITIAL_ACCOUNT);
    const [isConnected, setIsConnected] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [currentChainId, setCurrentChainId] = useState<number>(43114);

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
                    setAccount({ address: cachedAccount.address, name: domainName || cachedAccount.name });
                    setIsConnected(true);
                    setIsLoading(false);
                    return;
                } else {
                    setAccount({ address: accounts[0], name: domainName });
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
                setAccount({ address: address, name: await getDomainName(address) });
                setIsConnected(true);
            }
        } else {
            setAccount({ address: null, name: null });
            setIsConnected(false);
        }
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
                if (newChainId !== 43114) {
                    switchNetwork(43114);
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

    const value = {
        account,
        setAccount,
        isConnected,
        setIsConnected,
        currentChainId,
        setCurrentChainId,
        switchNetwork
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export const useUserContext = () => useContext(AuthContext);
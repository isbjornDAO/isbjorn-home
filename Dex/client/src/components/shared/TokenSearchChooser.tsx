import React, { FC, useEffect, useState } from 'react';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { Token } from '@/types';
import { setCookie, getCookie } from '@/lib/utils';
import { cn } from "@/lib/utils";
import { Loader } from '@/components/shared';

interface TokenSearchChooserProps {
    startSelected: Token;
    available: { [address: string]: Token };
    onSelection?: (selectedToken: Token) => void;
    onImport?: (address: string) => Promise<Token | null>;
}

const IMPORTED_TOKENS_COOKIE = 'imported_tokens';

const TokenSearchChooser: FC<TokenSearchChooserProps> = ({
    startSelected,
    available,
    onSelection,
    onImport
}) => {
    const [mounted, setMounted] = useState(false);
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState<string>(startSelected.address);
    const [searchValue, setSearchValue] = useState('');
    const [mightBeAddress, setMightBeAddress] = useState(false);
    const [currentSelected, setCurrentSelected] = useState<Token>(startSelected);
    const [importedTokens, setImportedTokens] = useState<{ [address: string]: Token }>({});
    const [isAddingToken, setIsAddingToken] = useState(false);
    const [importError, setImportError] = useState<string>('');

    // Load imported tokens from cookies on mount
    useEffect(() => {
        const savedTokens = getCookie(IMPORTED_TOKENS_COOKIE);
        if (savedTokens) {
            try {
                setImportedTokens(JSON.parse(savedTokens));
            } catch (error) {
                console.error('Error parsing imported tokens from cookie:', error);
            }
        }
        setMounted(true);
    }, []);

    useEffect(() => {
        setValue(startSelected.address);
        setCurrentSelected(startSelected);
    }, [startSelected]);

    useEffect(() => {
        // Check if search value might be a contract address
        setMightBeAddress(/^0x[a-fA-F0-9]{40}$/.test(searchValue));
        setImportError('');
    }, [searchValue]);


    // Combine available and imported tokens
    const allTokens = { ...available, ...importedTokens };

    // Filter tokens based on search value
    const filteredTokens = Object.entries(allTokens).reduce((acc, [address, token]) => {
        const searchLower = searchValue.toLowerCase();
        if (
            token.ticker.toLowerCase().includes(searchLower) ||
            token.name.toLowerCase().includes(searchLower) ||
            token.address.toLowerCase().includes(searchLower)
        ) {
            acc[address] = token;
        }
        return acc;
    }, {} as typeof allTokens);

    const handleRemoveToken = (address: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (currentSelected.address.toLowerCase() === address.toLowerCase()) {
            const availableTokens = Object.entries(available)
                .sort(([, tokenA], [, tokenB]) => {
                    if (tokenA.rank === "" && tokenB.rank === "") return 0;
                    if (tokenA.rank === "") return 1;
                    if (tokenB.rank === "") return -1;
                    return Number(tokenA.rank) - Number(tokenB.rank);
                });
            if (availableTokens.length > 0) {
                const [newAddress, newToken] = availableTokens[0];
                setValue(newAddress);
                setCurrentSelected(newToken);
                if (onSelection) {
                    onSelection(newToken);
                }
            }
        }

        const updatedImported = { ...importedTokens };
        delete updatedImported[address];
        setImportedTokens(updatedImported);
        setCookie(IMPORTED_TOKENS_COOKIE, JSON.stringify(updatedImported), 30);
    };

    const handleImport = async () => {
        if (!onImport || !searchValue) return;

        setIsAddingToken(true);
        setImportError('');
        try {
            const token = await onImport(searchValue);
            if (token) {
                const updatedImported = {
                    ...importedTokens,
                    [searchValue]: token
                };
                setImportedTokens(updatedImported);
                setCookie(IMPORTED_TOKENS_COOKIE, JSON.stringify(updatedImported), 30);

                setValue(token.address);
                setCurrentSelected(token);
                if (onSelection) {
                    onSelection(token);
                }
                setOpen(false);
                setSearchValue('');
            } else {
                setImportError('Not a valid token contract!');
            }
        } catch (error) {
            console.error('Error importing token:', error);
            setImportError('Failed to import token!');
        } finally {
            setIsAddingToken(false);
        }
    };

    const handleSelect = (currentValue: string) => {
        setOpen(false);
        setValue(currentValue);
        const selectedToken = allTokens[currentValue];
        if (selectedToken) {
            setCurrentSelected(selectedToken);
            if (onSelection) {
                onSelection(selectedToken);
            }
        }
    };

    if (!mounted) return null;

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-[240px] justify-between"
                >
                    <div className="flex flex-row gap-2 items-center base-semibold">
                        <div className="relative w-8 h-8 rounded-full border-2 border-silver overflow-hidden">
                            <img
                                src={currentSelected.imgUrl || '/placeholder-token.png'}
                                alt={currentSelected.ticker}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <span>{currentSelected.ticker}</span>
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[240px] p-0 token-selector-content" align="start">
                {mounted && (
                    <Command shouldFilter={false} loop={true}>
                        <CommandInput
                            placeholder="Search token..."
                            onValueChange={setSearchValue}
                        />
                        <CommandList>
                            <CommandEmpty>
                                {mightBeAddress && onImport && !importError ? (
                                    <Button
                                        className="justify-center import-token-button mx-4"
                                        disabled={isAddingToken}
                                        onClick={handleImport}
                                    >
                                        {isAddingToken ? <Loader /> : 'Import token'}
                                    </Button>
                                ) : importError ? (
                                    <div className="text-red text-center py-2">{importError}</div>
                                ) : (
                                    'No tokens found.'
                                )}
                            </CommandEmpty>
                            {Object.keys(filteredTokens).length > 0 && (<CommandGroup heading="Tokens">
                                {Object.entries(filteredTokens)
                                    .sort(([, tokenA], [, tokenB]) => {
                                        if (tokenA.rank === "" && tokenB.rank === "") return 0;
                                        if (tokenA.rank === "") return 1;
                                        if (tokenB.rank === "") return -1;
                                        return Number(tokenA.rank) - Number(tokenB.rank);
                                    })
                                    .map(([address, token]) => (
                                        <CommandItem
                                            key={address}
                                            value={token.ticker.toLowerCase()}
                                            onSelect={() => handleSelect(address)}
                                        >
                                            <div className="flex flex-row gap-2 items-center base-semibold flex-1">
                                                <div className="relative w-8 h-8 rounded-full border-2 border-silver overflow-hidden">
                                                    <img
                                                        src={token.imgUrl || '/placeholder-token.png'}
                                                        alt={token.ticker}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <span>{token.ticker}</span>
                                            </div>
                                            <Check
                                                className={cn(
                                                    "ml-auto h-4 w-4",
                                                    value === address ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                            {address in importedTokens && (
                                                <button
                                                    onClick={(e) => handleRemoveToken(address, e)}
                                                    className="p-1 hover:bg-gray-100 rounded-full"
                                                    title="Remove imported token"
                                                >
                                                    <X className="h-4 w-4 text-red-500" />
                                                </button>
                                            )}
                                        </CommandItem>
                                    ))}
                            </CommandGroup>
                            )}
                        </CommandList>
                    </Command>
                )}
            </PopoverContent>
        </Popover>
    );
};

export default TokenSearchChooser;
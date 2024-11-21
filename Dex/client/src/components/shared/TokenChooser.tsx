import React, { FC, useEffect, useState } from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Token } from '@/types';


interface TokenChooserProps {
    startSelected: Token;
    available: { [address: string]: Token };
    onSelection?: (selectedToken: Token) => void;
}

const TokenChooser: FC<TokenChooserProps> = ({ startSelected, available, onSelection }) => {

    const [currentSelected, setCurrentSelected] = useState<Token>(startSelected);

    useEffect(() => {
        setCurrentSelected(startSelected);
    }, [startSelected]);

    return (
        <Select
            value={currentSelected.address.toString()} onValueChange={(value) => {
                const selectedToken = available[value];
                setCurrentSelected(selectedToken);
                if (onSelection) { onSelection(selectedToken); }

            }}
        >
            <SelectTrigger className="min-w-[140px] border-dark-2">
                <SelectValue placeholder="Network" />
            </SelectTrigger>
            <SelectContent className='token-selector-content'>
                {Object.entries(available)
                    .sort(([, tokenA], [, tokenB]) => {
                        if (tokenA.rank === "" && tokenB.rank === "") return 0;
                        if (tokenA.rank === "") return 1;
                        if (tokenB.rank === "") return -1;

                        const rankA = Number(tokenA.rank);
                        const rankB = Number(tokenB.rank);
                        return rankA - rankB;
                    })
                    .map(([key, token]) => (
                        <SelectItem key={key} value={key}>
                            <div className="flex flex-row gap-2 items-center base-semibold">
                                <div className="relative w-8 h-8 rounded-full border-2 border-silver overflow-hidden">
                                    <img
                                        src={token.imgUrl || 'default_image_url_here'}
                                        alt={token.ticker}
                                        className="w-full h-full object-cover transform scale-110"
                                    />
                                </div>
                                <p>{token.ticker}</p>
                            </div>
                        </SelectItem>
                    ))
                }
            </SelectContent>
        </Select>
    )
}

export default TokenChooser
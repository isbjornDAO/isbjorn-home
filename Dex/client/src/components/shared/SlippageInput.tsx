import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { defaultSlippage, minSlippage, safeModeDisabledMaxSlippage, safeModeEnabledMaxSlippage } from "@/constants";

interface SlippageInputProps {
    allowedSlippage: number; // Represented as a percentage directly (e.g., 0.5 for 0.5%)
    setAllowedSlippage: (slippage: number) => void;
    safeModeEnabled: boolean; // Determines stricter limits for max slippage
}

const SlippagePopover: React.FC<SlippageInputProps> = ({
    allowedSlippage,
    setAllowedSlippage,
    safeModeEnabled,
}) => {
    const [isFocused, setIsFocused] = useState(false);

    const maxSlippage = safeModeEnabled ? safeModeEnabledMaxSlippage : safeModeDisabledMaxSlippage;

    const handleFocus = () => setIsFocused(true);

    const handleBlur = () => {
        setIsFocused(false);

        if (isNaN(allowedSlippage) || allowedSlippage <= 0) {
            setAllowedSlippage(defaultSlippage);
        } else if (allowedSlippage > maxSlippage) {
            setAllowedSlippage(maxSlippage);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const numericValue = parseFloat(value);

        if (!isNaN(numericValue) && numericValue >= 0) {
            setAllowedSlippage(numericValue);
        }
    };

    return (
        <Input
            className="h-6 w-[3.5rem] no-arrows slippage-input"
            type={isFocused ? "number" : "text"}
            value={
                isFocused
                    ? allowedSlippage.toString()
                    : `${allowedSlippage.toFixed(2)}%`
            }
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            max={maxSlippage}
            min={minSlippage}
        />
    );
};

export default SlippagePopover;

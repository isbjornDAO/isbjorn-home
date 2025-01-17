import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import BN from "bn.js";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const shortenAddress = (
  address: string,
  front: number = 4,
  back: number = 4
) => {
  return `${address.slice(0, front)}...${address.slice(back * -1)}`;
};

export const isAddress = (address: string) => {
  if (
    typeof address !== "string" ||
    address.length !== 42 ||
    address.slice(0, 2) !== "0x"
  ) {
    return false;
  }

  const hexRegex = /^0x[0-9a-fA-F]{40}$/;

  return hexRegex.test(address);
};

export const setCookie = (name: string, value: string, days: number) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
};

export const getCookie = (name: string): string | null => {
  const nameEQ = name + "=";
  const ca = document.cookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

export const eraseCookie = (name: string) => {
  document.cookie = name + "=; Max-Age=-99999999;";
};

export const scaleToBN = (amount: string | number, decimals: number): BN => {
  // Convert the number input to a string
  if (typeof amount === "number") {
    amount = amount.toString();
  }

  if (typeof amount !== "string") {
    throw new Error("Amount must be a string or number.");
  }

  const trimmedAmount = amount.trim();

  // Updated regex to handle cases like ".3" or "0.3"
  const regex = /^(?:0|[1-9]\d*)?(\.\d+)?$/;
  if (!regex.test(trimmedAmount)) {
    throw new Error(
      `Invalid amount format: "${amount}". Expected a numeric string or number.`
    );
  }

  const [wholePart = "0", fractionPart = ""] = trimmedAmount.split(".");

  let normalizedFraction = fractionPart;

  if (fractionPart.length > decimals) {
    normalizedFraction = fractionPart.slice(0, decimals);
  } else {
    normalizedFraction = fractionPart.padEnd(decimals, "0");
  }

  const combined = wholePart + normalizedFraction;
  const normalized = combined.replace(/^0+/, "") || "0";

  try {
    return new BN(normalized, 10);
  } catch (error) {
    throw new Error(`Error converting amount to BN: ${error.message}`);
  }
};

export const formatBN = (
  amountBN: BN | string,
  decimals: number,
  isHex?: boolean
): string => {
  if (typeof amountBN === "string") {
    // Check if the string starts with "0x" to parse as hex; otherwise, parse as base 10
    amountBN = isHex
      ? new BN(amountBN, 16)
      : amountBN.startsWith("0x")
      ? new BN(amountBN.slice(2), 16)
      : new BN(amountBN, 10);
  }
  if (!(amountBN instanceof BN)) {
    throw new Error("amountBN must be an instance of BN.");
  }

  if (!Number.isInteger(decimals) || decimals < 0) {
    return "0";
  }

  if (amountBN.isZero()) {
    return "0";
  }

  const amountStr = amountBN.toString(10);

  if (decimals === 0) {
    return amountStr;
  }

  const length = amountStr.length;

  let formatted: string;

  if (length <= decimals) {
    const padded = amountStr.padStart(decimals, "0");
    formatted = `0.${padded}`;
    formatted = formatted.replace(/\.?0+$/, "");
  } else {
    const integerPart = amountStr.slice(0, length - decimals);
    const fractionPart = amountStr.slice(length - decimals);

    const trimmedFraction = fractionPart.replace(/0+$/, "");

    formatted =
      trimmedFraction.length > 0
        ? `${integerPart}.${trimmedFraction}`
        : integerPart;
  }

  return formatted;
};

export const sqrtBN = (value: BN) => {
  if (value.isZero()) return new BN(0);
  if (value.isNeg())
    throw new Error("Square root of negative numbers is not supported");

  let low = new BN(1);
  let high = value;
  let mid;

  while (low.lt(high)) {
    mid = low.add(high).div(new BN(2));
    const midSquared = mid.mul(mid);

    if (midSquared.eq(value)) {
      return mid;
    } else if (midSquared.lt(value)) {
      low = mid.add(new BN(1));
    } else {
      high = mid;
    }
  }

  return high.sub(new BN(1));
};

export const formatDecimal = (
  numberStr: string,
  decimalPlaces: number
): string => {
  const rounded = Number(numberStr).toFixed(decimalPlaces);
  return parseFloat(rounded).toLocaleString();
};

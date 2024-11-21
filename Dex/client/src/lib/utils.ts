import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

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

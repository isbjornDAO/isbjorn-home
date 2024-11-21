import { useMutation } from "@tanstack/react-query";

import { connectWallet } from "../wallet";

export const useAccountConnect = () => {
  return useMutation(async () => {
    // Connect the wallet and get the address
    const address = await connectWallet();
    return address;
  });
};

export const useAccountDisconnect = () => {
  return useMutation(async (address: string) => {
    // Perform any necessary cleanup or server-side logout logic here
    return address;
  });
};

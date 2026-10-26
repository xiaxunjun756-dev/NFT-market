import { useMemo } from 'react';
import { getContract } from 'viem';
import { usePublicClient, useWalletClient } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import marketplaceAbi from '../abis/marketplace.json';

const rawAddress = import.meta.env.VITE_MARKETPLACE_ADDRESS;
if (!rawAddress) {
  throw new Error('Missing VITE_MARKETPLACE_ADDRESS env var. Check your .env config');
}
export const MARKETPLACE_ADDRESS = rawAddress as `0x${string}`;
export const MARKETPLACE_ABI = marketplaceAbi;

export function useMarketplaceRead() {
  const publicClient = usePublicClient({ chainId: sepolia.id });

  return useMemo(() => {
    if (!publicClient) return null;
    return getContract({
      address: MARKETPLACE_ADDRESS,
      abi: MARKETPLACE_ABI,
      client: { public: publicClient },
    });
  }, [publicClient]);
}

export function useMarketplaceWrite() {
  const { data: walletClient } = useWalletClient();

  return useMemo(() => {
    if (!walletClient) return null;
    return getContract({
      address: MARKETPLACE_ADDRESS,
      abi: MARKETPLACE_ABI,
      client: { wallet: walletClient },
    });
  }, [walletClient]);
}

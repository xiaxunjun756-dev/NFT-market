import NFTTile from "./NFTTile.tsx";
import { MARKETPLACE_ADDRESS, MARKETPLACE_ABI } from "../hooks/useMarketplace";
import { useEffect, useState } from "react";
import { GetIpfsUrlFromPinata } from "../utils/utils.ts";
import { usePublicClient } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { getContract, formatUnits } from 'viem';

export default function Marketplace() {
  const [data, updateData] = useState<any[]>([]);
  const [dataFetched, updateFetched] = useState(false);
  const publicClient = usePublicClient({ chainId: sepolia.id });

  useEffect(() => {
    let cancelled = false;

    async function getAllNFTs() {
      if (!publicClient) return;

      const contract = getContract({
        address: MARKETPLACE_ADDRESS,
        abi: MARKETPLACE_ABI,
        client: { public: publicClient },
      });
      const transaction = (await contract.read.getAllNFTs()) as any[];
      await Promise.all(
        transaction.map(async (i: any) => {
          let tokenURI = (await contract.read.tokenURI([i.tokenId])) as string;
          tokenURI = GetIpfsUrlFromPinata(tokenURI);
          const meta: any = await (await fetch(tokenURI)).json();

          let price = formatUnits(i.price, 18);
          let item = {
            price,
            tokenId: i.tokenId.toString(),
            seller: i.seller,
            owner: i.owner,
            image: meta.image,
            name: meta.name,
            description: meta.description,
          };

          if (!cancelled) updateData((prev) => [...prev, item]);
        })
      );
      if (!cancelled) updateFetched(true);
    }

    if (!dataFetched) getAllNFTs();
    return () => { cancelled = true; };
  }, [publicClient, dataFetched]);

  return (
    <div>
      <div className="flex flex-col place-items-center mt-10">
        <div className="md:text-xl font-bold text-white">Top NFTs</div>
        <div className="flex mt-5 justify-center flex-wrap max-w-screen-xl text-center gap-6">
          {data.map((value, index) => {
            return <NFTTile data={value} index={index} key={index}></NFTTile>;
          })}
        </div>
      </div>
    </div>
  );
}

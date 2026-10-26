import { useEffect, useState } from "react";
import { formatEther } from "viem";
import { useAccount } from "wagmi";
import { useMarketplaceRead } from "../hooks/useMarketplace";
import NFTTile from "./NFTTile";

export default function Profile() {
    const [data, updateData] = useState<any[]>([]);
    const [totalPrice, updateTotalPrice] = useState("0");
    const { address } = useAccount();
    const contract = useMarketplaceRead();

    async function getNFTData() {
        if (!contract || !address) return;

        let sumPrice = 0;
        const transaction = (await contract.read.getMyNFTs({ account: address })) as any[];

        const items = await Promise.all(transaction.map(async (i: any) => {
            const tokenURI = (await contract.read.tokenURI([i.tokenId])) as string;
            const meta: any = await (await fetch(tokenURI)).json();

            let price = formatEther(i.price);
            let item = {
                price,
                tokenId: i.tokenId.toString(),
                seller: i.seller,
                owner: i.owner,
                image: meta.image,
                name: meta.name,
                description: meta.description,
            };
            sumPrice += Number(price);
            return item;
        }));
        updateData(items);
        updateTotalPrice(sumPrice.toPrecision(3));
    }

    useEffect(() => {
        getNFTData();
    }, [contract, address]);

    return (
        <div className="min-h-screen">
            <div>
                <div className="flex text-center flex-col mt-11 md:text-2xl text-white">
                    <div className="mb-5">
                        <h2 className="font-bold">Wallet Address</h2>
                        {address}
                    </div>
                </div>
                <div className="flex flex-row text-center justify-center mt-10 md:text-2xl text-white">
                    <div>
                        <h2 className="font-bold">No. of NFTs</h2>
                        {data.length}
                    </div>
                    <div className="ml-20">
                        <h2 className="font-bold">Total Value</h2>
                        {totalPrice} ETH
                    </div>
                </div>
                <div className="flex flex-col text-center items-center mt-11 text-white">
                    <h2 className="font-bold">Your NFTs</h2>
                    <div className="flex justify-center flex-wrap max-w-screen-xl">
                        {data.map((value, index) => {
                            return <NFTTile data={value} key={index}></NFTTile>;
                        })}
                    </div>
                    <div className="mt-10 text-xl">
                        {data.length === 0 ? "Oops, No NFT data to display (Are you logged in?)" : ""}
                    </div>
                </div>
            </div>
        </div>
    );
}

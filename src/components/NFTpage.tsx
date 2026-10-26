import { useEffect, useState } from "react";
import { useParams } from 'react-router-dom';
import { parseEther } from "viem";
import { useAccount, usePublicClient } from "wagmi";
import { sepolia } from "wagmi/chains";
import { useMarketplaceRead, useMarketplaceWrite } from "../hooks/useMarketplace";
import { GetIpfsUrlFromPinata } from "../utils/utils.ts";

export default function NFTPage() {
    const [data, updateData] = useState<any>({});
    const [dataFetched, updateDataFetched] = useState(false);
    const [message, updateMessage] = useState("");
    const { address } = useAccount();
    const readContract = useMarketplaceRead();
    const writeContract = useMarketplaceWrite();
    const publicClient = usePublicClient({ chainId: sepolia.id });
    const params = useParams();
    const tokenId = params.tokenId;

    useEffect(() => {
        async function getNFTData(tokenId: any) {
            if (!readContract) return;

            const id = BigInt(tokenId);
            const tokenURI = (await readContract.read.tokenURI([id])) as string;
            const listedToken = (await readContract.read.getListedTokenForId([id])) as any;
            const url = GetIpfsUrlFromPinata(tokenURI);
            const meta: any = await (await fetch(url)).json();

            let item = {
                price: meta.price,
                tokenId: tokenId,
                seller: listedToken.seller,
                owner: listedToken.owner,
                image: GetIpfsUrlFromPinata(meta.image),
                name: meta.name,
                description: meta.description,
            };
            updateData(item);
            updateDataFetched(true);
        }

        if (!dataFetched && tokenId) getNFTData(tokenId);
    }, [readContract, dataFetched, tokenId]);

    async function buyNFT(tokenId: any) {
        try {
            if (!writeContract || !publicClient) {
                updateMessage("Please connect your wallet first");
                return;
            }
            const salePrice = parseEther(data.price);
            updateMessage("Buying the NFT... Please Wait (Upto 5 mins)");
            const hash = await writeContract.write.executeSale([BigInt(tokenId)], { value: salePrice });
            await publicClient.waitForTransactionReceipt({ hash });

            alert('You successfully bought the NFT!');
            updateMessage("");
        }
        catch (e) {
            alert("Upload Error" + e)
        }
    }

    return (
        <div className="min-h-screen">
            <div className="flex ml-20 mt-20">
                <img
                    src={data.image}
                    alt={data.name}
                    width={480} height={480}
                    fetchPriority="high"
                    decoding="async"
                    className="w-2/5"
                />

                <div className="text-xl ml-20 space-y-8 text-white shadow-2xl rounded-lg border-2 p-5">
                    <div>
                        Name: {data.name}
                    </div>
                    <div>
                        Description: {data.description}
                    </div>
                    <div>
                        Price: <span>{data.price + " ETH"}</span>
                    </div>
                    <div>
                        Owner: <span className="text-sm">{data.owner}</span>
                    </div>
                    <div>
                        Seller: <span className="text-sm">{data.seller}</span>
                    </div>
                    <div>
                        {address !== data.owner && address !== data.seller ?
                            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm" onClick={() => buyNFT(tokenId)}>Buy this NFT</button>
                            : <div className="text-emerald-700">You are the owner of this NFT</div>
                        }

                        <div className="text-green-500 text-center mt-3">{message}</div>
                    </div>
                </div>
            </div>
        </div>
    )
}

import { useState, type ChangeEvent } from "react";
import { parseEther } from "viem";
import { usePublicClient } from "wagmi";
import { sepolia } from "wagmi/chains";
import { uploadFileToIPFS, uploadJSONToIPFS } from "../utils/pinata.ts";
import { useMarketplaceRead, useMarketplaceWrite } from "../hooks/useMarketplace";

export default function SellNFT () {
    const [formParams, updateFormParams] = useState({ name: '', description: '', price: ''});
    const [fileURL, setFileURL] = useState<string | null>(null);
    const [message, updateMessage] = useState('');
    const readContract = useMarketplaceRead();
    const writeContract = useMarketplaceWrite();
    const publicClient = usePublicClient({ chainId: sepolia.id });

    async function disableButton() {
        const listButton = document.getElementById("list-button") as HTMLButtonElement | null;
        if (!listButton) return;
        listButton.disabled = true;
    }

    async function enableButton() {
        const listButton = document.getElementById("list-button") as HTMLButtonElement | null;
        if (!listButton) return;
        listButton.disabled = false;
    }

    async function OnChangeFile(e: ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        disableButton();
        updateMessage("Uploading image.. please dont click anything!")
        const response = await uploadFileToIPFS(file, file.name);
        if (response.success) {
            updateMessage("")
            console.log("Uploaded image to Pinata: ", response.pinataURL)
            setFileURL(response.pinataURL);
        } else {
            updateMessage("Image upload failed: " + response.message);
        }
        enableButton();
    }

    async function uploadMetadataToIPFS() {
        const {name, description, price} = formParams;
        if( !name || !description || !price || !fileURL)
        {
            updateMessage("Please fill all the fields!")
            return -1;
        }

        const nftJSON = {
            name, description, price, image: fileURL
        }

        const response = await uploadJSONToIPFS(nftJSON);
        if (response.success) {
            console.log("Uploaded JSON to Pinata: ", response)
            return response.pinataURL;
        }
        updateMessage("Metadata upload failed: " + response.message);
        return -1;
    }

    async function listNFT(e: any) {
        e.preventDefault();

        try {
            const metadataURL = await uploadMetadataToIPFS();
            if(metadataURL === -1 || !metadataURL)
                return;

            if (!readContract || !writeContract || !publicClient) {
                updateMessage("Please connect your wallet first");
                return;
            }

            disableButton();
            updateMessage("Uploading NFT(takes 5 mins).. please dont click anything!")

            const price = parseEther(formParams.price)
            const listingPrice = await readContract.read.getListPrice()

            const hash = await writeContract.write.createToken([metadataURL, price], { value: listingPrice })
            await publicClient.waitForTransactionReceipt({ hash })

            alert("Successfully listed your NFT!");
            enableButton();
            updateMessage("");
            updateFormParams({ name: '', description: '', price: ''});
            window.location.replace("/")
        }
        catch(e) {
            alert( "Upload error"+e )
        }
    }

    return (
        <div>
        <div className="flex flex-col place-items-center mt-10" id="nftForm">
            <form className="bg-white shadow-md rounded px-8 pt-4 pb-8 mb-4">
            <h3 className="text-center font-bold text-purple-500 mb-8">Upload your NFT to the marketplace</h3>
                <div className="mb-4">
                    <label className="block text-purple-500 text-sm font-bold mb-2" htmlFor="name">NFT Name</label>
                    <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="name" type="text" placeholder="Axie#4563" onChange={e => updateFormParams({...formParams, name: e.target.value})} value={formParams.name}></input>
                </div>
                <div className="mb-6">
                    <label className="block text-purple-500 text-sm font-bold mb-2" htmlFor="description">NFT Description</label>
                    <textarea className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" cols={40} rows={5} id="description" placeholder="Axie Infinity Collection" value={formParams.description} onChange={e => updateFormParams({...formParams, description: e.target.value})}></textarea>
                </div>
                <div className="mb-6">
                    <label className="block text-purple-500 text-sm font-bold mb-2" htmlFor="price">Price (in ETH)</label>
                    <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" type="number" placeholder="Min 0.01 ETH" step="0.01" value={formParams.price} onChange={e => updateFormParams({...formParams, price: e.target.value})}></input>
                </div>
                <div>
                    <label className="block text-purple-500 text-sm font-bold mb-2" htmlFor="image">Upload Image (&lt;500 KB)</label>
                    <input type={"file"} onChange={OnChangeFile}></input>
                </div>
                <br></br>
                <div className="text-red-500 text-center">{message}</div>
                <button onClick={listNFT} className="font-bold mt-10 w-full bg-purple-500 text-white rounded p-2 shadow-lg disabled:bg-gray-500 disabled:opacity-30" id="list-button">
                    List NFT
                </button>
            </form>
        </div>
        </div>
    )
}

import {
    Link,
} from "react-router-dom";
import { GetIpfsUrlFromPinata } from "../utils/utils.ts";

function NFTTile(data: any) {
    const newTo = {
        pathname: "/nftPage/" + data.data.tokenId
    }

    const IPFSUrl = GetIpfsUrlFromPinata(data.data.image);

    return (
        <Link to={newTo}>
            <div className="border-2 mt-5 mb-12 flex flex-col items-center rounded-lg w-48 md:w-72 shadow-2xl">
                <img
                    src={IPFSUrl}
                    alt={data.data.name}
                    width={288}
                    height={320}
                    loading={data.index === 0 ? "eager" : "lazy"}
                    fetchPriority={data.index === 0 ? "high" : "auto"}
                    decoding="async"
                    className="w-72 h-80 rounded-lg object-cover"
                 />
                <div className="text-white w-full p-2 bg-gradient-to-t from-[#454545] to-transparent rounded-lg pt-5 -mt-20">
                    <strong className="block text-xl whitespace-nowrap overflow-hidden text-ellipsis">{data.data.name}</strong>
                    <p className="whitespace-nowrap overflow-hidden text-ellipsis">
                        {data.data.description}
                    </p>
                </div>
            </div>
        </Link>
    )
}

export default NFTTile;

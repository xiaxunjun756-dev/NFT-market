export const GetIpfsUrlFromPinata = (pinataUrl: string): string => {
  const parts = pinataUrl.split("/");
 return "https://gateway.pinata.cloud/ipfs/" + parts[parts.length - 1];
};

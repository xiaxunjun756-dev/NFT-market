const jwt = import.meta.env.VITE_PINATA_JWT;

type UploadResult =
  | { success: true; pinataURL: string }
  | { success: false; message: string };

const GATEWAY = 'https://gateway.pinata.cloud/ipfs/';

const authHeaders = (): Record<string, string> => {
  if (!jwt) {
    throw new Error('Missing VITE_PINATA_JWT env var. Check your .env config');
  }
  return { Authorization: `Bearer ${jwt}` };
};

const fetchWithTimeout = (url: string, init: RequestInit, timeoutMs: number) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { ...init, signal: controller.signal }).finally(() =>
    clearTimeout(timer),
  );
};

const toMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

export const uploadJSONToIPFS = async (jsonBody: unknown): Promise<UploadResult> => {
  try {
    const response = await fetchWithTimeout(
      'https://api.pinata.cloud/pinning/pinJSONToIPFS',
      {
        method: 'POST',
        headers: {
          ...authHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jsonBody),
      },
      30_000,
    );
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    return { success: true, pinataURL: GATEWAY + data.IpfsHash };
  } catch (error) {
    console.error(error);
    return { success: false, message: toMessage(error) };
  }
};

export const uploadFileToIPFS = async (
  file: File,
  name: string,
): Promise<UploadResult> => {
  try {
    const data = new FormData();
    data.append('file', file);
    data.append('pinataMetadata', JSON.stringify({ name }));

    data.append(
      'pinataOptions',
      JSON.stringify({
        cidVersion: 0,
        customPinPolicy: {
          regions: [
            { id: 'FRA1', desiredReplicationCount: 1 },
            { id: 'NYC1', desiredReplicationCount: 2 },
          ],
        },
      }),
    );

    const response = await fetchWithTimeout(
      'https://api.pinata.cloud/pinning/pinFileToIPFS',
      {
        method: 'POST',
        headers: authHeaders(),
        body: data,
      },
      120_000,
    );
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const json = await response.json();
    return { success: true, pinataURL: GATEWAY + json.IpfsHash };
  } catch (error) {
    console.error(error);
    return { success: false, message: toMessage(error) };
  }
};

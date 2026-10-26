/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PROJECT_ID: string;
  readonly VITE_PINATA_JWT: string;
  readonly VITE_MARKETPLACE_ADDRESS: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Window {
  ethereum: {
    isConnected(): boolean;
    request(args: { method: string; params?: unknown[] }): Promise<any>;
    on(event: string, listener: (...args: any[]) => void): void;
  };
}

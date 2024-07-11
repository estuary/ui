import { LRUMap } from 'mnemonist';
import { GatewayAuthTokenResponse } from 'types';

// The limit of 10 is totally arbitrary. Felt like an okay number so all 3 tables could have
//  something in cache and allow someone some flexibility to search
const gatewayTokenCache = new LRUMap<string, GatewayAuthTokenResponse>(100);

export const storeGatewayAuthConfig = (
    key: string | null | undefined,
    { gateway_url, token }: GatewayAuthTokenResponse
): void => {
    key ? gatewayTokenCache.set(key, { gateway_url, token }) : null;
};

export const getStoredGatewayAuthConfig = (
    key: string | null | undefined
): GatewayAuthTokenResponse | undefined => {
    if (!key) {
        return undefined;
    }

    return gatewayTokenCache.get(key);
};

export const clearGatewayAuthTokenCache = (): void => {
    gatewayTokenCache.clear();
};

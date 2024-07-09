import { LRUMap } from 'mnemonist';
import { GatewayAuthTokenResponse } from 'types';

const gatewayTokenCache = new LRUMap<string, GatewayAuthTokenResponse>(10);

export const storeGatewayAuthConfig = (
    key: string | null,
    { gateway_url, token }: GatewayAuthTokenResponse
): void => {
    key ? gatewayTokenCache.set(key, { gateway_url, token }) : null;
};

export const getStoredGatewayAuthConfig = (
    key: string | null
): GatewayAuthTokenResponse | null => {
    return key ? gatewayTokenCache.get(key) ?? null : null;
};

export const clearGatewayAuthTokenCache = () => {
    gatewayTokenCache.clear();
};

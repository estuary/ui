import { LRUMap } from 'mnemonist';
import { TaskAuthorizationResponse } from 'utils/dataPlane-utils';

// The limit of 10 is totally arbitrary. Felt like an okay number so all 3 tables could have
//  something in cache and allow someone some flexibility to search
const gatewayTokenCache = new LRUMap<string, TaskAuthorizationResponse>(100);

export const storeGatewayAuthConfig = (
    key: string | null | undefined,
    response: TaskAuthorizationResponse
): void => {
    key ? gatewayTokenCache.set(key, response) : null;
};

export const getStoredGatewayAuthConfig = (
    key: string | null | undefined
): TaskAuthorizationResponse | undefined => {
    if (!key) {
        return undefined;
    }

    return gatewayTokenCache.get(key);
};

export const clearGatewayAuthTokenCache = (): void => {
    gatewayTokenCache.clear();
};

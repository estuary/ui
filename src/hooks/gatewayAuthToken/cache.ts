import { isBefore } from 'date-fns';
import { decodeJwt, JWTPayload } from 'jose';
import { LRUMap } from 'mnemonist';
import { TaskAuthorizationResponse } from 'utils/dataPlane-utils';

// The limit of 10 is totally arbitrary. Felt like an okay number so all 3 tables could have
//  something in cache and allow someone some flexibility to search
const taskAuthorizationCache = new LRUMap<string, TaskAuthorizationResponse>(
    100
);

export const setAuthorizationConfig = (
    key: string | null | undefined,
    response: TaskAuthorizationResponse
): void => {
    key ? taskAuthorizationCache.set(key, response) : null;
};

export const getAuthorizationConfig = (
    key: string | null | undefined
): TaskAuthorizationResponse | undefined => {
    if (!key) {
        return undefined;
    }

    return taskAuthorizationCache.get(key);
};

export const clearAuthorizationCache = (): void => {
    taskAuthorizationCache.clear();
};

export const evaluateJWTExpiration = (
    config: TaskAuthorizationResponse | undefined
) => {
    // Grab the data-plane token from local storage.
    let brokerJWT: JWTPayload | undefined,
     reactorJWT: JWTPayload | undefined;

    try {
        brokerJWT = config?.brokerAddress
            ? decodeJwt(config.brokerAddress)
            : undefined;
        reactorJWT = config?.reactorAddress
            ? decodeJwt(config.reactorAddress)
            : undefined;
    } catch {
        brokerJWT = undefined;
        reactorJWT = undefined;
    }

    // Check if the Gateway token is expired and we need to get a new one
    let tokensExpired = true;

    if (brokerJWT?.exp && reactorJWT?.exp) {
        tokensExpired =
            isBefore(brokerJWT.exp * 1000, Date.now()) &&
            isBefore(reactorJWT.exp * 1000, Date.now());
    }

    return tokensExpired;
};

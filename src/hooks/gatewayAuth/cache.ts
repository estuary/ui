import { isBefore } from 'date-fns';
import type { JWTPayload } from 'jose';
import { decodeJwt } from 'jose';
import { LRUMap } from 'mnemonist';
import type { TaskAuthorizationResponse } from 'utils/dataPlane-utils';

// The limit of 10 is arbitrary.
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

export const validateJWTs = (config: TaskAuthorizationResponse | undefined) => {
    // Extract the data-plane tokens from the cache.
    let brokerJWT: JWTPayload | undefined, reactorJWT: JWTPayload | undefined;

    try {
        brokerJWT = config?.brokerToken
            ? decodeJwt(config.brokerToken)
            : undefined;
        reactorJWT = config?.reactorToken
            ? decodeJwt(config.reactorToken)
            : undefined;
    } catch {
        brokerJWT = undefined;
        reactorJWT = undefined;
    }

    // Check if the data-plane tokens are expired.
    let tokensExpired = true;

    if (brokerJWT?.exp && reactorJWT?.exp) {
        tokensExpired =
            isBefore(brokerJWT.exp * 1000, Date.now()) &&
            isBefore(reactorJWT.exp * 1000, Date.now());
    }

    return tokensExpired;
};

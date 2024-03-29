import {
    broker,
    JournalClient,
    JournalSelector,
    ShardClient,
    ShardSelector,
} from 'data-plane-gateway';
import { Shard } from 'data-plane-gateway/types/shard_client';
import { ResponseError } from 'data-plane-gateway/types/util';
import { logRocketConsole } from 'services/shared';

export enum ErrorFlags {
    // DEBUGGING = 'parsing jwt:', // useful for testing just add it to the onError
    OPERATION_INVALID = 'Unauthorized',
    TOKEN_EXPIRED = 'token is expired',
    TOKEN_INVALID = 'Authentication failed',
    TOKEN_NOT_FOUND = 'Unauthenticated',
}

export const shouldRefreshToken = (errorMessage?: string | null) => {
    return (
        errorMessage &&
        (errorMessage.includes(ErrorFlags.TOKEN_INVALID) ||
            errorMessage.includes(ErrorFlags.TOKEN_NOT_FOUND) ||
            errorMessage.includes(ErrorFlags.TOKEN_EXPIRED))
    );
};

type AllowedKeys = 'ShardsList' | 'JournalData';
export function dataPlaneFetcher_list(
    client: ShardClient,
    selector: ShardSelector,
    key: 'ShardsList'
): Promise<Shard[] | ResponseError['body']>;
export function dataPlaneFetcher_list(
    client: JournalClient,
    selector: JournalSelector,
    key: 'JournalData'
): Promise<broker.ProtocolJournalSpec[] | ResponseError['body']>;
export async function dataPlaneFetcher_list(
    client: ShardClient | JournalClient,
    selector: ShardSelector | JournalSelector,
    key: AllowedKeys
): Promise<Shard[] | broker.ProtocolJournalSpec[] | ResponseError['body']> {
    // This can throw an error! Used within fetchers within SWR that is fine and SWR will handle it
    // TODO (typing)
    // I hate this but I need to get the bug finished
    const result = await client.list(selector as any);

    // Check for an error
    if (result.err()) {
        // Unwrap the error, log the error, and reject the response
        const error = result.unwrap_err();
        logRocketConsole(`${key} : error : `, error);
        return Promise.reject(error.body);
    }

    try {
        // No error so should be fine to unwrap
        const unwrappedResponse = result.unwrap();
        return await Promise.resolve(unwrappedResponse);
    } catch (error: unknown) {
        // This is just here to be safe. We'll keep an eye on it and possibly remove
        logRocketConsole(`${key} : unwrapError : `, error);
        return Promise.reject(error);
    }
}

// We increment the read window by this many bytes every time we get back
// fewer than the desired number of rows.
export const INCREMENT = 1024 * 1024;

export const MEGABYTE = 1 * 10 ** 6;

// 16mb, which is the max document size, ensuring we'll always get at least 1 doc if it exists
export const MAX_DOCUMENT_SIZE = 16 * MEGABYTE;

import { ShardClient, ShardSelector } from 'data-plane-gateway';
import {
    ProtocolLabelSelector,
    ProtocolListResponse,
} from 'data-plane-gateway/types/gen/broker/protocol/broker';
import { Shard } from 'data-plane-gateway/types/shard_client';
import { ResponseError } from 'data-plane-gateway/types/util';
import { client } from 'services/client';
import { logRocketConsole } from 'services/shared';
import {
    getCollectionAuthorizationSettings,
    getTaskAuthorizationSettings,
} from './env-utils';

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

export async function dataPlaneFetcher_list(
    shardClient: ShardClient,
    selector: ShardSelector,
    key: 'ShardsList'
): Promise<Shard[] | ResponseError['body']> {
    // This can throw an error! Used within fetchers within SWR that is fine and SWR will handle it
    // TODO (typing)
    // I hate this but I need to get the bug finished
    const result = await shardClient.list(selector as any);

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

interface TaskAuthorizationResponse {
    brokerAddress: string;
    brokerToken: string;
    opsLogsJournal: string;
    opsStatsJournal: string;
    reactorAddress: string;
    reactorToken: string;
    retryMillis: number;
    shardIdPrefix: string;
}

const { taskAuthorizationEndpoint } = getTaskAuthorizationSettings();

export const authorizeTask = async (
    accessToken: string | undefined,
    catalogName: string
): Promise<TaskAuthorizationResponse> =>
    client(
        taskAuthorizationEndpoint,
        {
            data: {
                task: catalogName,
            },
        },
        accessToken
    );

interface CollectionAuthorizationResponse {
    brokerAddress: string;
    brokerToken: string;
    journalNamePrefix: string;
    retryMillis: number;
}

const { collectionAuthorizationEndpoint } =
    getCollectionAuthorizationSettings();

export const authorizeCollection = async (
    accessToken: string | undefined,
    catalogName: string
): Promise<CollectionAuthorizationResponse> =>
    client(
        collectionAuthorizationEndpoint,
        {
            data: {
                collection: catalogName,
            },
        },
        accessToken
    );

export const getJournals = async (
    brokerAddress: string,
    brokerToken: string,
    selector: ProtocolLabelSelector
): Promise<{ result: ProtocolListResponse }> =>
    client(
        `${brokerAddress}/v1/journals/list`,
        { data: { selector } },
        brokerToken
    );

// We increment the read window by this many bytes every time we get back
// fewer than the desired number of rows.
export const INCREMENT = 1024 * 1024;

export const MEGABYTE = 1 * 10 ** 6;

// 16mb, which is the max document size, ensuring we'll always get at least 1 doc if it exists
export const MAX_DOCUMENT_SIZE = 16 * MEGABYTE;

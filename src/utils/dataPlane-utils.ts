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

// Shard ID prefixes take the form: ${entity_type}/${catalog_name}/${pub_id_of_creation}/
// The pub_id_of_creation suffix distinguishes versions of entities that may be deleted
// and then re-created. They cannot be used to match a Gazette label nor an ID directly.
interface TaskAuthorizationResponse {
    brokerAddress: string; // Base URL for journal endpoints
    brokerToken: string; // Authentication token for journal endpoints
    opsLogsJournal: string;
    opsStatsJournal: string;
    reactorAddress: string; // Base URL for shard endpoints
    reactorToken: string; // Authentication token for shard enpoints
    retryMillis: number;
    shardIdPrefix: string;
}

const { taskAuthorizationEndpoint } = getTaskAuthorizationSettings();

// The broker authorization that comes back from /authorize/user/task is only good
// for reading the ops stats or logs journals of a specific task. Collection
// data cannot be read with it.
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

// Journal name prefixes take the form: ${catalog_name}/${pub_id_of_creation}/
// The pub_id_of_creation suffix distinguishes versions of entities
// that may be deleted and then re-created. They cannot be used to match
// a Gazette label nor an ID directly.
interface CollectionAuthorizationResponse {
    brokerAddress: string; // Base URL for journal endpoints
    brokerToken: string; // Authentication token for journal endpoints
    journalNamePrefix: string;
    retryMillis: number;
}

const { collectionAuthorizationEndpoint } =
    getCollectionAuthorizationSettings();

// The broker authorization that comes back from /authorize/user/collection is only good
// for reading the ops logs journals of a specific collection.
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

// Streaming RPC responses going through grpc-gateway have a `result` vs `error` top-level property added,
// which wraps the actual response. The old data-plane gateway returns unary RPC responses from the /list APIs,
// which don't have a top-level `result` property.
export const isNestedProtocolListResponse = (
    response: { result: ProtocolListResponse } | ProtocolListResponse
): response is { result: ProtocolListResponse } => 'result' in response;

export const getJournals = async (
    brokerAddress: string,
    brokerToken: string,
    selector: ProtocolLabelSelector
): Promise<{ result: ProtocolListResponse } | ProtocolListResponse> =>
    client(
        `${brokerAddress}/v1/journals/list`,
        { data: { selector } },
        brokerToken
    );

export enum DefaultDataPlaneSuffix {
    LOCAL = 'local-cluster',
    PRODUCTION = 'gcp-us-central1-c1',
}

// We increment the read window by this many bytes every time we get back
// fewer than the desired number of rows.
export const INCREMENT = 1024 * 1024;

export const MEGABYTE = 1 * 10 ** 6;

// 16mb, which is the max document size, ensuring we'll always get at least 1 doc if it exists
export const MAX_DOCUMENT_SIZE = 16 * MEGABYTE;

import type { Session } from '@supabase/supabase-js';
import type {
    ProtocolLabelSelector,
    ProtocolListResponse,
} from 'data-plane-gateway/types/gen/broker/protocol/broker';
import type { Shard } from 'data-plane-gateway/types/shard_client';
import type { ResponseError } from 'data-plane-gateway/types/util';
import type { BaseDataPlaneQuery } from 'src/api/dataPlanes';
import type {
    DataPlaneName,
    DataPlaneOption,
} from 'src/stores/DetailsForm/types';
import type { Endpoint } from 'src/stores/ShardDetail/types';
import type { StorageMappingDictionary } from 'src/types';

import { ShardClient, ShardSelector } from 'data-plane-gateway';

import { DataPlaneNode } from 'src/api/dataPlanesGql';
import { client } from 'src/services/client';
import { logRocketConsole, logRocketEvent } from 'src/services/shared';
import {
    DATA_PLANE_PREFIX,
    DATA_PLANE_SETTINGS,
} from 'src/settings/dataPlanes';
import {
    getCollectionAuthorizationSettings,
    getTaskAuthorizationSettings,
} from 'src/utils/env-utils';
import { hasLength } from 'src/utils/misc-utils';

export enum SHARD_LABELS {
    EXPOSE_PORT = 'estuary.dev/expose-port',
    HOSTNAME = 'estuary.dev/hostname',
    TASK_NAME = 'estuary.dev/task-name',
    TASK_TYPE = 'estuary.dev/task-type',
}

export enum ErrorFlags {
    // DEBUGGING = 'parsing jwt:', // useful for testing just add it to the onError
    OPERATION_INVALID = 'Unauthorized',
    TOKEN_EXPIRED = 'token is expired',
    TOKEN_INVALID = 'Authentication failed',
    TOKEN_NOT_FOUND = 'Unauthenticated',
}

export const DATA_PLANE_OPTION_TEMPLATE: DataPlaneOption = {
    dataPlaneName: {
        cluster: '',
        prefix: '',
        provider: '',
        region: '',
        whole: 'template',
    },
    id: '',
    isDefault: false,
    reactorAddress: '',
    scope: 'public',
};

export const shouldRefreshToken = (errorMessage?: string | null) => {
    return (
        errorMessage &&
        (errorMessage.includes(ErrorFlags.TOKEN_INVALID) ||
            errorMessage.includes(ErrorFlags.TOKEN_NOT_FOUND) ||
            errorMessage.includes(ErrorFlags.TOKEN_EXPIRED))
    );
};

// Nothing special on selecting here other than making a hypothesis on
//  what would balance wiggle room needed and not making the page unusable
const TIMEOUT_MS = 3000;
const LIST_TIMEOUT_ERROR_MESSAGE = 'Request timed out';
export async function dataPlaneFetcher_list(
    shardClient: ShardClient,
    selector: ShardSelector,
    key: 'ShardsList'
): Promise<Shard[] | ResponseError['body']> {
    // TODO (GQL) - once we can fetch the status from GQL I don't think we'll
    //  need to handle adding in a synthentic timeout.
    // data plane library allows calls to run forever so we fake this
    //  this does NOT cancel the call and it will keep running in the background
    //  but we should be replacing this with GQL anyway so it is okay (Q4 2025)
    const timeoutPromise = new Promise<ReturnType<typeof shardClient.list>>(
        async (resolve) => {
            setTimeout(() => {
                resolve({
                    err: () => true,
                    unwrap_err: () => ({
                        body: { message: LIST_TIMEOUT_ERROR_MESSAGE },
                    }),
                } as any);
            }, TIMEOUT_MS);
        }
    );

    // Race the actual call against the timeout
    const result = await Promise.race([
        shardClient.list(selector as any),
        timeoutPromise,
    ]);

    if (result.err()) {
        // Unwrap the error, log the error, and reject
        const error = result.unwrap_err();
        logRocketEvent('DataPlaneGateway', {
            key,
            error: 'promiseError',
            timeout: Boolean(error.body.message === LIST_TIMEOUT_ERROR_MESSAGE),
        });
        return Promise.reject(error.body);
    }

    try {
        // No error so should be fine to unwrap
        const unwrappedResponse = result.unwrap();
        return unwrappedResponse;
    } catch (error: unknown) {
        // This is just here to be safe. We'll keep an eye on it and possibly remove
        logRocketConsole(`${key} : unwrapError : `, error);
        logRocketEvent('DataPlaneGateway', {
            key,
            error: 'unwrapException',
        });
        return Promise.reject(error);
    }
}

// Shard ID prefixes take the form: ${entity_type}/${catalog_name}/${pub_id_of_creation}/
// The pub_id_of_creation suffix distinguishes versions of entities that may be deleted
// and then re-created. They cannot be used to match a Gazette label nor an ID directly.
export interface TaskAuthorizationResponse {
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
/** @deprecated Scope is returned by dataplane gql query */
export const getDataPlaneScope = (
    dataPlaneName: string
): DataPlaneOption['scope'] => {
    return dataPlaneName.startsWith(DATA_PLANE_SETTINGS.public.prefix)
        ? 'public'
        : 'private';
};

const splitTruncatedDataPlaneName = (
    dataPlaneName: string,
    basePrefix: string
) => {
    const truncatedName = dataPlaneName.substring(basePrefix.length);

    const slashIndex = truncatedName.lastIndexOf('/');

    const prefix =
        slashIndex === -1 ? '' : truncatedName.substring(0, slashIndex + 1);

    const suffix =
        slashIndex === -1
            ? truncatedName
            : truncatedName.substring(slashIndex + 1);

    return [prefix, suffix];
};

// TODO (data-planes): Consider using a regex to parse the data plane suffix.
const splitDataPlaneSuffix = (suffix: string, firstHyphenIndex: number) => {
    const provider = suffix.substring(0, firstHyphenIndex);

    const lastHyphenIndex = suffix.lastIndexOf('-');

    const regionOnly =
        lastHyphenIndex === -1 || lastHyphenIndex === firstHyphenIndex;

    const region = regionOnly
        ? suffix.substring(firstHyphenIndex + 1)
        : suffix.substring(firstHyphenIndex + 1, lastHyphenIndex);

    const cluster = regionOnly ? '' : suffix.substring(lastHyphenIndex + 1);

    return [provider, region, cluster];
};

export function toPresentableName(dp: DataPlaneNode): string {
    const dataPlaneName = parseDataPlaneName(dp.dataPlaneName, dp.scope);
    return formatDataPlaneName(dataPlaneName);
}

export function toPresentableCloudProvider(dp: DataPlaneNode): string {
    if (dp.cloudProvider.toLowerCase() === 'aws') {
        return 'Amazon Web Services';
    } else if (dp.cloudProvider.toLowerCase() === 'gcp') {
        return 'Google Cloud Platform';
    } else if (dp.cloudProvider.toLowerCase() === 'azure') {
        return 'Microsoft Azure';
    } else {
        return dp.cloudProvider;
    }
}

/** @deprecated details are now returned by dataplane gql query */
export const parseDataPlaneName = (
    dataPlaneName: string,
    scope: DataPlaneOption['scope']
): DataPlaneName => {
    let cluster = '';
    let prefix = '';
    let provider = '';
    let region = '';

    const basePrefix = `${DATA_PLANE_PREFIX}${scope}/`;

    if (dataPlaneName.startsWith(basePrefix)) {
        let suffix = '';

        [prefix, suffix] = splitTruncatedDataPlaneName(
            dataPlaneName,
            basePrefix
        );

        const firstHyphenIndex = suffix.indexOf('-');

        if (firstHyphenIndex > -1) {
            [provider, region, cluster] = splitDataPlaneSuffix(
                suffix,
                firstHyphenIndex
            );
        }
    }

    return { cluster, prefix, provider, region, whole: dataPlaneName };
};
/** @deprecated use toPresentableName(dataPlane: DataPlaneNode) */
export const formatDataPlaneName = (dataPlaneName: DataPlaneName) => {
    const { cluster, provider, region, whole } = dataPlaneName;

    const formattedName = hasLength(provider)
        ? `${provider}: ${region} ${cluster}`
        : whole;

    return formattedName.trim();
};

// TODO (data-planes): Determine whether this function should always be called
//   from a hook. Given the matched storage mapping must be matched to figure
//   out what the default data-plane name is, it makes more sense to call this
//   util from a hook that can reference storage mapping state directly.
/** @deprecated  */
export const generateDataPlaneOption = (
    { data_plane_name, id, reactor_address, cidr_blocks }: BaseDataPlaneQuery,
    defaultDataPlaneName?: string
): DataPlaneOption => {
    const scope = getDataPlaneScope(data_plane_name);

    const dataPlaneName = parseDataPlaneName(data_plane_name, scope);

    return {
        cidrBlocks: cidr_blocks,
        dataPlaneName,
        id,
        isDefault: defaultDataPlaneName
            ? data_plane_name === defaultDataPlaneName
            : false,
        reactorAddress: reactor_address,
        scope,
    };
};

export const getDataPlaneInfo = (
    storageMappings: StorageMappingDictionary,
    catalogName: string | undefined
): { dataPlaneNames: string[]; storageMappingPrefix: string | undefined } => {
    let matchedPrefix: string | undefined;

    const prefixOptions = Object.keys(storageMappings).filter((catalogPrefix) =>
        catalogName?.startsWith(catalogPrefix)
    );

    if (prefixOptions.length > 1) {
        matchedPrefix = prefixOptions.reduce((a, b) =>
            a.length > b.length ? a : b
        );
    } else if (prefixOptions.length === 1) {
        matchedPrefix = prefixOptions[0];
    }

    const dataPlaneNames =
        matchedPrefix && storageMappings?.[matchedPrefix]
            ? storageMappings[matchedPrefix].data_planes
            : [];

    return { dataPlaneNames, storageMappingPrefix: matchedPrefix };
};

// We increment the read window by this many bytes every time we get back
// fewer than the desired number of rows.
export const INCREMENT = 1024 * 1024;

export const MEGABYTE = 1 * 10 ** 6;

// 16mb, which is the max document size, ensuring we'll always get at least 1 doc if it exists
export const MAX_DOCUMENT_SIZE = 16 * MEGABYTE;

export const fetchShardList = async (
    name: string,
    session: Session,
    existingAuthentication?: { address: string; token: string }
) => {
    let reactorAddress = existingAuthentication?.address;
    let reactorToken = existingAuthentication?.token;

    if (!reactorAddress || !reactorToken) {
        const response = await authorizeTask(session.access_token, name);

        reactorAddress = response.reactorAddress;
        reactorToken = response.reactorToken;
    }

    const reactorURL = new URL(reactorAddress);

    // Pass the shard client to the respective function directly.
    const shardClient = new ShardClient(reactorURL, reactorToken);
    const taskSelector = new ShardSelector().task(name);

    const dataPlaneListResponse = await dataPlaneFetcher_list(
        shardClient,
        taskSelector,
        'ShardsList'
    );

    if (!Array.isArray(dataPlaneListResponse)) {
        return Promise.reject(dataPlaneListResponse);
    }

    return {
        shards: dataPlaneListResponse.length > 0 ? dataPlaneListResponse : [],
    };
};

// Support the legacy data-plane by re-writing its internal service
// addresses to use the data-plane-gateway in external contexts.
export const formatEndpointAddress = (reactorAddress: string) =>
    reactorAddress.includes('svc.cluster.local:')
        ? 'https://us-central1.v1.estuary-data.dev'
        : reactorAddress;

// Task endpoint utils
export const isHttp = (ep: Endpoint): boolean => {
    if (ep.protocol) {
        return ep.protocol == 'h2' || ep.protocol == 'http/1.1';
    } else {
        return true;
    }
};

export const formatHttpUrl = (fullHostName: string): string => {
    return `https://${fullHostName}/`;
};

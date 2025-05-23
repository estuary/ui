import type { ReplicaStatusCode } from 'data-plane-gateway/types/gen/consumer/protocol/consumer';
import type { Shard } from 'data-plane-gateway/types/shard_client';
import type { ShardDetailStoreNames } from 'src/stores/names';
import type {
    EndpointsDictionary,
    ShardDetailStore,
    ShardDictionary,
    ShardEntityTypes,
    ShardStatusColor,
    TaskShardDetails,
} from 'src/stores/ShardDetail/types';
import type { NamedSet } from 'zustand/middleware';

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import produce from 'immer';

import { errorMain, successMain, warningMain } from 'src/context/Theme';
import { logRocketConsole } from 'src/services/shared';
import {
    ShardStatusMessageIds,
    ShardStatusNoteIds,
} from 'src/stores/ShardDetail/types';
import { SHARD_LABELS } from 'src/utils/dataPlane-utils';
import { hasLength } from 'src/utils/misc-utils';
import { devtoolsOptions } from 'src/utils/store-utils';

const PORT_PUBLIC_PREFIX = 'estuary.dev/port-public/';
const PORT_PROTO_PREFIX = 'estuary.dev/port-proto/';

const getShardEndpointsForDictionary = (shard: TaskShardDetails) => {
    const byPort: EndpointsDictionary = {};
    const { hostname, exposePort } = shard;

    if (!hostname || !exposePort) {
        return byPort;
    }

    byPort[exposePort] = {
        //The rest of the URL is added in when the component renders
        hostPrefix: `${hostname}-${exposePort}`,
        isPublic: shard.portIsPublic ?? false,
        protocol: shard.portProtocol ?? null,
    };

    return byPort;
};

const findAllErrorsAndWarnings = (shard: Shard) => {
    const { status } = shard;
    const errors: any[] = [];
    const warnings: any[] = [];

    status.forEach(({ errors: statusErrors }) => {
        statusErrors?.forEach((error) => {
            if (
                error.includes(
                    'absoluteKeywordLocation": "flow://inferred-schema'
                )
            ) {
                warnings.push(error);
            } else {
                errors.push(error);
            }
        });
    });

    return { errors, warnings };
};

const shardHasInferredSchemaError = (shard: Shard) => {
    const { errors, warnings } = findAllErrorsAndWarnings(shard);

    // If there are ANY errors then make sure we do not hide those
    return {
        errors,
        warnings,
        response: errors.length === 0 && warnings.length > 0,
    };
};

const getEverythingForDictionary = (
    shard: Shard,
    defaultStatusColor: ShardStatusColor
): TaskShardDetails => {
    const { spec, status } = shard;

    const response: TaskShardDetails = {
        id: spec.id,
        color: defaultStatusColor,
        disabled: Boolean(spec.disable),
        messageId: ShardStatusMessageIds.NONE,
        errors: [],
        warnings: [],
    };

    if (hasLength(status)) {
        const statusCodes: (ReplicaStatusCode | undefined)[] = status.map(
            ({ code }) => code
        );

        if (statusCodes.find((code) => code === 'FAILED')) {
            const {
                errors,
                warnings,
                response: hasInferredSchema,
            } = shardHasInferredSchemaError(shard);

            response.errors = errors;
            response.warnings = warnings;

            if (!hasInferredSchema) {
                response.color = errorMain;
                response.messageId = ShardStatusMessageIds.FAILED;
                response.messageNoteId = undefined;
            } else {
                response.color = warningMain;
                response.messageId = ShardStatusMessageIds.SCHEMA;
                response.messageNoteId = ShardStatusNoteIds.SCHEMA;
            }
        } else if (statusCodes.find((code) => code === 'PRIMARY')) {
            response.color = successMain;
            response.messageId = ShardStatusMessageIds.PRIMARY;
        } else if (statusCodes.find((code) => code === 'IDLE')) {
            response.color = warningMain;
            response.messageId = ShardStatusMessageIds.IDLE;
        } else if (statusCodes.find((code) => code === 'STANDBY')) {
            response.color = warningMain;
            response.messageId = ShardStatusMessageIds.STANDBY;
        } else if (statusCodes.find((code) => code === 'BACKFILL')) {
            response.color = warningMain;
            response.messageId = ShardStatusMessageIds.BACKFILL;
        }
    } else {
        response.messageId = spec.disable
            ? ShardStatusMessageIds.DISABLED
            : ShardStatusMessageIds.NONE;
    }

    spec.labels?.labels?.forEach((label) => {
        switch (label.name) {
            case SHARD_LABELS.TASK_NAME:
                response.entityName = label.value;
                break;
            case SHARD_LABELS.TASK_TYPE:
                response.entityType = label.value as ShardEntityTypes;
                break;
            case SHARD_LABELS.EXPOSE_PORT:
                response.exposePort = label.value;
                break;
            case SHARD_LABELS.HOSTNAME:
                response.hostname = label.value;
                break;
            default:
                if (label.name?.startsWith(PORT_PROTO_PREFIX)) {
                    response.portProtocol = label.value;
                } else if (label.name?.startsWith(PORT_PUBLIC_PREFIX)) {
                    response.portIsPublic = label.value === 'true';
                }
        }
    });

    response.shardEndpoints = getShardEndpointsForDictionary(response);

    return response;
};

export const getCompositeColor = (
    taskShardDetails: TaskShardDetails[],
    defaultStatusColor: ShardStatusColor
) => {
    if (taskShardDetails.length === 1) {
        return taskShardDetails[0].color;
    }

    if (taskShardDetails.length > 1) {
        const statusMessageIds: ShardStatusMessageIds[] = taskShardDetails.map(
            ({ messageId: statusCode }) => statusCode
        );

        if (
            statusMessageIds.find(
                (messageId) => messageId === ShardStatusMessageIds.FAILED
            )
        ) {
            return errorMain;
        }

        if (
            statusMessageIds.find(
                (messageId) => messageId === ShardStatusMessageIds.PRIMARY
            )
        ) {
            return successMain;
        }

        if (
            statusMessageIds.find(
                (messageId) =>
                    messageId === ShardStatusMessageIds.IDLE ||
                    messageId === ShardStatusMessageIds.STANDBY ||
                    messageId === ShardStatusMessageIds.BACKFILL ||
                    messageId === ShardStatusMessageIds.SCHEMA
            )
        ) {
            return warningMain;
        }

        return defaultStatusColor;
    }

    return defaultStatusColor;
};

export const getInitialState = (
    set: NamedSet<ShardDetailStore>
    // get: StoreApi<ShardDetailStore>['getState']
): ShardDetailStore => {
    return {
        shardDictionary: {},
        shardDictionaryHydrated: false,
        // This will get overwritten but defaulting to something so we don't have to handle null
        defaultStatusColor: '#C4D3E9',
        defaultMessageId: ShardStatusMessageIds.NONE,
        setDictionaryHydrated: (val) => {
            set(
                produce((state) => {
                    state.shardDictionaryHydrated = val;
                }),
                false,
                'Shard Dictionary Hydrated Set'
            );
        },
        setDefaultMessageId: (val) => {
            set(
                produce((state) => {
                    state.defaultMessageId = val;
                }),
                false,
                'Shard Dictionary Default Message ID Set'
            );
        },
        setDefaultStatusColor: (val) => {
            set(
                produce((state) => {
                    state.defaultStatusColor = val;
                }),
                false,
                'Shard Dictionary Default Status Color Set'
            );
        },
        setShards: (shards) => {
            set(
                produce((state) => {
                    const newDictionary: ShardDictionary = {};

                    shards.forEach((shard) => {
                        const dictionaryVal = getEverythingForDictionary(
                            shard,
                            state.defaultStatusColor
                        );

                        if (dictionaryVal.entityName) {
                            newDictionary[dictionaryVal.entityName] =
                                newDictionary[dictionaryVal.entityName] ?? [];
                            newDictionary[dictionaryVal.entityName]?.push(
                                dictionaryVal
                            );
                        } else {
                            logRocketConsole('Unable to find name from shard');
                        }
                    });

                    state.shards = shards;
                    state.shardDictionary = newDictionary;
                }),
                false,
                'Shard List Set'
            );
        },
        error: null,
        setError: (error) => {
            set(
                produce((state) => {
                    state.error = error;
                }),
                false,
                'Shard List Error Set'
            );
        },
    };
};

export const createShardDetailStore = (key: ShardDetailStoreNames) => {
    return create<ShardDetailStore>()(
        devtools((set, _get) => getInitialState(set), devtoolsOptions(key))
    );
};

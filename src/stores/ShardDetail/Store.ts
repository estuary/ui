import { errorMain, successMain, warningMain } from 'context/Theme';
import {
    ConsumerReplicaStatus,
    ReplicaStatusCode,
} from 'data-plane-gateway/types/gen/consumer/protocol/consumer';
import { Shard } from 'data-plane-gateway/types/shard_client';
import produce from 'immer';
import { ShardDetailStoreNames } from 'stores/names';
import { Entity } from 'types';
import { devtoolsOptions } from 'utils/store-utils';
import { create, StoreApi } from 'zustand';
import { devtools, NamedSet } from 'zustand/middleware';
import {
    Endpoint,
    EndpointsDictionary,
    ShardDetails,
    ShardDetailStore,
    ShardDictionary,
    ShardStatusColor,
    ShardStatusMessageIds,
    TaskShardDetails,
} from './types';

const PORT_PUBLIC_PREFIX = 'estuary.dev/port-public/';
const PORT_PROTO_PREFIX = 'estuary.dev/port-proto/';

const getShardEndpointsForDictionary = (shard: TaskShardDetails) => {
    const byPort: EndpointsDictionary = {};
    const { hostname, exposePort, shardIsUp } = shard;

    if (!hostname || !exposePort) {
        return byPort;
    }

    byPort[exposePort] = {
        hostPrefix: `${hostname}-${exposePort}`, //The rest of the URL is added in when the component renders
        isUp: Boolean(shardIsUp),
        isPublic: shard.portIsPublic ?? false,
        protocol: shard.portProtocol ?? null,
    };

    return byPort;
};

export const mergeEndpoints = (endpointMaps: Map<string, Endpoint>[]) => {
    if (endpointMaps.length > 0) {
        // Merge the endpoints of each shard into a single map.
        // Generally, we expect that all shards for a given task will
        // have identicall configuration of exposed ports. But technically
        // nothing requires that to be the case.
        const endpoints = endpointMaps.reduce((left, right) => {
            right.forEach((value, key) => {
                const leftEp = left.get(key);
                if (leftEp) {
                    const merged = {
                        hostPrefix: leftEp.hostPrefix,
                        isPublic: leftEp.isPublic,
                        protocol: leftEp.protocol,
                        // isUp is really the only field that it makes sense to merge.
                        // This resolution makes sense because we are constructing endpoints
                        // that address any/all shards of a task, so if any of them are up,
                        // then requests ought to be routed to it and thus the endpoint itself
                        // could be considered "up".
                        isUp: leftEp.isUp || value.isUp,
                    };
                    left.set(key, merged);
                } else {
                    left.set(key, value);
                }
            });
            return left;
        }, new Map<string, Endpoint>());

        return Array.from(endpoints.values());
    }
    return [];
};

const findAllErrorsAndWarnings = (shard: Shard) => {
    const { status } = shard;
    const errors: any[] = [];
    const warnings: any[] = [];

    status.forEach(({ errors: statusErrors }) => {
        statusErrors?.forEach((error) => {
            if (
                error.includes(
                    'absoluteKeywordLocation": "flow://inferred-schema#/'
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

    console.log('{ errors, warnings }', { errors, warnings });

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
        messageId: ShardStatusMessageIds.NONE,
        errors: [],
        warnings: [],
    };

    if (status.length > 0) {
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

            response.color = hasInferredSchema ? warningMain : errorMain;
            response.messageId = hasInferredSchema
                ? ShardStatusMessageIds.SCHEMA
                : ShardStatusMessageIds.FAILED;
        } else if (statusCodes.find((code) => code === 'PRIMARY')) {
            response.color = successMain;
            response.messageId = ShardStatusMessageIds.PRIMARY;
            // We consider the endpoint to be "up" if the shard has a primary.
            // This does not necessarily mean that the container is up and reachable, but
            // it's the closest approximation we have.
            response.shardIsUp = true;
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
            case 'estuary.dev/task-name':
            case 'estuary.dev/task-type':
                response.entityType = label.value;
                break;
            case 'estuary.dev/expose-port':
                response.exposePort = label.value;
                break;
            case 'estuary.dev/hostname':
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

    const endpointStuff = getShardEndpointsForDictionary(response);
    console.log('endpointStuff', endpointStuff);
    response.shardEndpoints = endpointStuff;

    return response;
};

// TODO: Consider unifying this function with the one below in a similar fashion as evaluateTaskShardStatus.
const evaluateShardStatusColor = (
    shard: Shard,
    defaultStatusColor: ShardStatusColor
): ShardStatusColor => {
    const { status } = shard;

    if (status.length > 0) {
        const statusCodes: (ReplicaStatusCode | undefined)[] = status.map(
            ({ code }) => code
        );

        if (statusCodes.find((code) => code === 'FAILED')) {
            return shardHasInferredSchemaError(shard).response
                ? warningMain
                : errorMain;
        } else if (statusCodes.find((code) => code === 'PRIMARY')) {
            return successMain;
        } else if (
            statusCodes.find(
                (code) =>
                    code === 'IDLE' || code === 'STANDBY' || code === 'BACKFILL'
            )
        ) {
            return warningMain;
        } else {
            return defaultStatusColor;
        }
    } else {
        return defaultStatusColor;
    }
};

const evaluateShardStatusCode = (shard: Shard): ShardStatusMessageIds => {
    const { spec, status } = shard;

    if (status.length > 0) {
        const statusCodes: (ReplicaStatusCode | undefined)[] = status.map(
            ({ code }) => code
        );

        if (statusCodes.find((code) => code === 'FAILED')) {
            return shardHasInferredSchemaError(shard).response
                ? ShardStatusMessageIds.SCHEMA
                : ShardStatusMessageIds.FAILED;
        } else if (statusCodes.find((code) => code === 'PRIMARY')) {
            return ShardStatusMessageIds.PRIMARY;
        } else if (statusCodes.find((code) => code === 'IDLE')) {
            return ShardStatusMessageIds.IDLE;
        } else if (statusCodes.find((code) => code === 'STANDBY')) {
            return shardHasInferredSchemaError(shard).response
                ? ShardStatusMessageIds.SCHEMA
                : ShardStatusMessageIds.STANDBY;
        } else if (statusCodes.find((code) => code === 'BACKFILL')) {
            return ShardStatusMessageIds.BACKFILL;
        } else {
            return ShardStatusMessageIds.NONE;
        }
    } else {
        return spec.disable
            ? ShardStatusMessageIds.DISABLED
            : ShardStatusMessageIds.NONE;
    }
};

const evaluateTaskShardStatus = (
    shard: Shard,
    defaultStatusColor: ShardStatusColor
): TaskShardDetails => {
    return {
        messageId: evaluateShardStatusCode(shard),
        color: evaluateShardStatusColor(shard, defaultStatusColor),
        disabled: shard.spec.disable,
    };
};

const findShardErrors = (status: ConsumerReplicaStatus[]) => {
    return status.find(({ code }) => code === 'FAILED')?.errors;
};

const findShardDetails = (shards: Shard[]) => {
    return shards.map((shard) => ({
        id: shard.spec.id,
        errors: findShardErrors(shard.status),
    }));
};

const findShard = (shards: Shard[], shardId: string) => {
    return shards.find(({ spec }) =>
        spec.id ? spec.id === shardId : undefined
    );
};

const getCollectionName = (spec: Shard['spec']) => {
    return (spec.labels ? spec.labels.labels : [])?.find(
        (label) => label.name === 'estuary.dev/task-name'
    )?.value;
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
    set: NamedSet<ShardDetailStore>,
    get: StoreApi<ShardDetailStore>['getState'],
    entityType: Entity
): ShardDetailStore => {
    return {
        shards: [],
        shardDictionary: {},
        shardDictionaryHydrated: false,
        // This will get overwritten but defaulting to something so we don't have to handle null
        defaultStatusColor: '#C4D3E9',
        setDictionaryHydrated: (val) => {
            set(
                produce((state) => {
                    state.shardDictionaryHydrated = val;
                }),
                false,
                'Shard Dictionary Hydrated Set'
            );
        },
        setShards: (shards, defaultStatusColor) => {
            set(
                produce((state) => {
                    const newDictionary: ShardDictionary = {};

                    shards.forEach((shard) => {
                        const key = getCollectionName(shard.spec);

                        if (key) {
                            newDictionary[key] = newDictionary[key] ?? [];
                            newDictionary[key]?.push({
                                ...getEverythingForDictionary(
                                    shard,
                                    defaultStatusColor
                                ),
                            });
                        } else {
                            console.error('Unable to find name from shard');
                        }
                    });

                    state.shards = shards;
                    state.shardDictionary = newDictionary;
                    state.defaultStatusColor = defaultStatusColor;
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
        getTaskShards: (catalogNamespace, shards) => {
            return catalogNamespace && shards.length > 0
                ? shards.filter(({ spec }) => {
                      return getCollectionName(spec) === catalogNamespace;
                  })
                : [];
        },
        getTaskShardDetails: (taskShards, defaultStatusColor) => {
            const { error } = get();

            const defaultTaskShardDetail = {
                messageId: ShardStatusMessageIds.NONE,
                color: defaultStatusColor,
                shard: null,
            };

            if (taskShards.length > 0) {
                const statusIndicators = taskShards.map((shard) => ({
                    ...evaluateTaskShardStatus(shard, defaultStatusColor),
                    shard,
                }));

                return statusIndicators.length > 0
                    ? statusIndicators
                    : [defaultTaskShardDetail];
            } else if (entityType === 'collection') {
                const messageId = error
                    ? ShardStatusMessageIds.NONE
                    : ShardStatusMessageIds.COLLECTION;
                const color = error ? defaultStatusColor : successMain;

                return [
                    {
                        messageId,
                        color,
                        shard: null,
                    },
                ];
            } else {
                return [defaultTaskShardDetail];
            }
        },
        getTaskStatusColor: (taskShardDetails, defaultStatusColor) => {
            const { error } = get();

            if (error) {
                return defaultStatusColor;
            }

            if (taskShardDetails.length === 1) {
                return taskShardDetails[0].color;
            }

            if (taskShardDetails.length > 1) {
                const statusMessageIds: ShardStatusMessageIds[] =
                    taskShardDetails.map(
                        ({ messageId: statusCode }) => statusCode
                    );

                if (
                    statusMessageIds.find(
                        (messageId) =>
                            messageId === ShardStatusMessageIds.FAILED
                    )
                ) {
                    return errorMain;
                }

                if (
                    statusMessageIds.find(
                        (messageId) =>
                            messageId === ShardStatusMessageIds.PRIMARY
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

            if (entityType === 'collection') {
                return successMain;
            }

            return defaultStatusColor;
        },
        getShardDetails: (shards: Shard[]): ShardDetails[] => {
            return findShardDetails(shards);
        },
        getShardStatusColor: (shardId, defaultStatusColor) => {
            const { shards } = get();

            if (shards.length > 0) {
                findShard(shards, shardId);
                const selectedShard = findShard(shards, shardId);

                return selectedShard
                    ? evaluateShardStatusColor(
                          selectedShard,
                          defaultStatusColor
                      )
                    : defaultStatusColor;
            } else {
                return defaultStatusColor;
            }
        },
        getShardStatusMessageId: (shardId) => {
            const { shards } = get();

            if (shards.length > 0) {
                const selectedShard = findShard(shards, shardId);

                return selectedShard
                    ? evaluateShardStatusCode(selectedShard)
                    : ShardStatusMessageIds.NONE;
            } else {
                return ShardStatusMessageIds.NONE;
            }
        },
        evaluateShardProcessingState: (shardId) => {
            const { shards } = get();

            if (shards.length > 0) {
                return !!findShard(shards, shardId)?.spec.disable;
            } else {
                return false;
            }
        },
    };
};

export const createShardDetailStore = (
    key: ShardDetailStoreNames,
    entityType: Entity
) => {
    return create<ShardDetailStore>()(
        devtools(
            (set, get) => getInitialState(set, get, entityType),
            devtoolsOptions(key)
        )
    );
};

import produce from 'immer';
import { Entity } from 'types';
import { create, StoreApi } from 'zustand';

import { errorMain, successMain, warningMain } from 'context/Theme';

import { ShardDetailStoreNames } from 'stores/names';

import { devtoolsOptions } from 'utils/store-utils';

import { ReplicaStatusCode } from 'data-plane-gateway/types/gen/consumer/protocol/consumer';
import { Shard } from 'data-plane-gateway/types/shard_client';
import { devtools, NamedSet } from 'zustand/middleware';

import {
    Endpoint,
    ShardDetails,
    ShardDetailStore,
    ShardStatusColor,
    ShardStatusMessageIds,
    TaskShardDetails,
} from './types';

const PORT_PUBLIC_PREFIX = 'estuary.dev/port-public/';
const PORT_PROTO_PREFIX = 'estuary.dev/port-proto/';

const getShardEndpoints = (
    dataPlaneHostname: string,
    shard: Shard
): Map<string, Endpoint> => {
    const byPort = new Map<string, Endpoint>();
    const labels = shard.spec.labels?.labels;
    if (!labels) {
        return byPort;
    }
    const hostname = labels.find((label) => {
        return label.name === 'estuary.dev/hostname' && label.value;
    })?.value;

    const exposeIdx = labels.findIndex((label) => {
        return label.name === 'estuary.dev/expose-port';
    });
    if (!hostname || exposeIdx === -1) {
        return byPort;
    }

    // We consider the endpoint to be "up" if the shard has a primary.
    // This does not necessarily mean that the container is up and reachable, but
    // it's the closest approximation we have.
    const shardIsUp =
        shard.status.findIndex(({ code }) => code === 'PRIMARY') >= 0;

    for (let i = exposeIdx; i < labels.length; i++) {
        const port = labels[i].value;
        if (labels[i].name === 'estuary.dev/expose-port' && port) {
            byPort.set(port, {
                fullHostname: `${hostname}-${port}.${dataPlaneHostname}`,
                isUp: shardIsUp,
                // Add defaults for these fields, which may be updated as we continue to parse labels.
                isPublic: false,
                protocol: null,
            });
        } else {
            break;
        }
    }

    labels.forEach((label) => {
        if (label.name?.startsWith(PORT_PROTO_PREFIX)) {
            const portValue = label.name.substring(PORT_PROTO_PREFIX.length);
            const port = byPort.get(portValue);
            if (port && label.value) {
                port.protocol = label.value;
            }
        } else if (label.name?.startsWith(PORT_PUBLIC_PREFIX)) {
            const portValue = label.name.substring(PORT_PUBLIC_PREFIX.length);
            const port = byPort.get(portValue);
            if (port) {
                port.isPublic = label.value === 'true';
            }
        }
    });

    return byPort;
};

const getTaskEndpoints = (dataPlaneHostname: string, taskShards: Shard[]) => {
    const endpointMaps = taskShards.map(
        (shard: Shard): Map<string, Endpoint> => {
            return getShardEndpoints(dataPlaneHostname, shard);
        }
    );
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
                        fullHostname: leftEp.fullHostname,
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

// TODO: Consider unifying this function with the one below in a similar fashion as evaluateTaskShardStatus.
const evaluateShardStatusColor = (
    { status }: Shard,
    defaultStatusColor: ShardStatusColor
): ShardStatusColor => {
    if (status.length === 1) {
        switch (status[0].code) {
            case 'PRIMARY':
                return successMain;
            case 'IDLE':
            case 'STANDBY':
            case 'BACKFILL':
                return warningMain;
            case 'FAILED':
                return errorMain;
            default:
                return defaultStatusColor;
        }
    } else if (status.length > 1) {
        const statusCodes: (ReplicaStatusCode | undefined)[] = status.map(
            ({ code }) => code
        );

        if (statusCodes.find((code) => code === 'FAILED')) {
            return errorMain;
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

const evaluateShardStatusCode = ({
    spec,
    status,
}: Shard): ShardStatusMessageIds => {
    if (status.length === 1) {
        switch (status[0].code) {
            case 'FAILED':
                return ShardStatusMessageIds.FAILED;
            case 'PRIMARY':
                return ShardStatusMessageIds.PRIMARY;
            case 'IDLE':
                return ShardStatusMessageIds.IDLE;
            case 'STANDBY':
                return ShardStatusMessageIds.STANDBY;
            case 'BACKFILL':
                return ShardStatusMessageIds.BACKFILL;
            default:
                return ShardStatusMessageIds.NONE;
        }
    } else if (status.length > 1) {
        const statusCodes: (ReplicaStatusCode | undefined)[] = status.map(
            ({ code }) => code
        );

        if (statusCodes.find((code) => code === 'FAILED')) {
            return ShardStatusMessageIds.FAILED;
        } else if (statusCodes.find((code) => code === 'PRIMARY')) {
            return ShardStatusMessageIds.PRIMARY;
        } else if (statusCodes.find((code) => code === 'IDLE')) {
            return ShardStatusMessageIds.IDLE;
        } else if (statusCodes.find((code) => code === 'STANDBY')) {
            return ShardStatusMessageIds.STANDBY;
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

export const getInitialState = (
    set: NamedSet<ShardDetailStore>,
    get: StoreApi<ShardDetailStore>['getState'],
    entityType: Entity
): ShardDetailStore => {
    return {
        shards: [],
        setShards: (shards) => {
            set(
                produce((state) => {
                    state.shards = shards;
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
                      const labels = spec.labels ? spec.labels.labels : [];

                      const taskName = labels?.find(
                          (label) => label.name === 'estuary.dev/task-name'
                      )?.value;

                      return taskName === catalogNamespace;
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
            } else if (taskShardDetails.length === 1) {
                return taskShardDetails[0].color;
            } else if (taskShardDetails.length > 1) {
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
                } else if (
                    statusMessageIds.find(
                        (messageId) =>
                            messageId === ShardStatusMessageIds.PRIMARY
                    )
                ) {
                    return successMain;
                } else if (
                    statusMessageIds.find(
                        (messageId) =>
                            messageId === ShardStatusMessageIds.IDLE ||
                            messageId === ShardStatusMessageIds.STANDBY ||
                            messageId === ShardStatusMessageIds.BACKFILL
                    )
                ) {
                    return warningMain;
                } else {
                    return defaultStatusColor;
                }
            } else if (entityType === 'collection') {
                return successMain;
            } else {
                return defaultStatusColor;
            }
        },
        getShardDetails: (shards: Shard[]): ShardDetails[] => {
            return shards.map((shard) => ({
                id: shard.spec.id,
                errors: shard.status.find(({ code }) => code === 'FAILED')
                    ?.errors,
            }));
        },
        getTaskEndpoints: (
            taskName: string,
            dataPlaneHostname: string | null
        ) => {
            const { shards, getTaskShards } = get();
            if (dataPlaneHostname) {
                const taskShards = getTaskShards(taskName, shards);
                return getTaskEndpoints(dataPlaneHostname, taskShards);
            } else {
                return [];
            }
        },
        getShardStatusColor: (shardId, defaultStatusColor) => {
            const { shards } = get();

            if (shards.length > 0) {
                const selectedShard = shards.find(({ spec }) =>
                    spec.id ? spec.id === shardId : undefined
                );

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
                const selectedShard = shards.find(({ spec }) =>
                    spec.id ? spec.id === shardId : undefined
                );

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
                const selectedShard = shards.find(({ spec }) =>
                    spec.id ? spec.id === shardId : undefined
                );

                return !!selectedShard?.spec.disable;
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

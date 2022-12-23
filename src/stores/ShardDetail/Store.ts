import { errorMain, successMain, warningMain } from 'context/Theme';
import { ReplicaStatusCode } from 'data-plane-gateway/types/gen/consumer/protocol/consumer';
import { Shard } from 'data-plane-gateway/types/shard_client';
import produce from 'immer';
import { ShardDetailStoreNames } from 'stores/names';
import { Entity } from 'types';
import { devtoolsOptions } from 'utils/store-utils';
import create, { StoreApi } from 'zustand';
import { devtools, NamedSet } from 'zustand/middleware';
import {
    ShardDetails,
    ShardDetailStore,
    ShardStatusColor,
    ShardStatusMessageIds,
    TaskShardDetails,
} from './types';

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
                return [
                    {
                        messageId: error
                            ? ShardStatusMessageIds.NONE
                            : ShardStatusMessageIds.COLLECTION,
                        color: error ? defaultStatusColor : successMain,
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

import {
    errorMain,
    SemanticColor,
    successMain,
    warningMain,
} from 'context/Theme';
import { ReplicaStatusCode } from 'data-plane-gateway/types/gen/consumer/protocol/consumer';
import { Shard } from 'data-plane-gateway/types/shard_client';
import produce from 'immer';
import { GetState } from 'zustand';
import { NamedSet } from 'zustand/middleware';

// TODO: Determine a way to access an interface property with a function type.
export type SetShards = (shards: Shard[]) => void;

// TODO: Rename this type to ShardStatusCode
export enum ShardStatusMessageIds {
    PRIMARY = 'shardStatus.primary',
    FAILED = 'shardStatus.failed',
    IDLE = 'shardStatus.idle',
    STANDBY = 'shardStatus.standby',
    BACKFILL = 'shardStatus.backfill',
    DISABLED = 'shardStatus.disabled',
    NONE = 'shardStatus.none',
}

// The additional hex string corresponds to slate[25].
export type ShardStatusColor = SemanticColor | '#EEF8FF';

export interface TaskShardDetails {
    messageId: ShardStatusMessageIds;
    color: ShardStatusColor;
    disabled?: boolean;
}

export interface ShardDetails {
    id: string | undefined;
    errors: string[] | undefined;
}

export interface ShardDetailStore {
    shards: Shard[];
    setShards: SetShards;
    getTaskShards: (catalogNamespace: string, shards: Shard[]) => Shard[];
    getTaskShardDetails: (taskShards: Shard[]) => TaskShardDetails[];
    getTaskStatusColor: (
        taskShardDetails: TaskShardDetails[]
    ) => ShardStatusColor;
    getShardDetails: (shards: Shard[]) => ShardDetails[];
    getShardStatusColor: (shardId: string) => ShardStatusColor;
    getShardStatusMessageId: (shardId: string) => ShardStatusMessageIds;
    evaluateShardProcessingState: (shardId: string) => boolean;
}

export const defaultStatusColor: ShardStatusColor = '#EEF8FF';

const defaultTaskShardDetail: TaskShardDetails = {
    messageId: ShardStatusMessageIds.NONE,
    color: defaultStatusColor,
};

const evaluateTaskShardStatus = ({ spec, status }: Shard): TaskShardDetails => {
    if (status.length === 1) {
        switch (status[0].code) {
            case 'PRIMARY':
                return {
                    messageId: ShardStatusMessageIds.PRIMARY,
                    color: successMain,
                };
            case 'FAILED':
                return {
                    messageId: ShardStatusMessageIds.FAILED,
                    color: errorMain,
                };
            case 'IDLE':
                return {
                    messageId: ShardStatusMessageIds.IDLE,
                    color: warningMain,
                };
            case 'STANDBY':
                return {
                    messageId: ShardStatusMessageIds.STANDBY,
                    color: warningMain,
                };
            case 'BACKFILL':
                return {
                    messageId: ShardStatusMessageIds.BACKFILL,
                    color: warningMain,
                };
            default:
                return {
                    messageId: ShardStatusMessageIds.NONE,
                    color: defaultStatusColor,
                };
        }
    } else if (status.length > 1) {
        const statusCodes: (ReplicaStatusCode | undefined)[] = status.map(
            ({ code }) => code
        );

        if (statusCodes.find((code) => code === 'PRIMARY')) {
            return {
                messageId: ShardStatusMessageIds.PRIMARY,
                color: successMain,
            };
        } else if (statusCodes.find((code) => code === 'FAILED')) {
            return {
                messageId: ShardStatusMessageIds.FAILED,
                color: errorMain,
            };
        } else if (statusCodes.find((code) => code === 'IDLE')) {
            return {
                messageId: ShardStatusMessageIds.IDLE,
                color: warningMain,
            };
        } else if (statusCodes.find((code) => code === 'STANDBY')) {
            return {
                messageId: ShardStatusMessageIds.STANDBY,
                color: warningMain,
            };
        } else if (statusCodes.find((code) => code === 'BACKFILL')) {
            return {
                messageId: ShardStatusMessageIds.BACKFILL,
                color: warningMain,
            };
        } else {
            return {
                messageId: ShardStatusMessageIds.NONE,
                color: defaultStatusColor,
            };
        }
    } else {
        return {
            messageId: spec.disable
                ? ShardStatusMessageIds.DISABLED
                : ShardStatusMessageIds.NONE,
            color: defaultStatusColor,
            disabled: spec.disable,
        };
    }
};

// TODO: Consider unifying this function with the one below in a similar fashion as evaluateTaskShardStatus.
const evaluateShardStatusColor = ({ status }: Shard): ShardStatusColor => {
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

        if (statusCodes.find((code) => code === 'PRIMARY')) {
            return successMain;
        } else if (statusCodes.find((code) => code === 'FAILED')) {
            return errorMain;
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
            case 'PRIMARY':
                return ShardStatusMessageIds.PRIMARY;
            case 'FAILED':
                return ShardStatusMessageIds.FAILED;
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

        if (statusCodes.find((code) => code === 'PRIMARY')) {
            return ShardStatusMessageIds.PRIMARY;
        } else if (statusCodes.find((code) => code === 'FAILED')) {
            return ShardStatusMessageIds.FAILED;
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

export const getInitialState = (
    set: NamedSet<ShardDetailStore>,
    get: GetState<ShardDetailStore>
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
        getTaskShards: (catalogNamespace, shards) => {
            return shards.length > 0
                ? shards.filter(({ spec }) => {
                      const labels = spec.labels ? spec.labels.labels : [];

                      const taskName = labels?.find(
                          (label) => label.name === 'estuary.dev/task-name'
                      )?.value;

                      return taskName === catalogNamespace;
                  })
                : [];
        },
        getTaskShardDetails: (taskShards) => {
            if (taskShards.length > 0) {
                const statusIndicators = taskShards.map((shard) =>
                    evaluateTaskShardStatus(shard)
                );

                return statusIndicators.length > 0
                    ? statusIndicators
                    : [defaultTaskShardDetail];
            } else {
                return [defaultTaskShardDetail];
            }
        },
        getTaskStatusColor: (taskShardDetails) => {
            if (taskShardDetails.length === 1) {
                return taskShardDetails[0].color;
            } else if (taskShardDetails.length > 1) {
                const statusMessageIds: ShardStatusMessageIds[] =
                    taskShardDetails.map(
                        ({ messageId: statusCode }) => statusCode
                    );

                if (
                    statusMessageIds.find(
                        (messageId) =>
                            messageId === ShardStatusMessageIds.PRIMARY
                    )
                ) {
                    return successMain;
                } else if (
                    statusMessageIds.find(
                        (messageId) =>
                            messageId === ShardStatusMessageIds.FAILED
                    )
                ) {
                    return errorMain;
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
        getShardStatusColor: (shardId) => {
            const { shards } = get();

            if (shards.length > 0) {
                const selectedShard = shards.find(({ spec }) =>
                    spec.id ? spec.id === shardId : undefined
                );

                return selectedShard
                    ? evaluateShardStatusColor(selectedShard)
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

export const shardDetailSelectors = {
    shards: (state: ShardDetailStore) => state.shards,
    setShards: (state: ShardDetailStore) => state.setShards,
    getTaskShards: (state: ShardDetailStore) => state.getTaskShards,
    getTaskShardDetails: (state: ShardDetailStore) => state.getTaskShardDetails,
    getTaskStatusColor: (state: ShardDetailStore) => state.getTaskStatusColor,
    getShardDetails: (state: ShardDetailStore) => state.getShardDetails,
    getShardStatusColor: (state: ShardDetailStore) => state.getShardStatusColor,
    getShardStatusMessageId: (state: ShardDetailStore) =>
        state.getShardStatusMessageId,
    evaluateShardProcessingState: (state: ShardDetailStore) =>
        state.evaluateShardProcessingState,
};

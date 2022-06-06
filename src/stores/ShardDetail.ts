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

// TODO: Follow-up with team. Determine fallback status to display in tooltip.
type DefaultTooltipMessage = 'No shard status found.';

// TODO: Rename this type to ShardStatusCode
export type ShardStatus =
    | ReplicaStatusCode
    | DefaultTooltipMessage
    | 'DISABLED';

// The additional hex string corresponds to slate[25].
export type ShardStatusColor = SemanticColor | '#EEF8FF';

// TODO: Rename this interface to ShardStatus
export interface ShardStatusIndicator {
    statusCode: ShardStatus;
    color: ShardStatusColor;
}

export interface ShardDetails {
    id: string | undefined;
    errors: string[] | undefined;
}

export interface ShardDetailStore {
    shards: Shard[];
    setShards: SetShards;
    getTaskShards: (catalogNamespace: string, shards: Shard[]) => Shard[];
    getTaskStatusColor: (taskShards: Shard[]) => ShardStatusIndicator[];
    getShardStatusColor: (shardId: string) => ShardStatusColor;
    getShardStatus: (shardId: string) => ShardStatus;
    getShardDetails: (shards: Shard[]) => ShardDetails[];
    evaluateShardProcessingState: (catalogNamespace: string) => boolean;
}

export const defaultStatusColor: ShardStatusColor = '#EEF8FF';

const defaultStatusIndicator: ShardStatusIndicator = {
    statusCode: 'No shard status found.',
    color: defaultStatusColor,
};

// TODO: Rename this function to evaluateShardStatusColor
const evaluateShardStatus = ({ status }: Shard): ShardStatusColor => {
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

// TODO: Rename this function to evaluateShardStatus.
const evaluateTaskShardStatus = ({
    spec,
    status,
}: Shard): ShardStatusIndicator => {
    if (status.length === 1) {
        switch (status[0].code) {
            case 'PRIMARY':
                return { statusCode: 'PRIMARY', color: successMain };
            case 'FAILED':
                return { statusCode: 'FAILED', color: errorMain };
            case 'IDLE':
                return { statusCode: 'IDLE', color: warningMain };
            case 'STANDBY':
                return { statusCode: 'STANDBY', color: warningMain };
            case 'BACKFILL':
                return { statusCode: 'BACKFILL', color: warningMain };
            default:
                return {
                    statusCode: 'No shard status found.',
                    color: defaultStatusColor,
                };
        }
    } else if (status.length > 1) {
        const statusCodes: (ReplicaStatusCode | undefined)[] = status.map(
            ({ code }) => code
        );

        if (statusCodes.find((code) => code === 'PRIMARY')) {
            return { statusCode: 'PRIMARY', color: successMain };
        } else if (statusCodes.find((code) => code === 'FAILED')) {
            return { statusCode: 'FAILED', color: errorMain };
        } else if (statusCodes.find((code) => code === 'IDLE')) {
            return { statusCode: 'IDLE', color: warningMain };
        } else if (statusCodes.find((code) => code === 'STANDBY')) {
            return { statusCode: 'STANDBY', color: warningMain };
        } else if (statusCodes.find((code) => code === 'BACKFILL')) {
            return { statusCode: 'BACKFILL', color: warningMain };
        } else {
            return {
                statusCode: 'No shard status found.',
                color: defaultStatusColor,
            };
        }
    } else {
        return {
            statusCode: spec.disable ? 'DISABLED' : 'No shard status found.',
            color: defaultStatusColor,
        };
    }
};

const evaluateShardStatusCode = ({ spec, status }: Shard): ShardStatus => {
    if (status.length === 1) {
        return status[0].code ?? 'No shard status found.';
    } else if (status.length > 1) {
        const statusCodes: (ReplicaStatusCode | undefined)[] = status.map(
            ({ code }) => code
        );

        if (statusCodes.find((code) => code === 'PRIMARY')) {
            return 'PRIMARY';
        } else if (statusCodes.find((code) => code === 'FAILED')) {
            return 'FAILED';
        } else if (statusCodes.find((code) => code === 'IDLE')) {
            return 'IDLE';
        } else if (statusCodes.find((code) => code === 'STANDBY')) {
            return 'STANDBY';
        } else if (statusCodes.find((code) => code === 'BACKFILL')) {
            return 'BACKFILL';
        } else {
            return 'No shard status found.';
        }
    } else {
        return spec.disable ? 'DISABLED' : 'No shard status found.';
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
        getTaskStatusColor: (taskShards) => {
            if (taskShards.length > 0) {
                const statusIndicators = taskShards.map((shard) =>
                    evaluateTaskShardStatus(shard)
                );

                return statusIndicators.length > 0
                    ? statusIndicators
                    : [defaultStatusIndicator];
            } else {
                return [defaultStatusIndicator];
            }
        },
        getShardStatusColor: (shardId) => {
            const { shards } = get();

            if (shards.length > 0) {
                const selectedShard = shards.find(({ spec }) =>
                    spec.id ? spec.id === shardId : undefined
                );

                return selectedShard
                    ? evaluateShardStatus(selectedShard)
                    : defaultStatusColor;
            } else {
                return defaultStatusColor;
            }
        },
        getShardStatus: (shardId) => {
            const { shards } = get();

            if (shards.length > 0) {
                const selectedShard = shards.find(({ spec }) =>
                    spec.id ? spec.id === shardId : undefined
                );

                return selectedShard
                    ? evaluateShardStatusCode(selectedShard)
                    : 'No shard status found.';
            } else {
                return 'No shard status found.';
            }
        },
        getShardDetails: (shards: Shard[]): ShardDetails[] => {
            return shards.map((shard) => ({
                id: shard.spec.id,
                errors: shard.status.find(({ code }) => code === 'FAILED')
                    ?.errors,
            }));
        },
        evaluateShardProcessingState: (catalogNamespace) => {
            const { shards } = get();

            if (shards.length > 0) {
                const selectedShard = shards.find(({ spec }) =>
                    spec.id ? spec.id.includes(catalogNamespace) : undefined
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
    getTaskStatusColor: (state: ShardDetailStore) => state.getTaskStatusColor,
    getShardStatusColor: (state: ShardDetailStore) => state.getShardStatusColor,
    getShardStatus: (state: ShardDetailStore) => state.getShardStatus,
    getShardDetails: (state: ShardDetailStore) => state.getShardDetails,
    evaluateShardProcessingState: (state: ShardDetailStore) =>
        state.evaluateShardProcessingState,
};

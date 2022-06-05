import { errorMain, slate, successMain, warningMain } from 'context/Theme';
import { ReplicaStatusCode } from 'data-plane-gateway/types/gen/consumer/protocol/consumer';
import { Shard } from 'data-plane-gateway/types/shard_client';
import produce from 'immer';
import { GetState } from 'zustand';
import { NamedSet } from 'zustand/middleware';

// TODO: Determine a way to access an interface property with a function type.
export type SetShards = (shards: Shard[]) => void;

// TODO: Follow-up with team. Determine fallback status to display in tooltip.
type DefaultTooltipMessage = 'No shard status found.';

export type ShardStatus =
    | ReplicaStatusCode
    | DefaultTooltipMessage
    | 'DISABLED';

export interface ShardDetails {
    id: string | undefined;
    errors: string[] | undefined;
}

export interface ShardDetailStore {
    shards: Shard[];
    setShards: SetShards;
    getShardStatusColor: (catalogNamespace: string) => string;
    getShardStatus: (catalogNamespace: string) => ShardStatus[];
    getTaskShards: (catalogNamespace: string) => Shard[];
    evaluateShardProcessingState: (catalogNamespace: string) => boolean;
}

const defaultStatusColor = slate[25];

const evaluateShardStatus = ({ status }: Shard): string => {
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
        getShardStatusColor: (catalogNamespace) => {
            const { shards } = get();

            if (shards.length > 0) {
                const selectedShard = shards.find(({ spec }) =>
                    spec.id ? spec.id.includes(catalogNamespace) : undefined
                );

                return selectedShard
                    ? evaluateShardStatus(selectedShard)
                    : defaultStatusColor;
            } else {
                return defaultStatusColor;
            }
        },
        getShardStatus: (catalogNamespace) => {
            const { shards } = get();

            if (shards.length > 0) {
                const selectedShard = shards.find(({ spec }) =>
                    spec.id ? spec.id.includes(catalogNamespace) : undefined
                );

                let statusIndicator: ShardStatus[] = ['No shard status found.'];

                if (selectedShard) {
                    if (selectedShard.spec.disable) {
                        statusIndicator = ['DISABLED'];
                    } else if (selectedShard.status.length > 0) {
                        statusIndicator = selectedShard.status.map(
                            ({ code }) => code ?? 'No shard status found.'
                        );
                    }
                }

                return statusIndicator;
            } else {
                return ['No shard status found.'];
            }
        },
        getTaskShards: (catalogNamespace) => {
            const { shards } = get();

            if (shards.length > 0) {
                return shards.filter(({ spec }) =>
                    spec.id ? spec.id.includes(catalogNamespace) : undefined
                );

                // const shardDetails: ShardDetails[] | null = taskShards.map(
                //     (shard) => ({
                //         id: shard.spec.id,
                //         errors: shard.status.find(
                //             ({ code }) => code === 'FAILED'
                //         )?.errors,
                //     })
                // );

                // return shardDetails;
            } else {
                return [];
            }
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
    getShardStatusColor: (state: ShardDetailStore) => state.getShardStatusColor,
    getShardStatus: (state: ShardDetailStore) => state.getShardStatus,
    getTaskShards: (state: ShardDetailStore) => state.getTaskShards,
    evaluateShardProcessingState: (state: ShardDetailStore) =>
        state.evaluateShardProcessingState,
};

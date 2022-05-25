import { errorMain, slate, successMain, warningMain } from 'context/Theme';
import { ReplicaStatusCode } from 'data-plane-gateway/types/gen/consumer/protocol/consumer';
import { Shard } from 'data-plane-gateway/types/shard_client';
import produce from 'immer';
import { GetState } from 'zustand';
import { NamedSet } from 'zustand/middleware';

// TODO: Determine a way to access an interface property with a function type.
export type SetShards = (shards: Shard[]) => void;

export interface ShardStatusIndicator {
    code: ReplicaStatusCode | 'UNKNOWN';
    color: string;
}

export interface ShardDetailStore {
    shards: Shard[];
    setShards: SetShards;
    getShardStatusColor: (catalogNamespace: string) => string;
    getShardStatusIndicators: (
        catalogNamespace: string
    ) => ShardStatusIndicator[];
}

const defaultStatusColor = slate[25];
const defaultStatusIndicator: ShardStatusIndicator = {
    code: 'UNKNOWN',
    color: defaultStatusColor,
};

const evaluateSingleShardStatus = (
    statusCode: ReplicaStatusCode | undefined
): string => {
    switch (statusCode) {
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
};

const evaluateShardStatus = ({ status }: Shard): string => {
    if (status.length === 1) {
        return evaluateSingleShardStatus(status[0].code);
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
        getShardStatusIndicators: (catalogNamespace) => {
            const { shards } = get();

            if (shards.length > 0) {
                const selectedShard = shards.find(({ spec }) =>
                    spec.id ? spec.id.includes(catalogNamespace) : undefined
                );

                const statusIndicator: ShardStatusIndicator[] = selectedShard
                    ? selectedShard.status.map(({ code }) => ({
                          code: code ?? 'UNKNOWN',
                          color: evaluateSingleShardStatus(code),
                      }))
                    : [defaultStatusIndicator];

                return selectedShard
                    ? statusIndicator
                    : [defaultStatusIndicator];
            } else {
                return [defaultStatusIndicator];
            }
        },
    };
};

export const shardDetailSelectors = {
    shards: (state: ShardDetailStore) => state.shards,
    setShards: (state: ShardDetailStore) => state.setShards,
    getShardStatusColor: (state: ShardDetailStore) => state.getShardStatusColor,
    getShardStatusIndicators: (state: ShardDetailStore) =>
        state.getShardStatusIndicators,
};

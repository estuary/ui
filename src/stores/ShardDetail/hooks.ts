import { useEntityType } from 'context/EntityContext';
import { useZustandStore } from 'context/Zustand/provider';
import { ShardDetailStoreNames } from 'stores/names';
import { Entity } from 'types';
import { ShardDetailStore } from './types';

const storeName = (entityType: Entity): ShardDetailStoreNames => {
    switch (entityType) {
        case 'capture':
            return ShardDetailStoreNames.CAPTURE;
        case 'materialization':
            return ShardDetailStoreNames.MATERIALIZATION;
        case 'collection':
            return ShardDetailStoreNames.COLLECTION;
        default: {
            throw new Error('Invalid ShardDetail store name');
        }
    }
};

export const useShardDetail_shards = () => {
    const entityType = useEntityType();

    return useZustandStore<ShardDetailStore, ShardDetailStore['shards']>(
        storeName(entityType),
        (state) => state.shards
    );
};

export const useShardDetail_setShards = () => {
    const entityType = useEntityType();

    return useZustandStore<ShardDetailStore, ShardDetailStore['setShards']>(
        storeName(entityType),
        (state) => state.setShards
    );
};

export const useShardDetail_getTaskShards = () => {
    const entityType = useEntityType();

    return useZustandStore<ShardDetailStore, ShardDetailStore['getTaskShards']>(
        storeName(entityType),
        (state) => state.getTaskShards
    );
};

export const useShardDetail_getTaskShardDetails = () => {
    const entityType = useEntityType();

    return useZustandStore<
        ShardDetailStore,
        ShardDetailStore['getTaskShardDetails']
    >(storeName(entityType), (state) => state.getTaskShardDetails);
};

export const useShardDetail_getTaskStatusColor = () => {
    const entityType = useEntityType();

    return useZustandStore<
        ShardDetailStore,
        ShardDetailStore['getTaskStatusColor']
    >(storeName(entityType), (state) => state.getTaskStatusColor);
};

export const useShardDetail_getShardDetails = () => {
    const entityType = useEntityType();

    return useZustandStore<
        ShardDetailStore,
        ShardDetailStore['getShardDetails']
    >(storeName(entityType), (state) => state.getShardDetails);
};

export const useShardDetail_getShardStatusColor = () => {
    const entityType = useEntityType();

    return useZustandStore<
        ShardDetailStore,
        ShardDetailStore['getShardStatusColor']
    >(storeName(entityType), (state) => state.getShardStatusColor);
};

export const useShardDetail_getShardStatusMessageId = () => {
    const entityType = useEntityType();

    return useZustandStore<
        ShardDetailStore,
        ShardDetailStore['getShardStatusMessageId']
    >(storeName(entityType), (state) => state.getShardStatusMessageId);
};

export const useShardDetail_evaluateShardProcessingState = () => {
    const entityType = useEntityType();

    return useZustandStore<
        ShardDetailStore,
        ShardDetailStore['evaluateShardProcessingState']
    >(storeName(entityType), (state) => state.evaluateShardProcessingState);
};

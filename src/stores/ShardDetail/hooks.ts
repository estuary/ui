import type {
    ShardDetailStore,
    ShardEntityTypes,
    ShardReadDictionaryResponse,
} from 'src/stores/ShardDetail/types';
import type { Entity } from 'src/types';

import { isEmpty } from 'lodash';

import { useEntityType } from 'src/context/EntityContext';
import { successMain } from 'src/context/Theme';
import { useZustandStore } from 'src/context/Zustand/provider';
import { ShardDetailStoreNames } from 'src/stores/names';
import { getCompositeColor } from 'src/stores/ShardDetail/Store';
import { ShardStatusMessageIds } from 'src/stores/ShardDetail/types';
import { hasLength } from 'src/utils/misc-utils';

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

export const useShardDetail_setShards = () => {
    const entityType = useEntityType();

    return useZustandStore<ShardDetailStore, ShardDetailStore['setShards']>(
        storeName(entityType),
        (state) => state.setShards
    );
};

export const useShardDetail_setDefaultMessageId = () => {
    const entityType = useEntityType();

    return useZustandStore<
        ShardDetailStore,
        ShardDetailStore['setDefaultMessageId']
    >(storeName(entityType), (state) => state.setDefaultMessageId);
};

export const useShardDetail_setDefaultStatusColor = () => {
    const entityType = useEntityType();

    return useZustandStore<
        ShardDetailStore,
        ShardDetailStore['setDefaultStatusColor']
    >(storeName(entityType), (state) => state.setDefaultStatusColor);
};

export const useShardDetail_error = () => {
    const entityType = useEntityType();

    return useZustandStore<ShardDetailStore, ShardDetailStore['error']>(
        storeName(entityType),
        (state) => state.error
    );
};

export const useShardDetail_setError = () => {
    const entityType = useEntityType();

    return useZustandStore<ShardDetailStore, ShardDetailStore['setError']>(
        storeName(entityType),
        (state) => state.setError
    );
};

export const useShardDetail_dictionaryHydrated = () => {
    const entityType = useEntityType();

    return useZustandStore<
        ShardDetailStore,
        ShardDetailStore['shardDictionaryHydrated']
    >(storeName(entityType), (state) => state.shardDictionaryHydrated);
};

export const useShardDetail_setDictionaryHydrated = () => {
    const entityType = useEntityType();

    return useZustandStore<
        ShardDetailStore,
        ShardDetailStore['setDictionaryHydrated']
    >(storeName(entityType), (state) => state.setDictionaryHydrated);
};

export const useShardDetail_readDictionary = (
    taskName: string,
    taskTypes?: ShardEntityTypes[]
) => {
    const entityType = useEntityType();

    return useZustandStore<ShardDetailStore, ShardReadDictionaryResponse>(
        storeName(entityType),
        (state) => {
            const filteredValues = (
                state.shardDictionary[taskName] ?? []
            ).filter((value) =>
                taskTypes && value.entityType
                    ? taskTypes.includes(value.entityType)
                    : true
            );

            let disabled = false;
            let shardsHaveErrors = false;
            let shardsHaveWarnings = false;

            filteredValues.forEach((filteredValue) => {
                disabled = Boolean(!disabled && filteredValue.disabled);

                shardsHaveErrors =
                    !shardsHaveErrors && !isEmpty(filteredValue.errors);

                shardsHaveWarnings =
                    !shardsHaveWarnings && !isEmpty(filteredValue.warnings);
            });

            const isCollection = Boolean(
                taskTypes?.includes('collection') && !hasLength(filteredValues)
            );

            return {
                allShards: filteredValues,
                compositeColor: isCollection
                    ? successMain
                    : state.error
                      ? state.defaultStatusColor
                      : getCompositeColor(
                            filteredValues,
                            state.defaultStatusColor
                        ),
                disabled,
                defaultMessageId: isCollection
                    ? ShardStatusMessageIds.COLLECTION
                    : state.defaultMessageId,
                shardsHaveErrors,
                shardsHaveWarnings,
            };
        }
    );
};

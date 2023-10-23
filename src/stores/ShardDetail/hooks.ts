import { useEntityType } from 'context/EntityContext';
import { successMain } from 'context/Theme';
import { useZustandStore } from 'context/Zustand/provider';
import { isEmpty } from 'lodash';
import { ShardDetailStoreNames } from 'stores/names';
import { Entity } from 'types';
import { getCompositeColor } from './Store';
import { ShardDetailStore, ShardReadDictionaryResponse } from './types';

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
    taskType?: string
) => {
    const entityType = useEntityType();

    return useZustandStore<ShardDetailStore, ShardReadDictionaryResponse>(
        storeName(entityType),
        (state) => {
            const filteredValues = (
                state.shardDictionary[taskName] ?? []
            ).filter((value) => value.entityType === taskType);

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

            return {
                allShards: filteredValues,
                compositeColor:
                    taskType === 'collection'
                        ? successMain
                        : state.error
                        ? state.defaultStatusColor
                        : getCompositeColor(
                              filteredValues,
                              state.defaultStatusColor
                          ),
                disabled,
                shardsHaveErrors,
                shardsHaveWarnings,
            };
        }
    );
};

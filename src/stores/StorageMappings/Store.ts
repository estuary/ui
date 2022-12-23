import { getStorageMappings } from 'api/storageMappings';
import produce from 'immer';
import { devtoolsOptions } from 'utils/store-utils';
import create from 'zustand';
import { devtools, NamedSet } from 'zustand/middleware';
import { AdminStoreNames } from '../names';
import { StorageMappingForm, StorageMappingsState } from './types';

const getInitialStateData = (): Pick<
    StorageMappingsState,
    'spec' | 'loading'
> => ({
    spec: null,
    loading: true,
});

const getInitialState = (
    set: NamedSet<StorageMappingsState>
    // get: StoreApi<StorageMappingsState>['getState'],
): StorageMappingsState => ({
    ...getInitialStateData(),

    hydrate: async () => {
        const { data, error } = await getStorageMappings();

        if (error) {
            return set(
                produce((state) => {
                    state.spec = null;
                    state.loading = false;
                }),
                false,
                'Table Store Hydration Failure'
            );
        }

        // TODO (storage mappings) need to support multiple
        const newSpec: StorageMappingForm = {
            prefix: data[0].catalog_prefix,
            lastUpdated: data[0].updated_at,
            bucket: data[0].spec.stores[0].bucket,
            provider: data[0].spec.stores[0].provider,
        };

        set(
            produce((state: StorageMappingsState) => {
                state.spec = newSpec;
                state.loading = false;
            }),
            false,
            'Form State Changed'
        );
    },

    setSpec: (newState) => {
        set(
            produce((state: StorageMappingsState) => {
                state.spec = newState;
            }),
            false,
            'Form State Changed'
        );
    },
});

export const createStorageMappingsStore = (key: AdminStoreNames) => {
    return create<StorageMappingsState>()(
        devtools((set, _get) => getInitialState(set), devtoolsOptions(key))
    );
};

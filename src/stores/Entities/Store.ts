import type { EntitiesState } from 'src/stores/Entities/types';
import type { StorageMappingDictionary } from 'src/types';
import type { NamedSet } from 'zustand/middleware';

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import produce from 'immer';

import { getAuthRoles } from 'src/api/combinedGrantsExt';
import {
    getInitialHydrationData,
    getStoreWithHydrationSettings,
} from 'src/stores/extensions/Hydration';
import { GlobalStoreNames } from 'src/stores/names';
import { devtoolsOptions } from 'src/utils/store-utils';

const getInitialStateData = (): Pick<
    EntitiesState,
    | 'capabilities'
    | 'hydrated'
    | 'hydrationErrors'
    | 'hydrationErrorsExist'
    | 'storageMappings'
    | 'mutate'
> => ({
    hydrated: false,
    hydrationErrors: null,
    hydrationErrorsExist: false,
    capabilities: {
        admin: new Set(),
        read: new Set(),
        write: new Set(),
    },
    storageMappings: {},
    mutate: null,
});

const getInitialState = (
    set: NamedSet<EntitiesState>
    // get: StoreApi<EntitiesState>['getState']
): EntitiesState => ({
    ...getInitialStateData(),
    ...getStoreWithHydrationSettings('Entities', set),

    hydrateState: async () => {
        // Fetch everything the user can read
        return getAuthRoles('read');
    },

    setHydrated: (val) => {
        set(
            produce((state: EntitiesState) => {
                state.hydrated = val;
            }),
            false,
            'Entities hydrated set'
        );
    },

    setHydrationErrors: (val) => {
        set(
            produce((state: EntitiesState) => {
                state.hydrationErrors = val;
            }),
            false,
            'Entities hydration errors'
        );
    },

    setMutate: (value) => {
        set(
            produce((state: EntitiesState) => {
                state.mutate = value;
            }),
            false,
            'Entities mutator set'
        );
    },

    setCapabilities: (val) => {
        if (!val) {
            set(
                produce((state: EntitiesState) => {
                    state.capabilities = getInitialStateData().capabilities;
                }),
                false,
                'Entities capabilities clearing'
            );
            return;
        }

        const newCapabilities = {
            admin: new Set<string>(),
            read: new Set<string>(),
            write: new Set<string>(),
        };

        val.forEach((authRole) => {
            if (authRole?.capability && authRole?.role_prefix) {
                newCapabilities[authRole.capability].add(authRole.role_prefix);
            }
        });

        set(
            produce((state: EntitiesState) => {
                state.capabilities = newCapabilities;
            }),
            false,
            'Entities capabilities populating'
        );
    },

    setStorageMappings: (values) => {
        set(
            produce((state: EntitiesState) => {
                const evaluatedMappings: StorageMappingDictionary = {};

                values?.forEach(({ catalog_prefix, spec }) => {
                    evaluatedMappings[catalog_prefix] = spec;
                });

                state.storageMappings = evaluatedMappings;
            }),
            false,
            'setStorageMappings'
        );
    },

    resetState: () => {
        set(
            { ...getInitialStateData(), ...getInitialHydrationData() },
            false,
            'Entities Reset'
        );
    },
});

export const useEntitiesStore = create<EntitiesState>()(
    devtools(
        (set, _get) => getInitialState(set),
        devtoolsOptions(GlobalStoreNames.ENTITIES)
    )
);

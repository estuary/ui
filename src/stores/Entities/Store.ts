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
        admin: [],
        read: [],
        write: [],
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
        set(
            produce((state: EntitiesState) => {
                if (!val) {
                    state.capabilities = getInitialStateData().capabilities;
                    return;
                }

                val.forEach(async (authRole) => {
                    if (!authRole) {
                        return;
                    }

                    if (
                        !state.capabilities[authRole.capability].includes(
                            authRole.role_prefix
                        )
                    ) {
                        state.capabilities[authRole.capability].push(
                            authRole.role_prefix
                        );
                    }
                });
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

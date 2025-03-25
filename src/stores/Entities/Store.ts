import type { NamedSet } from 'zustand/middleware';
import type { EntitiesState } from './types';
import { getAuthRoles } from 'api/combinedGrantsExt';
import produce from 'immer';
import {
    getInitialHydrationData,
    getStoreWithHydrationSettings,
} from 'stores/extensions/Hydration';
import { devtoolsOptions } from 'utils/store-utils';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { GlobalStoreNames } from '../names';

const getInitialStateData = (): Pick<
    EntitiesState,
    | 'capabilities'
    | 'hydrated'
    | 'hydrationErrors'
    | 'hydrationErrorsExist'
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
                    state.capabilities[authRole.capability].push(
                        authRole.role_prefix
                    );
                });
            }),
            false,
            'Entities capabilities populating'
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

import { getAuthRoles } from 'api/combinedGrantsExt';
import produce from 'immer';
import { devtoolsOptions } from 'utils/store-utils';
import { create } from 'zustand';
import { devtools, NamedSet } from 'zustand/middleware';
import { GlobalStoreNames } from '../names';
import { EntitiesState } from './types';

const getInitialStateData = (): Pick<
    EntitiesState,
    'prefixes' | 'hydrated' | 'hydrationErrors'
> => ({
    hydrated: false,
    hydrationErrors: null,
    prefixes: {
        admin: {},
        read: {},
        write: {},
    },
});

const getInitialState = (
    set: NamedSet<EntitiesState>
    // get: StoreApi<EntitiesState>['getState']
): EntitiesState => ({
    ...getInitialStateData(),

    hydrateState: async () => {
        // Reset the hydrated flag before kicking off a new fetch
        set(
            produce((state: EntitiesState) => {
                state.hydrated = false;
            })
        );

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

    setCapabilities: (val) => {
        set(
            produce((state: EntitiesState) => {
                if (!val) {
                    state.prefixes = getInitialStateData().prefixes;
                    return;
                }

                val.forEach(async (authRole) => {
                    state.prefixes[authRole.capability] = {
                        ...state.prefixes[authRole.capability],
                        [authRole.role_prefix]: {},
                    };
                });
            }),
            false,
            'Entities capabilities populating'
        );
    },

    resetState: () => {
        set(getInitialStateData(), false, 'Top Bar State Reset');
    },
});

export const createEntitiesStore = (key: GlobalStoreNames) => {
    return create<EntitiesState>()(
        devtools((set, _get) => getInitialState(set), devtoolsOptions(key))
    );
};

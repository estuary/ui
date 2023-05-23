import { getAuthRoles } from 'api/combinedGrantsExt';
import produce from 'immer';
import { logRocketConsole } from 'services/logrocket';
import { devtoolsOptions } from 'utils/store-utils';
import { create, StoreApi } from 'zustand';
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
    set: NamedSet<EntitiesState>,
    get: StoreApi<EntitiesState>['getState']
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
        getAuthRoles('read')
            .then(
                (response) => {
                    const { setCapabilities } = get();
                    setCapabilities(response.data);
                },
                (error: unknown) => {
                    logRocketConsole('Failed to hydrate entities', error);

                    set(
                        produce((state: EntitiesState) => {
                            state.hydrationErrors = error;
                        })
                    );
                }
            )
            .finally(() => {
                set(
                    produce((state: EntitiesState) => {
                        state.hydrated = true;
                    })
                );
            });
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
        devtools((set, get) => getInitialState(set, get), devtoolsOptions(key))
    );
};

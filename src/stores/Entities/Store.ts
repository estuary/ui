import { getAuthRoles } from 'api/combinedGrantsExt';
import produce from 'immer';
import { getStoreWithHydrationSettings } from 'stores/Hydration';
import { devtoolsOptions } from 'utils/store-utils';
import { create } from 'zustand';
import { devtools, NamedSet } from 'zustand/middleware';
import { GlobalStoreNames } from '../names';
import { EntitiesState } from './types';

const getInitialStateData = (): Pick<
    EntitiesState,
    'capabilities' | 'hydrated' | 'hydrationErrors' | 'hydrationErrorsExist'
> => ({
    hydrated: false,
    hydrationErrors: null,
    hydrationErrorsExist: false,
    capabilities: {
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

    setCapabilities: (val) => {
        set(
            produce((state: EntitiesState) => {
                if (!val) {
                    state.capabilities = getInitialStateData().capabilities;
                    return;
                }

                val.forEach(async (authRole) => {
                    state.capabilities[authRole.capability] = {
                        ...state.capabilities[authRole.capability],
                        [authRole.role_prefix]: {},
                    };
                });
            }),
            false,
            'Entities capabilities populating'
        );
    },

    resetState: () => {
        set(getInitialStateData(), false, 'Entities Reset');
    },
});

export const createEntitiesStore = (key: GlobalStoreNames) => {
    return create<EntitiesState>()(
        devtools((set, _get) => getInitialState(set), devtoolsOptions(key))
    );
};

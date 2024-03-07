import { getAuthRoles } from 'api/combinedGrantsExt';
import produce from 'immer';
import {
    getInitialHydrationData,
    getStoreWithHydrationSettings,
} from 'stores/extensions/Hydration';
import { devtoolsOptions } from 'utils/store-utils';
import { create } from 'zustand';
import { devtools, NamedSet } from 'zustand/middleware';
import { GlobalStoreNames } from '../names';
import { ConnectorsState } from './types';

const getInitialStateData = (): Pick<
    ConnectorsState,
    | 'connectors'
    | 'hydrated'
    | 'hydrationErrors'
    | 'hydrationErrorsExist'
    | 'mutate'
> => ({
    connectors: {},
    hydrated: false,
    hydrationErrors: null,
    hydrationErrorsExist: false,
    mutate: null,
});

const getInitialState = (
    set: NamedSet<ConnectorsState>
    // get: StoreApi<ConnectorsState>['getState']
): ConnectorsState => ({
    ...getInitialStateData(),
    ...getStoreWithHydrationSettings('Connectors', set),

    hydrateState: async () => {
        // Fetch everything the user can read
        return getAuthRoles('read');
    },

    setHydrated: (val) => {
        set(
            produce((state: ConnectorsState) => {
                state.hydrated = val;
            }),
            false,
            'Connectors hydrated set'
        );
    },

    setHydrationErrors: (val) => {
        set(
            produce((state: ConnectorsState) => {
                state.hydrationErrors = val;
            }),
            false,
            'Connectors hydration errors'
        );
    },

    setMutate: (value) => {
        set(
            produce((state: ConnectorsState) => {
                state.mutate = value;
            }),
            false,
            'Connectors mutator set'
        );
    },

    setConnectors: (val) => {
        set(
            produce((state: ConnectorsState) => {
                // Just making typing happy
                state.connectors.foo = val[0];
            }),
            false,
            'Connectors populating'
        );
    },

    resetState: () => {
        set(
            { ...getInitialStateData(), ...getInitialHydrationData() },
            false,
            'Connectors Reset'
        );
    },
});

export const createEntitiesStore = (key: GlobalStoreNames) => {
    return create<ConnectorsState>()(
        devtools((set, _get) => getInitialState(set), devtoolsOptions(key))
    );
};

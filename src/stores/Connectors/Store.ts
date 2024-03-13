import { getConnectors_withTags } from 'api/connectors';
import produce from 'immer';
import {
    getInitialHydrationData,
    getStoreWithHydrationSettings,
} from 'stores/extensions/Hydration';
import { hasLength } from 'utils/misc-utils';
import { devtoolsOptions } from 'utils/store-utils';
import { create, StoreApi } from 'zustand';
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
    set: NamedSet<ConnectorsState>,
    get: StoreApi<ConnectorsState>['getState']
): ConnectorsState => ({
    ...getInitialStateData(),
    ...getStoreWithHydrationSettings('Connectors', set),

    hydrateState: async (protocol) => {
        const { active } = get();

        if (!active) {
            return;
        }

        //Doubt we want to use this query. Thinking we should use
        //  the table query so we can use the same data to display the cards
        //  as well as the dropdown.
        const response = await getConnectors_withTags(protocol);
        return response;
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

    setConnectors: (connectors) => {
        set(
            produce((state: ConnectorsState) => {
                state.connectors = {};

                if (!hasLength(connectors)) {
                    return;
                }

                connectors.forEach((connector) => {
                    const { id, ...theRest } = connector;
                    state.connectors[connector.id] = { ...theRest };
                });
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

export const createConnectorsStore = (key: GlobalStoreNames) => {
    return create<ConnectorsState>()(
        devtools((set, get) => getInitialState(set, get), devtoolsOptions(key))
    );
};

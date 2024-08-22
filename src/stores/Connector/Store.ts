import { getConnectorTagDetails } from 'api/connector_tags';
import produce from 'immer';
import {
    getInitialHydrationData,
    getStoreWithHydrationSettings,
} from 'stores/extensions/Hydration';
import { hasLength } from 'utils/misc-utils';
import { devtoolsOptions } from 'utils/store-utils';
import { StoreApi, create } from 'zustand';
import { NamedSet, devtools } from 'zustand/middleware';
import { ConnectorState } from './types';

const STORE_KEY = 'connector';

const getInitialStateData = (): Pick<ConnectorState, 'tag'> => ({
    tag: null,
});

const getInitialState = (
    set: NamedSet<ConnectorState>,
    get: StoreApi<ConnectorState>['getState']
): ConnectorState => ({
    ...getStoreWithHydrationSettings(STORE_KEY, set),
    ...getInitialStateData(),

    resetState: () => {
        set(
            { ...getInitialStateData(), ...getInitialHydrationData() },
            false,
            'State reset'
        );
    },

    hydrateState: async (connectorTagID): Promise<void> => {
        get().setHydrated(false);

        if (get().active && hasLength(connectorTagID)) {
            const { data, error } = await getConnectorTagDetails(
                connectorTagID
            );

            get().setHydrationError(error ? error.message : null);
            get().setHydrationErrorsExist(Boolean(error));

            if (data?.resource_spec_schema) {
                get().setTag(data);
            }
        }
    },

    setTag: (newVal) => {
        set(
            produce((state: ConnectorState) => {
                state.tag = newVal;
            }),
            false,
            'Tag Set'
        );
    },
});

export const useConnectorStore = create<ConnectorState>()(
    devtools(
        (set, get) => getInitialState(set, get),
        devtoolsOptions(STORE_KEY)
    )
);

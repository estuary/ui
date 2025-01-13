import produce from 'immer';
import {
    getInitialHydrationData,
    getStoreWithHydrationSettings,
} from 'stores/extensions/Hydration';
import { devtoolsOptions } from 'utils/store-utils';
import { create, StoreApi } from 'zustand';
import { devtools, NamedSet } from 'zustand/middleware';
import { EntityStatusState } from './types';

const STORE_KEY = 'entity-status';

const getInitialEntityStatusData = (): Pick<
    EntityStatusState,
    'format' | 'lastUpdated' | 'loading' | 'responses'
> => ({
    format: 'dashboard',
    lastUpdated: null,
    loading: false,
    responses: null,
});

const getInitialStateData = () => ({
    ...getInitialEntityStatusData(),
    ...getInitialHydrationData(),
});

const getInitialState = (
    set: NamedSet<EntityStatusState>,
    get: StoreApi<EntityStatusState>['getState']
): EntityStatusState => ({
    ...getInitialStateData(),
    ...getStoreWithHydrationSettings(STORE_KEY, set),

    getSingleResponse: (catalogName) =>
        get()
            .responses?.filter((datum) => datum.catalog_name === catalogName)
            .at(0),

    resetState: () => {
        set(getInitialStateData(), false, 'State reset');
    },

    setFormat: (value, invertedValue) => {
        set(
            produce((state: EntityStatusState) => {
                state.format = state.format === value ? invertedValue : value;
            }),
            false,
            'Format set'
        );
    },

    setLastUpdated: (value) => {
        set(
            produce((state: EntityStatusState) => {
                state.lastUpdated = value;
            }),
            false,
            'Last updated set'
        );
    },

    setLoading: (value) => {
        const action = value ? 'Loading' : 'Loaded';

        set(
            produce((state: EntityStatusState) => {
                state.loading = value;
            }),
            false,
            action
        );
    },

    setResponses: (value) => {
        if (get().responses === null) {
            get().setHydrated(true);
            get().setActive(false);
        }

        set(
            produce((state: EntityStatusState) => {
                state.responses = value;
            }),
            false,
            'Responses set'
        );
    },
});

export const useEntityStatusStore = create<EntityStatusState>()(
    devtools(
        (set, get) => getInitialState(set, get),
        devtoolsOptions(STORE_KEY)
    )
);

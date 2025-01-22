import produce from 'immer';
import { logRocketEvent } from 'services/shared';
import { CustomEvents } from 'services/types';
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
    'format' | 'lastUpdated' | 'refresh' | 'responses' | 'serverError'
> => ({
    format: 'dashboard',
    lastUpdated: null,
    refresh: () => new Promise(() => undefined),
    responses: null,
    serverError: null,
});

const getInitialStateData = () => ({
    ...getInitialEntityStatusData(),
    ...getInitialHydrationData(),
});

const getInitialState = (
    set: NamedSet<EntityStatusState>,
    _get: StoreApi<EntityStatusState>['getState']
): EntityStatusState => ({
    ...getInitialStateData(),
    ...getStoreWithHydrationSettings(STORE_KEY, set),

    resetState: () => {
        set(getInitialStateData(), false, 'State reset');
    },

    setFormat: (value, invertedValue) => {
        logRocketEvent(`${CustomEvents.ENTITY_STATUS}:ViewChanged`);

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

    setRefresh: (value) => {
        set(
            produce((state: EntityStatusState) => {
                state.refresh = value;
            }),
            false,
            'Refresh set'
        );
    },

    setResponses: (value) => {
        set(
            produce((state: EntityStatusState) => {
                if (
                    value ||
                    (!state.hydrated && typeof value === 'undefined')
                ) {
                    state.responses = value ?? [];
                }
            }),
            false,
            'Responses set'
        );
    },

    setServerError: (value) => {
        set(
            produce((state: EntityStatusState) => {
                state.serverError = value;
            }),
            false,
            'Server error set'
        );
    },
});

export const useEntityStatusStore = create<EntityStatusState>()(
    devtools(
        (set, get) => getInitialState(set, get),
        devtoolsOptions(STORE_KEY)
    )
);

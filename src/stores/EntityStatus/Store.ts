import produce from 'immer';
import { devtoolsOptions } from 'utils/store-utils';
import { create, StoreApi } from 'zustand';
import { devtools, NamedSet } from 'zustand/middleware';
import { EntityStatusState } from './types';

const getInitialStateData = (): Pick<
    EntityStatusState,
    'format' | 'lastUpdated' | 'responses'
> => ({
    format: 'dashboard',
    lastUpdated: null,
    responses: null,
});

const getInitialState = (
    set: NamedSet<EntityStatusState>,
    get: StoreApi<EntityStatusState>['getState']
): EntityStatusState => ({
    ...getInitialStateData(),

    getSingleResponse: (catalogName) =>
        get()
            .responses?.filter((datum) => datum.catalog_name === catalogName)
            .at(0),

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

    setResponses: (value) => {
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
        devtoolsOptions('entity-status')
    )
);

import produce from 'immer';
import { devtoolsOptions } from 'utils/store-utils';
import { create, StoreApi } from 'zustand';
import { devtools, NamedSet } from 'zustand/middleware';
import { EntityStatusState } from './types';

const getInitialStateData = (): Pick<
    EntityStatusState,
    'format' | 'response'
> => ({
    format: 'dashboard',
    response: null,
});

const getInitialState = (
    set: NamedSet<EntityStatusState>,
    _get: StoreApi<EntityStatusState>['getState']
): EntityStatusState => ({
    ...getInitialStateData(),

    setFormat: (value, invertedValue) => {
        set(
            produce((state: EntityStatusState) => {
                state.format = state.format === value ? invertedValue : value;
            }),
            false,
            'Format set'
        );
    },

    setResponse: (value) => {
        set(
            produce((state: EntityStatusState) => {
                state.response = value;
            }),
            false,
            'Response set'
        );
    },
});

export const useEntityStatusStore = create<EntityStatusState>()(
    devtools(
        (set, get) => getInitialState(set, get),
        devtoolsOptions('entity-status')
    )
);

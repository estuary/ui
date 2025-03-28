import { create, StoreApi } from 'zustand';
import { devtools, NamedSet, persist } from 'zustand/middleware';

import { persistOptions } from './shared';
import { TenantState } from './types';
import produce from 'immer';

import { devtoolsOptions } from 'src/utils/store-utils';

const getInitialStateData = (): Pick<TenantState, 'selectedTenant'> => ({
    selectedTenant: '',
});

const getInitialState = (
    set: NamedSet<TenantState>,
    _get: StoreApi<TenantState>['getState']
): TenantState => ({
    ...getInitialStateData(),

    setSelectedTenant: (value) => {
        set(
            produce((state: TenantState) => {
                state.selectedTenant = value;
            }),
            false,
            'Tenant updated'
        );
    },
});

export const useTenantStore = create<TenantState>()(
    persist(
        devtools(
            (set, get) => getInitialState(set, get),
            devtoolsOptions(persistOptions.name)
        ),
        persistOptions
    )
);

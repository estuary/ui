import produce from 'immer';
import { devtoolsOptions } from 'utils/store-utils';
import type { StoreApi } from 'zustand';
import { create } from 'zustand';
import type { NamedSet } from 'zustand/middleware';
import { devtools, persist } from 'zustand/middleware';
import { persistOptions } from './shared';
import type { TenantState } from './types';

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

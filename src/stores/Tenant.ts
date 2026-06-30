import type { StoreApi } from 'zustand';
import type { NamedSet, PersistOptions } from 'zustand/middleware';

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

import produce from 'immer';

import { devtoolsOptions } from 'src/utils/store-utils';

interface TenantState {
    selectedTenant: string;
    setSelectedTenant: (value: string) => void;
}

// Previous persist states for testing migrations
// v0 - {"state":{"selectedTenant":"foo/"},"version":0}
const persistOptions: PersistOptions<TenantState> = {
    name: 'estuary.tenants-store',
    version: 0,
};

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

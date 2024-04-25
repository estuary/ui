import produce from 'immer';
import { devtoolsOptions } from 'utils/store-utils';
import { StoreApi, create } from 'zustand';
import { NamedSet, devtools } from 'zustand/middleware';
import { TenantState } from './types';

const getInitialStateData = (): Pick<TenantState, 'selectedTenant'> => ({
    selectedTenant: '',
});

const getInitialState = (
    set: NamedSet<TenantState>,
    _get: StoreApi<TenantState>['getState']
): TenantState => ({
    ...getInitialStateData(),

    updateSelectedTenant: (value) => {
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
    devtools((set, get) => getInitialState(set, get), devtoolsOptions('tenant'))
);

import produce from 'immer';
import { pull, union } from 'lodash';
import { hasLength } from 'utils/misc-utils';
import { devtoolsOptions } from 'utils/store-utils';
import { create, StoreApi } from 'zustand';
import { devtools, NamedSet, persist } from 'zustand/middleware';
import { persistOptions } from './shared';
import { TenantState } from './types';

const getInitialStateData = (): Pick<
    TenantState,
    'selectedTenant' | 'trialStorageOnly'
> => ({
    selectedTenant: '',
    trialStorageOnly: [],
});

const getInitialState = (
    set: NamedSet<TenantState>,
    _get: StoreApi<TenantState>['getState']
): TenantState => ({
    ...getInitialStateData(),

    addTrialStorageOnly: (values) => {
        set(
            produce((state: TenantState) => {
                if (
                    typeof values === 'string' &&
                    !state.trialStorageOnly.includes(values)
                ) {
                    state.trialStorageOnly.push(values);
                }

                if (typeof values !== 'string') {
                    state.trialStorageOnly = hasLength(values)
                        ? union(state.trialStorageOnly, values)
                        : [];
                }
            }),
            false,
            'Tenants with trial storage only added'
        );
    },

    removeTrialStorageOnly: (value) => {
        set(
            produce((state: TenantState) => {
                if (value) {
                    state.trialStorageOnly = pull(
                        state.trialStorageOnly,
                        value
                    );

                    return;
                }

                state.trialStorageOnly = [];
            }),
            false,
            'Tenants with trial storage only removed'
        );
    },

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

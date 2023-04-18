import produce from 'immer';
import { SelectTableStoreNames } from 'stores/names';
import { BillingState } from 'stores/Tables/Billing/types';
import { getInitialState as getInitialSelectTableState } from 'stores/Tables/Store';
import { devtoolsOptions } from 'utils/store-utils';
import { create, StoreApi } from 'zustand';
import { devtools, NamedSet } from 'zustand/middleware';

export const getInitialState = (
    set: NamedSet<BillingState>,
    get: StoreApi<BillingState>['getState']
): BillingState => {
    return {
        ...getInitialSelectTableState(set, get),

        hydrateContinuously: (data, error) => {
            const { fetcher } = get().query;

            if (!fetcher) {
                throw new Error(
                    'You must populate the query before hydrating.'
                );
            }

            set(
                produce((state) => {
                    state.query.loading = true;
                }),
                false,
                'Table Store Hydration Start'
            );

            if (error) {
                set(
                    produce((state) => {
                        state.query.response = null;
                        state.query.loading = false;
                        state.query.error = error;
                    }),
                    false,
                    'Table Store Hydration Failure'
                );
            }

            set(
                produce((state) => {
                    state.hydrated = true;

                    state.query.count = data.length;
                    state.query.response = data;
                    state.query.loading = false;
                }),
                false,
                'Table Store Hydration Success'
            );
        },
    };
};

export const createBillingTableStore = (key: SelectTableStoreNames.BILLING) => {
    return create<BillingState>()(
        devtools((set, get) => getInitialState(set, get), devtoolsOptions(key))
    );
};

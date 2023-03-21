import produce from 'immer';
import { SelectTableStoreNames } from 'stores/names';
import { BillingState } from 'stores/Tables/Billing/types';
import { getInitialState as getInitialSelectTableState } from 'stores/Tables/Store';
import { devtoolsOptions } from 'utils/store-utils';
import { create, StoreApi } from 'zustand';
import { devtools, NamedSet } from 'zustand/middleware';

const getInitialStateData = (): Pick<BillingState, 'projectedCostStats'> => {
    return {
        projectedCostStats: {},
    };
};

export const getInitialState = (
    set: NamedSet<BillingState>,
    get: StoreApi<BillingState>['getState']
): BillingState => {
    return {
        ...getInitialStateData(),
        ...getInitialSelectTableState(set, get),

        setProjectedCostStats: (value) => {
            set(
                produce((state: BillingState) => {
                    const taskStatData = value.filter((query) =>
                        Object.hasOwn(query.flow_document, 'taskStats')
                    );

                    taskStatData.forEach((query) => {
                        if (Object.hasOwn(state.projectedCostStats, query.ts)) {
                            state.projectedCostStats[query.ts].push(query);
                        } else {
                            state.projectedCostStats = { [query.ts]: [query] };
                        }
                    });
                }),
                false,
                'Projected Cost Stats Set'
            );
        },
    };
};

export const createBillingStore = (key: SelectTableStoreNames.BILLING) => {
    return create<BillingState>()(
        devtools((set, get) => getInitialState(set, get), devtoolsOptions(key))
    );
};

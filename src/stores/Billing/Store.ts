import produce from 'immer';
import { isEqual } from 'lodash';
import { BillingState, DataVolumeByTask } from 'stores/Billing/types';
import {
    getInitialHydrationData,
    getStoreWithHydrationSettings,
} from 'stores/extensions/Hydration';
import { BillingStoreNames } from 'stores/names';
import { evaluateSpecType, stripTimeFromDate } from 'utils/billing-utils';
import { devtoolsOptions } from 'utils/store-utils';
import { create, StoreApi } from 'zustand';
import { devtools, NamedSet } from 'zustand/middleware';

const getInitialStateData = (): Pick<
    BillingState,
    | 'billingHistory'
    | 'billingHistoryInitialized'
    | 'dataByTaskGraphDetails'
    | 'selectedTenant'
> => {
    return {
        billingHistory: [],
        billingHistoryInitialized: false,
        dataByTaskGraphDetails: [],
        selectedTenant: '',
    };
};

export const getInitialState = (
    set: NamedSet<BillingState>,
    get: StoreApi<BillingState>['getState']
): BillingState => {
    return {
        ...getInitialStateData(),
        ...getStoreWithHydrationSettings('Billing', set),

        setSelectedTenant: (value) => {
            set(
                produce((state: BillingState) => {
                    state.selectedTenant = value;

                    state.billingHistory = [];
                    state.dataByTaskGraphDetails = [];

                    state.hydrated = false;
                    state.hydrationErrorsExist = false;
                }),
                false,
                'Selected Tenant Set'
            );
        },

        setBillingHistory: (value) => {
            set(
                produce((state: BillingState) => {
                    state.billingHistory = value;
                }),
                false,
                'Billing Details Set'
            );
        },

        setBillingHistoryInitialized: (value) => {
            set(
                produce((state: BillingState) => {
                    state.billingHistoryInitialized = value;
                }),
                false,
                'Billing History Initialized'
            );
        },

        updateBillingHistory: (value) => {
            set(
                produce((state: BillingState) => {
                    if (value[0].max_concurrent_tasks > 0) {
                        const { billingHistory } = get();

                        const evaluatedBillingHistory = billingHistory.filter(
                            (record) =>
                                record.billed_month !== value[0].billed_month
                        );

                        evaluatedBillingHistory.push(value[0]);

                        state.billingHistory = evaluatedBillingHistory;
                    }
                }),
                false,
                'Billing Details Updated'
            );
        },

        setDataByTaskGraphDetails: (value) => {
            set(
                produce((state: BillingState) => {
                    const taskStatData = value.filter((query) =>
                        Object.hasOwn(query.flow_document, 'taskStats')
                    );

                    taskStatData.forEach((query) => {
                        const dataVolumeByTask: DataVolumeByTask = {
                            catalogName: query.catalog_name,
                            date: stripTimeFromDate(query.ts),
                            dataVolume:
                                query.bytes_written_by_me +
                                query.bytes_read_by_me,
                            specType: evaluateSpecType(query),
                        };

                        const existingStatIndex =
                            state.dataByTaskGraphDetails.findIndex(
                                (stat) =>
                                    query.catalog_name === stat.catalogName &&
                                    isEqual(
                                        stat.date,
                                        stripTimeFromDate(query.ts)
                                    )
                            );

                        if (existingStatIndex === -1) {
                            state.dataByTaskGraphDetails.push(dataVolumeByTask);
                        } else {
                            state.dataByTaskGraphDetails[existingStatIndex] =
                                dataVolumeByTask;
                        }
                    });
                }),
                false,
                'Data By Task Graph Details Set'
            );
        },

        resetState: () => {
            set(
                { ...getInitialStateData(), ...getInitialHydrationData() },
                false,
                'State Reset'
            );
        },
    };
};

export const createBillingStore = (key: BillingStoreNames.GENERAL) => {
    return create<BillingState>()(
        devtools((set, get) => getInitialState(set, get), devtoolsOptions(key))
    );
};

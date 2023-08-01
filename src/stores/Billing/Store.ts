import produce from 'immer';
import { isArray, isEqual } from 'lodash';
import { BillingState, DataVolumeByTask } from 'stores/Billing/types';
import {
    getInitialHydrationData,
    getStoreWithHydrationSettings,
} from 'stores/extensions/Hydration';
import { BillingStoreNames } from 'stores/names';
import { evaluateSpecType, stripTimeFromDate } from 'utils/billing-utils';
import { hasLength } from 'utils/misc-utils';
import { devtoolsOptions } from 'utils/store-utils';
import { StoreApi, create } from 'zustand';
import { NamedSet, devtools } from 'zustand/middleware';

const getInitialStateData = (): Pick<
    BillingState,
    | 'billingHistory'
    | 'billingHistoryInitialized'
    | 'dataByTaskGraphDetails'
    | 'paymentMethodExists'
    | 'selectedTenant'
> => {
    return {
        billingHistory: [],
        billingHistoryInitialized: false,
        dataByTaskGraphDetails: [],
        paymentMethodExists: null,
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
                    // This action is used to update the record of the active billing cycle at a regular interval.
                    // Since the selected tenant is subject to vary, the billed prefix of the record input must be
                    // validated against the selected tenant before altering the billing history.
                    if (
                        typeof value[0].task_usage_hours === 'number' &&
                        typeof value[0].processed_data_gb === 'number' &&
                        value[0].billed_prefix === state.selectedTenant
                    ) {
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

        setPaymentMethodExists: (value) => {
            set(
                produce((state: BillingState) => {
                    state.paymentMethodExists =
                        isArray(value) && hasLength(value);
                }),
                false,
                'Payment Exists Updated'
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

export const billingStore = create<BillingState>()(
    devtools(
        (set, get) => getInitialState(set, get),
        devtoolsOptions(BillingStoreNames.GENERAL)
    )
);

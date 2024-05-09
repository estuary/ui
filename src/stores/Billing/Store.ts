import produce from 'immer';
import { isArray, isEqual } from 'lodash';
import { BillingState, DataVolumeByTask } from 'stores/Billing/types';
import {
    getInitialHydrationData,
    getStoreWithHydrationSettings,
} from 'stores/extensions/Hydration';
import { BillingStoreNames } from 'stores/names';
import {
    evaluateSpecType,
    invoiceId,
    stripTimeFromDate,
} from 'utils/billing-utils';
import { hasLength } from 'utils/misc-utils';
import { devtoolsOptions } from 'utils/store-utils';
import { StoreApi, create } from 'zustand';
import { NamedSet, devtools } from 'zustand/middleware';

const getInitialStateData = (): Pick<
    BillingState,
    | 'invoices'
    | 'invoicesInitialized'
    | 'dataByTaskGraphDetails'
    | 'paymentMethodExists'
    | 'selectedInvoiceId'
> => {
    return {
        selectedInvoiceId: null,
        invoices: [],
        invoicesInitialized: false,
        dataByTaskGraphDetails: [],
        paymentMethodExists: null,
    };
};

export const getInitialState = (
    set: NamedSet<BillingState>,
    get: StoreApi<BillingState>['getState']
): BillingState => {
    return {
        ...getInitialStateData(),
        ...getStoreWithHydrationSettings('Billing', set),

        setSelectedInvoice: (value) => {
            set(
                produce((state: BillingState) => {
                    state.selectedInvoiceId = value;
                }),
                false,
                'Selected Month Set'
            );
        },

        setInvoices: (value) => {
            set(
                produce((state: BillingState) => {
                    if (state.active) {
                        state.invoices = value;
                        state.selectedInvoiceId = invoiceId(value[0]);
                    }
                }),
                false,
                'Billing Details Set'
            );
        },

        setInvoicesInitialized: (value) => {
            set(
                produce((state: BillingState) => {
                    state.invoicesInitialized =
                        value && state.active ? value : false;
                }),
                false,
                'Billing History Initialized'
            );
        },

        updateInvoices: (value, selectedTenant) => {
            set(
                produce((state: BillingState) => {
                    // This action is used to update the record of the active billing cycle at a regular interval.
                    // Since the selected tenant is subject to vary, the billed prefix of the record input must be
                    // validated against the selected tenant before altering the billing history.
                    if (value[0].billed_prefix === selectedTenant) {
                        const { invoices } = get();

                        const evaluatedBillingHistory = invoices.filter(
                            (record) =>
                                record.date_start !== value[0].date_start &&
                                record.date_end !== value[0].date_end
                        );

                        evaluatedBillingHistory.unshift(value[0]);

                        if (
                            !evaluatedBillingHistory.find(
                                (inv) =>
                                    invoiceId(inv) === state.selectedInvoiceId
                            )
                        ) {
                            state.selectedInvoiceId = invoiceId(
                                evaluatedBillingHistory[0]
                            );
                        }

                        state.invoices = evaluatedBillingHistory;
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

export const useBillingStore = create<BillingState>()(
    devtools(
        (set, get) => getInitialState(set, get),
        devtoolsOptions(BillingStoreNames.GENERAL)
    )
);

import produce from 'immer';
import { isArray, isEqual } from 'lodash';
import { BillingState, DataVolumeByTask } from 'stores/Billing/types';
import {
    getInitialHydrationData,
    getStoreWithHydrationSettings,
} from 'stores/extensions/Hydration';
import {
    evaluateSpecType,
    invoiceId,
    stripTimeFromDate,
} from 'utils/billing-utils';
import { hasLength } from 'utils/misc-utils';
import { devtoolsOptions } from 'utils/store-utils';
import { create } from 'zustand';
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

export const getInitialState = (set: NamedSet<BillingState>): BillingState => {
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
                        state.selectedInvoiceId =
                            value.length > 0 ? invoiceId(value[0]) : null;
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
    devtools((set) => getInitialState(set), devtoolsOptions('billing'))
);

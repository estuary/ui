import type { BillingState } from 'src/stores/Billing/types';
import type { NamedSet } from 'zustand/middleware';

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import produce from 'immer';
import { isArray } from 'lodash';

import {
    getInitialHydrationData,
    getStoreWithHydrationSettings,
} from 'src/stores/extensions/Hydration';
import { invoiceId } from 'src/utils/billing-utils';
import { hasLength } from 'src/utils/misc-utils';
import { devtoolsOptions } from 'src/utils/store-utils';

const getInitialStateData = (): Pick<
    BillingState,
    | 'invoices'
    | 'invoicesInitialized'
    | 'paymentMethodExists'
    | 'selectedInvoiceId'
> => {
    return {
        selectedInvoiceId: null,
        invoices: [],
        invoicesInitialized: false,
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

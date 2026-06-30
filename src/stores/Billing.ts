import type { Invoice } from 'src/api/billing';
import type { StoreWithHydration } from 'src/stores/extensions/Hydration';
import type { InvoiceId } from 'src/utils/billing-utils';
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

interface BillingState extends StoreWithHydration {
    selectedInvoiceId: InvoiceId | null;
    setSelectedInvoice: (value: InvoiceId) => void;

    invoices: Invoice[];
    setInvoices: (value: Invoice[]) => void;

    paymentMethodExists: boolean | null;
    setPaymentMethodExists: (value: any[] | undefined) => void;

    resetState: () => void;
}

const getInitialStateData = (): Pick<
    BillingState,
    'invoices' | 'paymentMethodExists' | 'selectedInvoiceId'
> => {
    return {
        selectedInvoiceId: null,
        invoices: [],
        paymentMethodExists: null,
    };
};

const getInitialState = (set: NamedSet<BillingState>): BillingState => {
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

// Selector Hooks
export const useBilling_selectedInvoice = () => {
    return useBillingStore((state) =>
        state.selectedInvoiceId
            ? (state.invoices.find(
                  (inv) => invoiceId(inv) === state.selectedInvoiceId
              ) ?? null)
            : null
    );
};

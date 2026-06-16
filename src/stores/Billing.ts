import type { InvoiceId } from 'src/utils/billing-utils';
import type { NamedSet } from 'zustand/middleware';

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import produce from 'immer';
import { isArray } from 'lodash';

import { hasLength } from 'src/utils/misc-utils';
import { devtoolsOptions } from 'src/utils/store-utils';

interface BillingState {
    selectedInvoiceId: InvoiceId | null;
    setSelectedInvoice: (value: InvoiceId) => void;

    paymentMethodExists: boolean | null;
    setPaymentMethodExists: (value: any[] | undefined) => void;
}

const getInitialState = (set: NamedSet<BillingState>): BillingState => {
    return {
        selectedInvoiceId: null,
        paymentMethodExists: null,

        setSelectedInvoice: (value) => {
            set(
                produce((state: BillingState) => {
                    state.selectedInvoiceId = value;
                }),
                false,
                'Selected Month Set'
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
    };
};

export const useBillingStore = create<BillingState>()(
    devtools((set) => getInitialState(set), devtoolsOptions('billing'))
);

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

    paymentMethodStatus: { tenant: string; exists: boolean } | null;
    setPaymentMethodStatus: (
        tenant: string,
        value: unknown[] | undefined
    ) => void;
}

const getInitialState = (set: NamedSet<BillingState>): BillingState => {
    return {
        selectedInvoiceId: null,
        paymentMethodStatus: null,

        setSelectedInvoice: (value) => {
            set(
                produce((state: BillingState) => {
                    state.selectedInvoiceId = value;
                }),
                false,
                'Selected Month Set'
            );
        },

        setPaymentMethodStatus: (tenant, value) => {
            set(
                produce((state: BillingState) => {
                    state.paymentMethodStatus = {
                        tenant,
                        exists: isArray(value) && hasLength(value),
                    };
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

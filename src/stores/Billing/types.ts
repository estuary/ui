import type { Invoice } from 'src/api/billing';
import type { StoreWithHydration } from 'src/stores/extensions/Hydration';
import type { Entity } from 'src/types';
import type { InvoiceId } from 'src/utils/billing-utils';

export interface DataVolumeByTask {
    catalogName: string;
    date: Date;
    dataVolume: number;
    specType: Entity;
}

export interface DataVolumeByTaskGraphDetails {
    [catalog_name: string]: DataVolumeByTask[];
}

export interface BillingState extends StoreWithHydration {
    selectedInvoiceId: InvoiceId | null;
    setSelectedInvoice: (value: InvoiceId) => void;

    invoicesInitialized: boolean;
    setInvoicesInitialized: (value: boolean) => void;

    invoices: Invoice[];
    setInvoices: (value: Invoice[]) => void;

    paymentMethodExists: boolean | null;
    setPaymentMethodExists: (value: any[] | undefined) => void;

    resetState: () => void;
}

import { Invoice } from 'api/billing';
import { StoreWithHydration } from 'stores/extensions/Hydration';
import { CatalogStats_Billing, Entity } from 'types';
import { InvoiceId } from 'utils/billing-utils';

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
    selectedTenant: string;
    setSelectedTenant: (value: string) => void;

    selectedInvoiceId: InvoiceId | null;
    setSelectedInvoice: (value: InvoiceId) => void;

    dataByTaskGraphDetails: DataVolumeByTask[];
    setDataByTaskGraphDetails: (value: CatalogStats_Billing[]) => void;

    invoicesInitialized: boolean;
    setInvoicesInitialized: (value: boolean) => void;

    invoices: Invoice[];
    setInvoices: (value: Invoice[]) => void;
    updateInvoices: (value: Invoice[]) => void;

    paymentMethodExists: boolean | null;
    setPaymentMethodExists: (value: any[] | undefined) => void;

    resetState: () => void;
}

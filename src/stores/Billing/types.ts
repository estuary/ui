import { BillingRecord, ManualBill } from 'api/billing';
import { StoreWithHydration } from 'stores/extensions/Hydration';
import { CatalogStats_Billing, Entity } from 'types';

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

    selectedMonth: string;
    setSelectedMonth: (value: string) => void;

    dataByTaskGraphDetails: DataVolumeByTask[];
    setDataByTaskGraphDetails: (value: CatalogStats_Billing[]) => void;

    billingHistoryInitialized: boolean;
    setBillingHistoryInitialized: (value: boolean) => void;

    billingHistory: BillingRecord[];
    setBillingHistory: (value: BillingRecord[]) => void;
    updateBillingHistory: (value: BillingRecord[]) => void;

    paymentMethodExists: boolean | null;
    setPaymentMethodExists: (value: any[] | undefined) => void;

    manualBills: ManualBill[];
    setManualBills: (value: ManualBill[]) => void;

    resetState: () => void;
}

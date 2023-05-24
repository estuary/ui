import { BillingRecord } from 'api/billing';
import { StoreWithHydration } from 'stores/Hydration';
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

    dataByTaskGraphDetails: DataVolumeByTask[];
    setDataByTaskGraphDetails: (value: CatalogStats_Billing[]) => void;

    billingHistory: BillingRecord[];
    setBillingHistory: (value: BillingRecord[]) => void;
    updateBillingHistory: (value: BillingRecord[]) => void;

    resetState: () => void;
}

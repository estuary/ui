import { StoreWithHydration } from 'stores/Hydration';
import { CatalogStats_Billing, Entity } from 'types';

export interface BillingRecord {
    date: Date;
    dataVolume: number;
    taskCount: number;
    totalCost: number;
    pricingTier: string | null;
    taskRate: number | null;
    gbFree: number | null;
}

export interface DataVolumeByTask {
    date: Date;
    dataVolume: number;
    specType: Entity;
}

export interface DataVolumeByTaskGraphDetails {
    [catalog_name: string]: DataVolumeByTask[];
}

export interface BillingState extends StoreWithHydration {
    dataByTaskGraphDetails: DataVolumeByTaskGraphDetails;
    setDataByTaskGraphDetails: (value: CatalogStats_Billing[]) => void;

    billingHistory: BillingRecord[];
    setBillingHistory: (value: CatalogStats_Billing[]) => void;

    resetState: () => void;
}

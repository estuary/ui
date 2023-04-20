import { StoreWithHydration } from 'stores/Hydration';
import { CatalogStats_Billing, Entity } from 'types';

export interface BillingRecord {
    dataVolume: number;
    date: Date;
    gbFree: number | null;
    pricingTier: string | null;
    taskCount: number;
    taskRate: number | null;
    totalCost: number;
}

export interface DataVolumeByTask {
    dataVolume: number;
    date: Date;
    specType: Entity;
}

export interface DataVolumeByTaskGraphDetails {
    [catalog_name: string]: DataVolumeByTask[];
}

export interface BillingState extends StoreWithHydration {
    billingHistory: BillingRecord[];
    dataByTaskGraphDetails: DataVolumeByTaskGraphDetails;

    resetState: () => void;
    setBillingHistory: (value: CatalogStats_Billing[]) => void;

    setDataByTaskGraphDetails: (value: CatalogStats_Billing[]) => void;
}

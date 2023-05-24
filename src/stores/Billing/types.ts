import { BillingRecord } from 'api/billing';
import { StoreWithHydration } from 'stores/Hydration';
import { CatalogStats_Billing, Entity } from 'types';

export interface FormattedBillingRecord {
    date: Date;
    timestamp: string;
    dataVolume: number;
    taskCount: number;
    totalCost: number;
    pricingTier: string | null;
    taskRate: number | null;
    gbFree: number | null;
    includedTasks: number | null;
}

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

    billingHistory: FormattedBillingRecord[];
    setBillingHistory: (value: BillingRecord[]) => void;

    resetState: () => void;
}

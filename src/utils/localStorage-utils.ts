import type { ComplianceLocalStorageKeys } from 'src/_compliance/types';

export enum LocalStorageKeys {
    COLOR_MODE = 'estuary.color-mode',
    DATAPLANE_CHOICE = 'estuary.dataplane-choice',
    CIDR_BLOCK_CHOICE = 'estuary.cidr-block-choice',
    DASHBOARD_WELCOME = 'estuary.dashboard-welcome',
    MARKETPLACE_VERIFY = 'estuary.marketplace-verify',
    NAVIGATION_SETTINGS = 'estuary.navigation-settings',
    SIDE_PANEL_DOCS = 'estuary.side-panel-docs',
    TABLE_SETTINGS = 'estuary.table-settings',
}

// These are Zustand stores that are persisted with these keys
export enum PersistedStoresKeys {
    DETAILS_USAGE = 'estuary.details-usage-store',
    TENANTS = 'estuary.tenants-store',
}

// These should only ever be interacted with through getWithExpiry and setWithExpiry
export type ExpiringLocalStorageKeys =
    | ComplianceLocalStorageKeys
    | 'estuary.chunk_failed';

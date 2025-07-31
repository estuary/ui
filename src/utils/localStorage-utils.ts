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
    // ENABLE_DATA_FLOW_RESET = 'estuary.enable-data-flow-reset', // Went Live
}

export type ExpiringLocalStorageKeys =
    | ComplianceLocalStorageKeys
    | 'estuary.chunk_failed';

export enum PersistedStoresKeys {
    DETAILS_USAGE = 'estuary.details-usage-store',
    ENHANCED_SUPPORT = 'estuary.enhanced-support-store',
    TENANTS = 'estuary.tenants-store',
}

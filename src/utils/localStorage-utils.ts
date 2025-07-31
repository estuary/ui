import type { DurationLike } from 'luxon';

import { DateTime } from 'luxon';

export enum LocalStorageKeys {
    COLOR_MODE = 'estuary.color-mode',
    DATAPLANE_CHOICE = 'estuary.dataplane-choice',
    CIDR_BLOCK_CHOICE = 'estuary.cidr-block-choice',
    DASHBOARD_WELCOME = 'estuary.dashboard-welcome',
    LAZY_LOAD_FAILED_KEY = 'estuary.chunk_failed',
    MARKETPLACE_VERIFY = 'estuary.marketplace-verify',
    NAVIGATION_SETTINGS = 'estuary.navigation-settings',
    SIDE_PANEL_DOCS = 'estuary.side-panel-docs',
    TABLE_SETTINGS = 'estuary.table-settings',
    PRIVACY_SETTINGS = 'estuary.privacy-settings',
    // ENABLE_DATA_FLOW_RESET = 'estuary.enable-data-flow-reset', // Went Live
}

export enum PersistedStoresKeys {
    DETAILS_USAGE = 'estuary.details-usage-store',
    ENHANCED_SUPPORT = 'estuary.enhanced-support-store',
    TENANTS = 'estuary.tenants-store',
}

export const setWithExpiry = <T = unknown>(
    key: LocalStorageKeys,
    value: any | T,
    expirationSetting?: DurationLike
) => {
    if (value === null) {
        localStorage.removeItem(key);
        // window.dispatchEvent(new Event('EST_LOCAL_STORAGE_UPDATE', {
        //     value
        // }));
    } else {
        localStorage.setItem(
            key,
            JSON.stringify({
                value,
                expiry: expirationSetting
                    ? DateTime.utc().plus(expirationSetting).toMillis()
                    : null,
            })
        );
    }
};

export const getWithExpiry = <T = unknown>(key: LocalStorageKeys): null | T => {
    const itemString = window.localStorage.getItem(key);
    const item = itemString ? JSON.parse(itemString) : null;

    // Either there is no setting or we couldn't parse it. Either way we should try reloading again
    if (item === null) {
        return null;
    }

    // We have waited long enough to allow trying again so clearing out the key
    if (!item.expiry || DateTime.utc().toMillis() > item.expiry) {
        console.log('cleaning up', item);
        setWithExpiry(key, null);
        return null;
    }

    // Return value so we do not try reloading again
    return item.value;
};

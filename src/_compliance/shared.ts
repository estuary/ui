import type { DurationLike } from 'luxon';
import type {
    ExpiryLocalStorage,
    PrivacySettingsState,
} from 'src/_compliance/types';
import type { ExpiringLocalStorageKeys } from 'src/utils/localStorage-utils';

import { DateTime } from 'luxon';

export const EXPIRING_LOCAL_STORAGE_MESSAGE_KEY = 'est_expiring_local_storage';

export const defaultPrivacySettings: PrivacySettingsState = {
    enhancedSupportEnabled: false,
    sessionRecordingEnabled: false,
};

export const setWithExpiry = <T = unknown>(
    key: ExpiringLocalStorageKeys,
    value: any | T,
    expirationSetting: DurationLike | null
) => {
    if (value === null) {
        localStorage.removeItem(key);
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
    window.dispatchEvent(
        new StorageEvent(EXPIRING_LOCAL_STORAGE_MESSAGE_KEY, {
            key,
        })
    );
};

export const getWithExpiry = <T = unknown>(
    key: ExpiringLocalStorageKeys
): ExpiryLocalStorage<T> => {
    const itemString = window.localStorage.getItem(key);
    const item: ExpiryLocalStorage<T> = itemString
        ? JSON.parse(itemString)
        : null;

    // Either there is no setting or we couldn't parse it. Either way we should try reloading again
    if (item === null) {
        return null;
    }

    // We have waited long enough to allow trying again so clearing out the key
    if (!item.expiry || DateTime.utc().toMillis() >= item.expiry) {
        setWithExpiry(key, null, null);
        return null;
    }

    // Return value so we do not try reloading again
    return item;
};

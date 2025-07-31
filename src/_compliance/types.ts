import type { DurationLike } from 'luxon';

export type UseExpiringLocalStorageOptions<T> = {
    initializeWithValue?: boolean;
};

export interface PrivacySettingsState {
    enhancedSupportEnabled: boolean;
    sessionRecordingEnabled: boolean;
}

export type ComplianceLocalStorageKeys = 'estuary.privacy-settings';

export type SetWithExpiryFunction<T> = (
    newVal: Partial<T>,
    duration: DurationLike
) => void;

export type ExpiryLocalStorage<T> = {
    expiry: number | null;
    value: T;
} | null;

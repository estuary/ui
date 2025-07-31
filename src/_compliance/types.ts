import type { DurationLike } from 'luxon';

interface BaseExpiryLocalStorageState {
    expiry: number | null;
}

export type UseExpiringLocalStorageOptions<T> = {
    initializeWithValue?: boolean;
};

export interface PrivacySettingsState extends BaseExpiryLocalStorageState {
    enhancedSupportEnabled: boolean;
    sessionRecordingEnabled: boolean;
}

export type ComplianceLocalStorageKeys = 'estuary.privacy-settings';

export type SetWithExpiryFunction<T> = (
    newVal: Partial<T>,
    duration: DurationLike
) => void;

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

export interface ConsentAuditArgs {
    userId: string;
    supportEnabled: boolean; // may need revoke stand alone or make this "enable"/"revoke"
    expiration: any;
}

export interface SupportRoleGrantArgs {
    expiration: any;
}

export interface PrivacySettingStore {
    updatingSetting: boolean;
    updateError: null | any;
    setUpdateError: (newVal: PrivacySettingStore['updateError']) => void;
    setUpdatingSetting: (
        newVal: PrivacySettingStore['updatingSetting']
    ) => void;
}

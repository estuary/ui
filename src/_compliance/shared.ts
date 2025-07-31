import type { PrivacySettingsState } from 'src/_compliance/types';

export const EVENT_MESSAGE_KEY = 'est_local_storage';

export const defaultPrivacySettings: PrivacySettingsState = {
    enhancedSupportEnabled: false,
    sessionRecordingEnabled: false,

    enhancedSupportExpiration: null,
    sessionRecordingExpiration: null,
};

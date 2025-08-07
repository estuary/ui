import type { DurationLike } from 'luxon';

import { useCallback, useMemo } from 'react';

import { DateTime } from 'luxon';

import { useExpiringLocalStorage } from 'src/_compliance/hooks/useExpiringLocalStorage';
import useUpdateAuditTable from 'src/_compliance/hooks/useUpdateAuditTable';
import { defaultPrivacySettings } from 'src/_compliance/shared';
import { usePrivacySettingStore } from 'src/_compliance/stores/usePrivacySettingStore';
import { useUserStore } from 'src/context/User/useUserContextStore';
import { identifyUser } from 'src/services/logrocket';

function usePrivacySettings() {
    const [setUpdatingSetting, setUpdateError] = usePrivacySettingStore(
        (state) => {
            return [state.setUpdatingSetting, state.setUpdateError];
        }
    );

    const { consentAudit } = useUpdateAuditTable();
    const [currentSetting, setVal, resetValue] = useExpiringLocalStorage(
        'estuary.privacy-settings',
        {
            expiry: null,
            value: defaultPrivacySettings,
        }
    );

    const user = useUserStore((state) => state.user);
    const idUser = useCallback(() => {
        if (user) {
            identifyUser(user);
        }
    }, [user]);

    const grantAccess = useCallback(
        async (duration) => {
            if (!user) {
                // error handling
                return Promise.resolve({
                    error: true,
                });
            }

            const consentResponse = await consentAudit({
                supportEnabled: true,
                expiration: duration,
                userId: user.id,
            });

            if (consentResponse?.error) {
                // error handling
                return Promise.resolve({
                    error: true,
                });
            }

            setVal(
                {
                    enhancedSupportEnabled: true,
                    sessionRecordingEnabled: true,
                },
                duration
            );

            idUser();

            return Promise.resolve({
                error: false,
            });
        },
        [consentAudit, idUser, setVal, user]
    );

    const revokeAccess = useCallback(async () => {
        const consentResponse = await consentAudit({
            supportEnabled: false,
            expiration: null,
            userId: '',
        });

        if (consentResponse?.error) {
            // error handling
            return Promise.resolve({ error: true });
        }

        resetValue();

        return Promise.resolve({ error: false });
    }, [consentAudit, resetValue]);

    const setPrivacySettings = useCallback(
        async (newVal: boolean, duration?: DurationLike) => {
            setUpdatingSetting(true);
            setUpdateError(false);

            let serverCallSuccess = false;
            if (newVal && duration) {
                const grantAccessResponse = await grantAccess(duration);
                serverCallSuccess = Boolean(!grantAccessResponse.error);
                setUpdatingSetting(false);
            } else {
                const revokeAccessResponse = await revokeAccess();
                serverCallSuccess = Boolean(!revokeAccessResponse.error);
            }

            setUpdatingSetting(false);
            setUpdateError(!serverCallSuccess);
            return serverCallSuccess;
        },
        [grantAccess, revokeAccess, setUpdateError, setUpdatingSetting]
    );

    const [enhancedSupportEnabled, enhancedSupportExpiration]: [boolean, any] =
        useMemo(() => {
            if (currentSetting?.expiry) {
                return [
                    Boolean(currentSetting.value.enhancedSupportEnabled),
                    DateTime.fromMillis(currentSetting.expiry).toLocaleString(
                        DateTime.DATETIME_FULL
                    ),
                ];
            }

            return [false, null];
        }, [currentSetting]);

    return {
        enhancedSupportEnabled,
        enhancedSupportExpiration,
        setPrivacySettings,
    };
}

export default usePrivacySettings;

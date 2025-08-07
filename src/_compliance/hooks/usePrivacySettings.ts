import type { DurationLike } from 'luxon';

import { useCallback, useMemo } from 'react';

import { DateTime } from 'luxon';

import { useExpiringLocalStorage } from 'src/_compliance/hooks/useExpiringLocalStorage';
import useUpdateAuditTable from 'src/_compliance/hooks/useUpdateAuditTable';
import { defaultPrivacySettings } from 'src/_compliance/shared';
import { useUserStore } from 'src/context/User/useUserContextStore';
import { identifyUser } from 'src/services/logrocket';

function usePrivacySettings() {
    const [currentSetting, setVal, resetValue] = useExpiringLocalStorage(
        'estuary.privacy-settings',
        {
            expiry: null,
            value: defaultPrivacySettings,
        }
    );

    const { consentAudit } = useUpdateAuditTable();

    const user = useUserStore((state) => state.user);

    const idUser = useCallback(() => {
        if (user) {
            identifyUser(user);
        }
    }, [user]);

    const grantAccess = useCallback(
        async (duration) => {
            const consentResponse = await consentAudit({
                supportEnabled: true,
                expiration: duration,
                userId: '',
            });

            if (consentResponse?.error) {
                // need to show an error
                return;
            }

            setVal(
                {
                    enhancedSupportEnabled: true,
                    sessionRecordingEnabled: true,
                },
                duration
            );

            idUser();
        },
        [consentAudit, idUser, setVal]
    );

    const revokeAccess = useCallback(async () => {
        resetValue();

        await consentAudit({
            supportEnabled: false,
            expiration: null,
            userId: '',
        });
    }, [consentAudit, resetValue]);

    const setPrivacySettings = useCallback(
        async (newVal: boolean, duration: DurationLike) => {
            if (newVal) {
                await grantAccess(duration);
            } else {
                await revokeAccess();
            }
        },
        [grantAccess, revokeAccess]
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
        revokeAccess,
        setPrivacySettings,
    };
}

export default usePrivacySettings;

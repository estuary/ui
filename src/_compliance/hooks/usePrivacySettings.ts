import type { DurationLike } from 'luxon';

import { useCallback, useMemo, useState } from 'react';

import { DateTime } from 'luxon';

import { useExpiringLocalStorage } from 'src/_compliance/hooks/useExpiringLocalStorage';
import useUpdateAuditTable from 'src/_compliance/hooks/useUpdateAuditTable';
import { defaultPrivacySettings } from 'src/_compliance/shared';
import { useUserStore } from 'src/context/User/useUserContextStore';
import { identifyUser } from 'src/services/logrocket';

function usePrivacySettings() {
    const [updatingSetting, setUpdatingSetting] = useState(false);

    console.log('updatingSetting', updatingSetting);

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
                return;
            }

            const consentResponse = await consentAudit({
                supportEnabled: true,
                expiration: duration,
                userId: user.id,
            });

            if (consentResponse?.error) {
                // error handling
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
        [consentAudit, idUser, setVal, user]
    );

    const revokeAccess = useCallback(async () => {
        await consentAudit({
            supportEnabled: false,
            expiration: null,
            userId: '',
        });

        resetValue();
    }, [consentAudit, resetValue]);

    const setPrivacySettings = useCallback(
        async (newVal: boolean, duration?: DurationLike) => {
            setUpdatingSetting(true);

            if (newVal && duration) {
                await grantAccess(duration);
            } else {
                await revokeAccess();
            }

            setUpdatingSetting(false);
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
        setPrivacySettings,
        updatingSetting,
    };
}

export default usePrivacySettings;

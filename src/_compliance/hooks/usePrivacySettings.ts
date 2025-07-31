import type { DurationLike } from 'luxon';

import { useCallback, useMemo } from 'react';

import { DateTime } from 'luxon';

import { useExpiringLocalStorage } from 'src/_compliance/hooks/useExpiringLocalStorage';
import { defaultPrivacySettings } from 'src/_compliance/shared';
import { useUserStore } from 'src/context/User/useUserContextStore';
import { identifyUser } from 'src/services/logrocket';

function usePrivacySettings() {
    const [currentSetting, setVal, revokeAccess] = useExpiringLocalStorage(
        'estuary.privacy-settings',
        {
            expiry: null,
            value: defaultPrivacySettings,
        }
    );

    console.log('currentSetting', currentSetting);

    const user = useUserStore((state) => state.user);

    const idUser = useCallback(() => {
        if (user) {
            identifyUser(user);
        }
    }, [user]);

    const setPrivacySettings = useCallback(
        (newVal: boolean, duration: DurationLike) => {
            if (newVal) {
                setVal(
                    {
                        enhancedSupportEnabled: true,
                        sessionRecordingEnabled: true,
                    },
                    duration
                );

                idUser();
            } else {
                revokeAccess();
            }
        },
        [idUser, revokeAccess, setVal]
    );

    const [enhancedSupportEnabled, enhancedSupportExpiration]: [boolean, any] =
        useMemo(() => {
            if (currentSetting?.expiry) {
                console.log('>>>', currentSetting);
                console.log('>>>', currentSetting.expiry);

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

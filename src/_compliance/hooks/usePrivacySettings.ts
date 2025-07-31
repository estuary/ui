import { useCallback, useMemo } from 'react';

import { DateTime } from 'luxon';

import { useExpiringLocalStorage } from 'src/_compliance/hooks/useExpiringLocalStorage';
import { defaultPrivacySettings } from 'src/_compliance/shared';
import { useUserStore } from 'src/context/User/useUserContextStore';
import { identifyUser } from 'src/services/logrocket';

function usePrivacySettings() {
    const [currentSetting, setVal, revokeAccess] = useExpiringLocalStorage(
        'estuary.privacy-settings',
        defaultPrivacySettings
    );

    const user = useUserStore((state) => state.user);

    const idUser = useCallback(() => {
        if (user) {
            identifyUser(user);
        }
    }, [user]);

    const setPrivacySettings = useCallback(
        (newVal: boolean) => {
            if (newVal) {
                setVal(
                    {
                        enhancedSupportEnabled: true,
                        sessionRecordingEnabled: true,
                    },
                    {
                        seconds: 60,
                    }
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
            if (currentSetting) {
                return [
                    Boolean(currentSetting.enhancedSupportEnabled),
                    DateTime.utc(currentSetting.expiry ?? 0),
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

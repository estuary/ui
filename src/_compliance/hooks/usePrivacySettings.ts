import { useCallback } from 'react';

import { useLocalStorage } from 'react-use';

import { defaultPrivacySettings } from 'src/_compliance/shared';
import { useUserStore } from 'src/context/User/useUserContextStore';
import { identifyUser } from 'src/services/logrocket';
import { LocalStorageKeys, setWithExpiry } from 'src/utils/localStorage-utils';

function usePrivacySettings() {
    const [privacySettings, setPrivacySettings] = useLocalStorage(
        LocalStorageKeys.PRIVACY_SETTINGS,
        defaultPrivacySettings
    );

    const user = useUserStore((state) => state.user);

    const idUser = useCallback(() => {
        if (user) {
            identifyUser(user);
        }
    }, [user]);

    const setPrivacySettings2 = useCallback(
        (newVal: boolean) => {
            setWithExpiry(LocalStorageKeys.PRIVACY_SETTINGS, newVal, {
                seconds: 15,
            });

            if (newVal) {
                idUser();
            }
        },
        [idUser]
    );

    return {
        privacySettings,
        setPrivacySettings,
        setPrivacySettings2,
    };
}

export default usePrivacySettings;

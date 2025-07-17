import { useCallback } from 'react';

import { useUserStore } from 'src/context/User/useUserContextStore';
import { identifyUser } from 'src/services/logrocket';
import { LocalStorageKeys, setWithExpiry } from 'src/utils/localStorage-utils';

function useEnhancedSupport() {
    const user = useUserStore((state) => state.user);

    const idUser = useCallback(() => {
        if (user) {
            identifyUser(user);
        }
    }, [user]);

    const toggleEnhancedSupport = useCallback(
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
        idUser,
        toggleEnhancedSupport,
    };
}

export default useEnhancedSupport;

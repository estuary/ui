import { useCallback, useMemo, useState } from 'react';

import { useEffectOnce } from 'react-use';

import { clearAuthorizationCache } from 'src/hooks/gatewayAuth/cache';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'src/hooks/searchParams/useGlobalSearchParams';

function useLoginStateHandler(showRegistration?: boolean) {
    const grantToken = useGlobalSearchParams(GlobalSearchParams.GRANT_TOKEN);
    useEffectOnce(() => clearAuthorizationCache());

    const [tabIndex, setTabIndex] = useState(Boolean(showRegistration) ? 1 : 0);
    const handleChange = useCallback(
        (event: React.SyntheticEvent, newValue: number) => {
            setTabIndex(newValue);
        },
        []
    );
    const isRegister = tabIndex === 1;

    return useMemo(
        () => ({
            grantToken,
            handleChange,
            isRegister,
            tabIndex,
        }),
        [grantToken, handleChange, isRegister, tabIndex]
    );
}

export default useLoginStateHandler;

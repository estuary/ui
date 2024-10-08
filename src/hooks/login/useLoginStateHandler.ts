import { clearAuthorizationCache } from 'hooks/gatewayAuth/cache';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import { useCallback, useMemo, useState } from 'react';
import { useEffectOnce } from 'react-use';

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

import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import { useCallback, useMemo, useState } from 'react';
import { useEffectOnce, useLocalStorage } from 'react-use';
import { LocalStorageKeys } from 'utils/localStorage-utils';

function useLoginStateHandler(showRegistration?: boolean) {
    const grantToken = useGlobalSearchParams(GlobalSearchParams.GRANT_TOKEN);
    const { 2: clearGatewayConfig } = useLocalStorage(LocalStorageKeys.GATEWAY);
    useEffectOnce(() => clearGatewayConfig());

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

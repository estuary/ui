import { useMemo } from 'react';

import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'src/hooks/searchParams/useGlobalSearchParams';

function useLoginHints() {
    const login_hint = useGlobalSearchParams(
        GlobalSearchParams.LOGIN_HINTS_GOOGLE
    );

    return useMemo(
        () => ({
            google: login_hint,
        }),
        [login_hint]
    );
}

export default useLoginHints;

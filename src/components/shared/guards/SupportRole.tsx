import type { InputBaseComponentProps } from '@mui/material';

import { useUserInfoSummaryStore } from 'src/context/UserInfoSummary/useUserInfoSummaryStore';
import { isProduction } from 'src/utils/env-utils';

function HasSupportRoleGuard({ children }: InputBaseComponentProps) {
    const hasSupportAccess = useUserInfoSummaryStore(
        (state) => state.hasSupportAccess
    );

    if (!hasSupportAccess && isProduction) {
        return null;
    }

    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{children}</>;
}

export default HasSupportRoleGuard;

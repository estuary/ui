import type { BaseComponentProps } from 'src/types';

import OnboardGuard from 'src/app/guards/OnboardGuard';
import SsoUserMessage from 'src/app/guards/TenantGuard/SsoUserMessage';
import { useUserStore } from 'src/context/User/useUserContextStore';
import { useUserInfoSummaryStore } from 'src/context/UserInfoSummary/useUserInfoSummaryStore';

function TenantGuard({ children }: BaseComponentProps) {
    const hasAnyAccess = useUserInfoSummaryStore((state) => state.hasAnyAccess);
    const mutate = useUserInfoSummaryStore((state) => state.mutate);
    const usedSSO = useUserStore((state) => state.userDetails?.usedSSO);

    if (!hasAnyAccess) {
        if (usedSSO) {
            return <SsoUserMessage />;
        }

        return <OnboardGuard grantsMutate={mutate} />;
    } else {
        // eslint-disable-next-line react/jsx-no-useless-fragment
        return <>{children}</>;
    }
}

export default TenantGuard;

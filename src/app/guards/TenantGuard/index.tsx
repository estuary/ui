import type { BaseComponentProps } from 'src/types';

import SsoUserMessage from 'src/app/guards/TenantGuard/SsoUserMessage';
import { OnboardingPage } from 'src/components/onboarding/OnboardingPage';
import { useUserStore } from 'src/context/User/useUserContextStore';
import { useUserInfoSummaryStore } from 'src/context/UserInfoSummary/useUserInfoSummaryStore';

function TenantGuard({ children }: BaseComponentProps) {
    const hasAnyAccess = useUserInfoSummaryStore((state) => state.hasAnyAccess);
    const usedSSO = useUserStore((state) => state.userDetails?.usedSSO);

    if (!hasAnyAccess) {
        if (usedSSO) {
            return <SsoUserMessage />;
        }

        return <OnboardingPage />;
    } else {
        // eslint-disable-next-line react/jsx-no-useless-fragment
        return <>{children}</>;
    }
}

export default TenantGuard;

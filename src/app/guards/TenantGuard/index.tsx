import type { BaseComponentProps } from 'src/types';

import { useMemo } from 'react';

import OnboardGuard from 'src/app/guards/OnboardGuard';
import SsoUserMessage from 'src/app/guards/TenantGuard/SsoUserMessage';
import { useUserStore } from 'src/context/User/useUserContextStore';
import { useUserInfoSummaryStore } from 'src/context/UserInfoSummary/useUserInfoSummaryStore';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'src/hooks/searchParams/useGlobalSearchParams';

// This is a way to very simply "hide" the flow where anyone
//  can create a tenant but allow us to test it out in prod.
const hiddenSearchParam = 'please_show';

function TenantGuard({ children }: BaseComponentProps) {
    const showTenantCreation = useGlobalSearchParams(
        GlobalSearchParams.HIDDEN_SHOW_BETA
    );
    const showBeta = useMemo(
        () => showTenantCreation === hiddenSearchParam,
        [showTenantCreation]
    );

    const hasAnyAccess = useUserInfoSummaryStore((state) => state.hasAnyAccess);
    const mutate = useUserInfoSummaryStore((state) => state.mutate);
    const usedSSO = useUserStore((state) => state.userDetails?.usedSSO);

    const showOnboarding = !hasAnyAccess || showBeta;
    if (showOnboarding) {
        if (usedSSO && !showBeta) {
            return <SsoUserMessage />;
        }

        return (
            <OnboardGuard grantsMutate={mutate} forceDisplay={showOnboarding} />
        );
    } else {
        // eslint-disable-next-line react/jsx-no-useless-fragment
        return <>{children}</>;
    }
}

export default TenantGuard;

import { useUserInfoSummaryStore } from 'context/UserInfoSummary/useUserInfoSummaryStore';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import { useMemo } from 'react';
import { BaseComponentProps } from 'types';
import OnboardGuard from './OnboardGuard';

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

    const showOnboarding = !hasAnyAccess || showBeta;
    if (showOnboarding) {
        return (
            <OnboardGuard grantsMutate={mutate} forceDisplay={showOnboarding} />
        );
    } else {
        // eslint-disable-next-line react/jsx-no-useless-fragment
        return <>{children}</>;
    }
}

export default TenantGuard;

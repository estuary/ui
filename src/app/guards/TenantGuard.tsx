import FullPageSpinner from 'components/fullPage/Spinner';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import useUserGrants from 'hooks/useUserGrants';
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

    const {
        userGrants,
        isValidating: checkingGrants,
        mutate,
    } = useUserGrants({
        singleCall: true,
    });

    if (checkingGrants) {
        return <FullPageSpinner />;
    } else if (userGrants.length === 0 || showBeta) {
        return <OnboardGuard grantsMutate={mutate} forceDisplay={showBeta} />;
    } else {
        // eslint-disable-next-line react/jsx-no-useless-fragment
        return <>{children}</>;
    }
}

export default TenantGuard;

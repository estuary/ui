import FullPageError from 'components/fullPage/Error';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import useUserGrants from 'hooks/useUserGrants';
import { useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
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
        error,
    } = useUserGrants({
        singleCall: true,
    });

    if (checkingGrants) {
        return null;
    }

    if (error) {
        return (
            <FullPageError
                error={error}
                message={
                    <FormattedMessage id="fetcher.tenants.error.message" />
                }
            />
        );
    }

    const showOnboarding = userGrants.length === 0 || showBeta;
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

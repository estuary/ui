import FullPageSpinner from 'components/fullPage/Spinner';
import useCombinedGrantsExt from 'hooks/useCombinedGrantsExt';
import { BaseComponentProps } from 'types';
import OnboardGuard from './OnboardGuard';

function TenantGuard({ children }: BaseComponentProps) {
    console.log('Guard:Tenant');

    const { combinedGrants, isValidating: checkingGrants } =
        useCombinedGrantsExt({
            singleCall: true,
        });

    if (checkingGrants) {
        return <FullPageSpinner />;
    } else if (combinedGrants.length === 0) {
        return <OnboardGuard />;
    } else {
        // eslint-disable-next-line react/jsx-no-useless-fragment
        return <>{children}</>;
    }
}

export default TenantGuard;

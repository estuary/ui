import FullPageSpinner from 'components/fullPage/Spinner';
import BetaOnboard from 'directives/BetaOnboard';
import useCombinedGrantsExt from 'hooks/useCombinedGrantsExt';
import { BaseComponentProps } from 'types';
import DirectiveGuard from './DirectiveGuard';

function TenantGuard({ children }: BaseComponentProps) {
    console.log('Guard:Tenant');

    const { combinedGrants, isValidating: checkingGrants } =
        useCombinedGrantsExt({
            singleCall: true,
        });

    if (checkingGrants) {
        return <FullPageSpinner />;
    } else if (combinedGrants.length === 0) {
        return (
            <DirectiveGuard
                form={<BetaOnboard />}
                selectedDirective="betaOnboard"
            >
                {children}
            </DirectiveGuard>
        );
    } else {
        // eslint-disable-next-line react/jsx-no-useless-fragment
        return <>{children}</>;
    }
}

export default TenantGuard;

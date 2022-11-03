import FullPageSpinner from 'components/fullPage/Spinner';
import BetaOnboard from 'directives/BetaOnboard';
import FullPageWrapper from 'directives/FullPageWrapper';
import { DirectiveStates } from 'directives/shared';
import { BaseComponentProps } from 'types';
import useDirectiveGuard from './hooks';

const SELECTED_DIRECTIVE = 'betaOnboard';

// We need to pass the grants mutate and NOT the directive guards mutate
//  because The Onboard guard is kind of like a "child guard" of the Tenant
//  guard. This is only until all users to transinioned to haveing the
//  onboarding directive filled out. Once we remove this then we need to
//  stop passing in the grantsMutate and pass the directiveGuard mutate.
interface Props extends BaseComponentProps {
    grantsMutate: any;
}

function OnboardGuard({ children, grantsMutate }: Props) {
    const { directive, loading, status } =
        useDirectiveGuard(SELECTED_DIRECTIVE);

    if (loading || status === null) {
        return <FullPageSpinner />;
    } else if (status !== DirectiveStates.FUFILLED) {
        return (
            <FullPageWrapper>
                <BetaOnboard
                    directive={directive}
                    status={status}
                    mutate={grantsMutate}
                />
            </FullPageWrapper>
        );
    } else {
        // Only returning the child and need the JSX Fragment
        // eslint-disable-next-line react/jsx-no-useless-fragment
        return <>{children}</>;
    }
}

export default OnboardGuard;

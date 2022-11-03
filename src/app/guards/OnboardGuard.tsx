import FullPageSpinner from 'components/fullPage/Spinner';
import BetaOnboard from 'directives/BetaOnboard';
import FullPageWrapper from 'directives/FullPageWrapper';
import { DirectiveStates } from 'directives/shared';
import { BaseComponentProps } from 'types';
import useDirectiveGuard from './hooks';

const SELECTED_DIRECTIVE = 'betaOnboard';

function OnboardGuard({ children }: BaseComponentProps) {
    const { directive, loading, status } =
        useDirectiveGuard(SELECTED_DIRECTIVE);

    if (loading || status === null) {
        return <FullPageSpinner />;
    } else if (status !== DirectiveStates.FUFILLED) {
        return (
            <FullPageWrapper>
                <BetaOnboard directive={directive} status={status} />
            </FullPageWrapper>
        );
    } else {
        // Only returning the child and need the JSX Fragment
        // eslint-disable-next-line react/jsx-no-useless-fragment
        return <>{children}</>;
    }
}

export default OnboardGuard;

import { BaseComponentProps } from 'types';

import { useMemo } from 'react';

import FullPageSpinner from 'components/fullPage/Spinner';

import { LocalZustandProvider } from 'context/LocalZustand';

import BetaOnboard from 'directives/BetaOnboard';
import FullPageWrapper from 'directives/FullPageWrapper';
import { createOnboardingStore } from 'directives/Onboard/Store/create';

import { OnboardingStoreNames } from 'stores/names';

import useDirectiveGuard from './hooks';

const SELECTED_DIRECTIVE = 'betaOnboard';

// We need to pass the grants mutate and NOT the directive guards mutate
//  because The Onboard guard is kind of like a "child guard" of the Tenant
//  guard. This is only until all users to transitioned to having the
//  onboarding directive filled out. Once we remove this then we need to
//  stop passing in the grantsMutate and pass the directiveGuard mutate.
interface Props extends BaseComponentProps {
    grantsMutate: any;
    forceDisplay?: boolean;
}

function OnboardGuard({ children, forceDisplay, grantsMutate }: Props) {
    const { directive, loading, status } = useDirectiveGuard(
        SELECTED_DIRECTIVE,
        { forceNew: forceDisplay }
    );

    const localStore = useMemo(
        () => createOnboardingStore(OnboardingStoreNames.GENERAL),
        []
    );

    if (loading || status === null) {
        return <FullPageSpinner />;
    } else if (forceDisplay || status !== 'fulfilled') {
        return (
            <FullPageWrapper fullWidth={true}>
                <LocalZustandProvider createStore={localStore}>
                    <BetaOnboard
                        directive={directive}
                        status={status}
                        mutate={grantsMutate}
                    />
                </LocalZustandProvider>
            </FullPageWrapper>
        );
    } else {
        // Only returning the child and need the JSX Fragment
        // eslint-disable-next-line react/jsx-no-useless-fragment
        return <>{children}</>;
    }
}

export default OnboardGuard;

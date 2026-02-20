import type { BaseComponentProps } from 'src/types';

import { useMemo } from 'react';

import { Grid } from '@mui/material';

import FullPageWrapper from 'src/app/FullPageWrapper';
import useDirectiveGuard from 'src/app/guards/hooks';
import { LocalZustandProvider } from 'src/context/LocalZustand';
import BetaOnboard from 'src/directives/BetaOnboard';
import CustomerQuote from 'src/directives/Onboard/CustomerQuote';
import { createOnboardingStore } from 'src/directives/Onboard/Store/create';
import { OnboardingStoreNames } from 'src/stores/names';

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
        return null;
    } else if (forceDisplay || status !== 'fulfilled') {
        return (
            <FullPageWrapper fullWidth>
                <Grid
                    container
                    sx={{
                        p: 2,
                    }}
                >
                    <Grid size={{ xs: 0, md: 6 }}>
                        <CustomerQuote />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <LocalZustandProvider createStore={localStore}>
                            <BetaOnboard
                                directive={directive}
                                status={status}
                                mutate={grantsMutate}
                            />
                        </LocalZustandProvider>
                    </Grid>
                </Grid>
            </FullPageWrapper>
        );
    } else {
        // Only returning the child and need the JSX Fragment
        // eslint-disable-next-line react/jsx-no-useless-fragment
        return <>{children}</>;
    }
}

export default OnboardGuard;

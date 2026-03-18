import { useEffect, useRef } from 'react';

import { useUserStore } from 'src/context/User/useUserContextStore';

import 'react-reflex/styles.css';

import type { BaseComponentProps } from 'src/types';

import { usePostHog } from '@posthog/react';

import { getUserDetails } from 'src/services/shared';
import { getPostHogSettings } from 'src/utils/env-utils';

const postHogSettings = getPostHogSettings();

// This is not truly a guard. We put this here to capture the user data
//  AFTER they have agreed to terms. This is separate from LogRocket because
//  we use that purly for support reasons.
function AnalyticsGuard({ children }: BaseComponentProps) {
    // We only want to idenfity users once. Since the user object changes
    //  everytime the user focuses on the tab we could end up spamming calls.
    const identifiedUser = useRef(false);
    const user = useUserStore((state) => state.user);

    const postHog = usePostHog();

    useEffect(() => {
        if (user && !identifiedUser.current) {
            identifiedUser.current = true;

            const userDetails = getUserDetails(user);
            if (
                userDetails &&
                postHogSettings?.idUser &&
                !postHog._isIdentified()
            ) {
                const { id, email, emailVerified, userName, usedSSO } =
                    userDetails;

                postHog.identify(id, {
                    lastLogin: new Date(),
                    email,
                    emailVerified,
                    userName,
                    usedSSO,
                });
            }
        }
    }, [postHog, user]);

    return (
        // eslint-disable-next-line react/jsx-no-useless-fragment
        <>{children}</>
    );
}

export default AnalyticsGuard;

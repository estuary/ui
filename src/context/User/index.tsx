import type { BaseComponentProps } from 'src/types';

import { useEffect } from 'react';

import { usePostHog } from '@posthog/react';

import { supabaseClient } from 'src/context/GlobalProviders';
import { useUserStore } from 'src/context/User/useUserContextStore';
import {
    getUserDetails,
    logRocketConsole,
    logRocketEvent,
} from 'src/services/shared';
import { CustomEvents } from 'src/services/types';

const UserStoreProvider = ({ children }: BaseComponentProps) => {
    const postHog = usePostHog();
    const [setInitialized, setSession, setUser, setUserDetails] = useUserStore(
        (state) => [
            state.setInitialized,
            state.setSession,
            state.setUser,
            state.setUserDetails,
        ]
    );

    useEffect(() => {
        // This listens for all events including sign in and sign out
        const { data: authListener } = supabaseClient.auth.onAuthStateChange(
            async (event, change_session) => {
                logRocketConsole('Auth:Event:', event);

                if (event === 'INITIAL_SESSION') {
                    setInitialized(true);
                }

                if (!change_session) {
                    setSession(null);
                    setUser(null);
                    logRocketEvent(CustomEvents.AUTH_SIGNOUT, {
                        trigger: 'UserContext:session',
                    });
                    postHog.reset();
                    return;
                }

                setSession(change_session);
                setUser(change_session.user);
                setUserDetails(getUserDetails(change_session.user));
            }
        );

        return () => {
            authListener.subscription.unsubscribe();
        };
        // No deps so this function is not wired up a second time
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        // eslint-disable-next-line react/jsx-no-useless-fragment
        <>{children}</>
    );
};

export { UserStoreProvider };

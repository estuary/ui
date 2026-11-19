import type { BaseComponentProps } from 'src/types';

import { useEffect } from 'react';

import { useShallow } from 'zustand/react/shallow';

import { usePostHog } from '@posthog/react';

import { useUserStore } from 'src/context/User/useUserContextStore';
import { clearAnonymousId } from 'src/services/anonymousId';
import {
    getUserDetails,
    logRocketConsole,
    logRocketEvent,
} from 'src/services/shared';
import { supabaseClient } from 'src/services/supabaseClient';
import { CustomEvents } from 'src/services/types';

const UserStoreProvider = ({ children }: BaseComponentProps) => {
    const postHog = usePostHog();
    const [setInitialized, setSession, setUser, setUserDetails] = useUserStore(
        useShallow((state) => [
            state.setInitialized,
            state.setSession,
            state.setUser,
            state.setUserDetails,
        ])
    );

    useEffect(() => {
        // This listens for all events including sign in and sign out
        const { data: authListener } = supabaseClient.auth.onAuthStateChange(
            async (event, change_session) => {
                logRocketConsole('Auth:Event:', event);

                if (event === 'INITIAL_SESSION') {
                    setInitialized(true);
                }

                // Single source of truth for signing the user out. Supabase
                // fires this with a null session when the refresh token is
                // rejected, revoked, or the user explicitly signs out.
                if (!change_session) {
                    setSession(null);
                    setUser(null);
                    logRocketEvent(CustomEvents.AUTH_SIGNOUT, {
                        trigger: 'UserContext:session',
                    });
                    postHog.reset();
                    // Only on a real sign out: this branch also runs for a
                    // visitor's initial, session-less page load, which is
                    // exactly when the handoff ID must be kept.
                    if (event === 'SIGNED_OUT') {
                        clearAnonymousId();
                    }
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

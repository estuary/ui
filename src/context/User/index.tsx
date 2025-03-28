import { useEffect } from 'react';
import { BaseComponentProps } from 'src/types';
import {
    logRocketConsole,
    logRocketEvent,
    getUserDetails,
} from 'src/services/shared';
import { CustomEvents } from 'src/services/types';
import { supabaseClient } from 'src/context/GlobalProviders';
import { useUserStore } from './useUserContextStore';

const UserStoreProvider = ({ children }: BaseComponentProps) => {
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

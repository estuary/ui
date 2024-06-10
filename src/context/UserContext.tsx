// This is taken from https://github.com/supabase-community/auth-ui/blob/main/packages/react/src/components/Auth/UserContext.tsx
//  Then updated so it works with the older version of Supabase JS

import { useEffect, useState, createContext, useContext, useRef } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { BaseComponentProps } from 'types';
import { logRocketConsole, logRocketEvent } from 'services/shared';
import { CustomEvents } from 'services/types';
import { supabaseClient } from './Supabase';

export interface AuthSession {
    initialized: boolean;
    user: User | null;
    session: Session | null;
}

const UserContext = createContext<AuthSession | undefined>({
    initialized: false,
    user: null,
    session: null,
});

const UserContextProvider = ({ children }: BaseComponentProps) => {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(session?.user ?? null);
    const [initialized, setInitialized] = useState(false);
    const accessToken = useRef<string | undefined>(undefined);

    useEffect(() => {
        void (async () => {
            // TODO (auth) we need to look into if we want to fetch the user from supabase
            //  to be a bit safer. Not doing that now because this might cause weird issues
            //  for people with slow/poor networks.
            // Fetch the user info from the server to ensure we know who the user truly is
            // const { data } = await supabaseRetry(
            //     () => supabaseClient.auth.api.getUser(authSession.access_token),
            //     'supabase.getUser'
            // ).then(handleSuccess<User>, handleFailure);
            // if (!data) {
            //     setSession(null);
            //     setUser(null);
            //     logRocketEvent(CustomEvents.AUTH_SIGNOUT, {
            //         trigger: 'UserContext:user',
            //     });
            //     enqueueSnackbar(
            //         intl.formatMessage({ id: 'login.userNotFound.onRefresh' }),
            //         {
            //             anchorOrigin: {
            //                 vertical: 'top',
            //                 horizontal: 'center',
            //             },
            //             preventDuplicate: true,
            //             variant: 'error',
            //         }
            //     );
            //     await supabaseClient.auth.signOut();
            //     return;
            // }
            // setUser(data);
        })();

        // This listens for all events including sign in and sign out
        const { data: authListener } = supabaseClient.auth.onAuthStateChange(
            async (event, change_session) => {
                logRocketConsole('Auth:Event:', event);

                console.log('change_session', change_session);

                if (event === 'INITIAL_SESSION') {
                    setInitialized(true);
                } else if (
                    event === 'SIGNED_IN' &&
                    accessToken.current === change_session?.access_token
                ) {
                    return;
                }

                if (!change_session) {
                    setSession(null);
                    setUser(null);
                    accessToken.current = undefined;
                    logRocketEvent(CustomEvents.AUTH_SIGNOUT, {
                        trigger: 'UserContext:session',
                    });
                    return;
                }

                setSession(change_session);
                setUser(change_session.user);
                accessToken.current = change_session.access_token;
            }
        );

        return () => {
            authListener.subscription.unsubscribe();
        };
        // No deps so this function is not wired up a second time
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <UserContext.Provider
            value={{
                initialized,
                session,
                user,
            }}
        >
            {children}
        </UserContext.Provider>
    );
};

const useUser = () => {
    const context = useContext(UserContext);

    if (context === undefined) {
        throw new Error(`useUser must be used within a UserContextProvider.`);
    }

    return context;
};

export { UserContextProvider, useUser };

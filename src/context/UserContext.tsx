// This is taken from https://github.com/supabase-community/auth-ui/blob/main/packages/react/src/components/Auth/UserContext.tsx
//  Then updated so it works with the older version of Supabase JS

import { useEffect, useState, createContext, useContext, useRef } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { BaseComponentProps, UserDetails } from 'types';
import { logRocketConsole, logRocketEvent } from 'services/shared';
import { CustomEvents } from 'services/types';
import { getUserDetails } from 'services/supabase';
import { supabaseClient } from './Supabase';

export interface AuthSession {
    userDetails: UserDetails | null;
    initialized: boolean;
    user: User | null;
    session: Session | null;
}

const UserContext = createContext<AuthSession | undefined>({
    userDetails: null,
    initialized: false,
    user: null,
    session: null,
});

const UserContextProvider = ({ children }: BaseComponentProps) => {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(session?.user ?? null);
    const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
    const [initialized, setInitialized] = useState(false);
    const accessToken = useRef<string | undefined>(undefined);

    useEffect(() => {
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
                setUserDetails(getUserDetails(change_session.user));
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
                userDetails,
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

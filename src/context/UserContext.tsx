// This is taken from https://github.com/supabase-community/auth-ui/blob/main/packages/react/src/components/Auth/UserContext.tsx
//  Then updated so it works with the older version of Supabase JS

import { useEffect, useState, createContext, useContext } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { useClient } from 'hooks/supabase-swr';
import { BaseComponentProps } from 'types';

export interface AuthSession {
    user: User | null;
    session: Session | null;
}

const UserContext = createContext<AuthSession | undefined>({
    user: null,
    session: null,
});

const UserContextProvider = (props: BaseComponentProps) => {
    const supabaseClient = useClient();
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(session?.user ?? null);

    useEffect(() => {
        void (async () => {
            // const { data } = await supabaseClient.auth.getSession();
            const authSession = supabaseClient.auth.session();
            setSession(authSession);
            setUser(authSession?.user ?? null);
        })();

        const { data: authListener } = supabaseClient.auth.onAuthStateChange(
            async (_event, change_session) => {
                setSession(change_session);
                setUser(change_session?.user ?? null);
            }
        );

        return () => {
            authListener?.unsubscribe();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const value = {
        session,
        user,
    };
    return <UserContext.Provider value={value} {...props} />;
};

const useUser = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error(`useUser must be used within a UserContextProvider.`);
    }
    return context;
};

export { UserContextProvider, useUser };

import { Session, User } from '@supabase/supabase-js';
import { UserDetails } from 'types';

export interface AuthSession {
    userDetails: UserDetails | null;
    initialized: boolean;
    user: User | null;
    session: Session | null;
}

export interface UserStore extends AuthSession {
    setInitialized: (newVal: AuthSession['initialized']) => void;
    setSession: (newVal: AuthSession['session']) => void;
    setUser: (newVal: AuthSession['user']) => void;
    setUserDetails: (newVal: AuthSession['userDetails']) => void;
}

import { Auth } from '@supabase/ui';
import { supabase } from 'services/supabase';
import { BaseComponentProps } from 'types';

export const AuthProvider = ({ children }: BaseComponentProps) => {
    return (
        <Auth.UserContextProvider supabaseClient={supabase}>
            {children}
        </Auth.UserContextProvider>
    );
};

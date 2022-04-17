import { Auth } from '@supabase/ui';
import { useClient } from 'hooks/supabase-swr';
import { BaseComponentProps } from 'types';

export const UserProvider = ({ children }: BaseComponentProps) => {
    const supabaseClient = useClient();
    return (
        <Auth.UserContextProvider supabaseClient={supabaseClient}>
            {children}
        </Auth.UserContextProvider>
    );
};

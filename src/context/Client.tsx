import { SwrSupabaseContext } from 'hooks/supabase-swr';
import { supabaseClient } from 'services/supabase';
import { BaseComponentProps } from 'types';

const ClientProvider = ({ children }: BaseComponentProps) => {
    return (
        <SwrSupabaseContext.Provider value={supabaseClient}>
            {children}
        </SwrSupabaseContext.Provider>
    );
};

export default ClientProvider;

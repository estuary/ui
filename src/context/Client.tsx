import { BaseComponentProps } from 'types';

import { SwrSupabaseContext } from 'hooks/supabase-swr';

import { supabaseClient } from 'services/supabase';

const ClientProvider = ({ children }: BaseComponentProps) => {
    return (
        <SwrSupabaseContext.Provider value={supabaseClient}>
            {children}
        </SwrSupabaseContext.Provider>
    );
};

export default ClientProvider;

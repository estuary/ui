import { supabaseClient } from 'services/supabase';
import { SwrSupabaseContext } from 'supabase-swr';
import { BaseComponentProps } from 'types';

const AppData = ({ children }: BaseComponentProps) => {
    return (
        <SwrSupabaseContext.Provider value={supabaseClient}>
            {children}
        </SwrSupabaseContext.Provider>
    );
};

export default AppData;

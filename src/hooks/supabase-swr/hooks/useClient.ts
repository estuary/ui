import { SupabaseClient } from '@supabase/supabase-js';
import { useContext } from 'react';
import Context from '../context';

const useClient = (): SupabaseClient => {
    const client = useContext(Context);

    if (client) {
        return client;
    } else {
        throw new Error('supabase client instance required');
    }
};

export default useClient;

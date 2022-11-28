import { Auth } from '@supabase/ui';
import { SwrSupabaseContext } from 'hooks/supabase-swr';
import { Outlet } from 'react-router-dom';
import { cliAuthClient } from 'services/supabase';

const CliAuthContextLayout = () => {
    return (
        <SwrSupabaseContext.Provider value={cliAuthClient}>
            <Auth.UserContextProvider supabaseClient={cliAuthClient}>
                <Outlet />
            </Auth.UserContextProvider>
        </SwrSupabaseContext.Provider>
    );
};

export default CliAuthContextLayout;

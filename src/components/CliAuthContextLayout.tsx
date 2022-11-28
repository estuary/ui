import { SwrSupabaseContext } from 'hooks/supabase-swr';
import { Outlet } from 'react-router-dom';
import { cliAuthClient } from 'services/supabase';

const CliAuthContextLayout = () => {
    return (
        <SwrSupabaseContext.Provider value={cliAuthClient}>
            <Outlet />
        </SwrSupabaseContext.Provider>
    );
};

export default CliAuthContextLayout;

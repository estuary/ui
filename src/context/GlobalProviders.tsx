import { createClient } from '@supabase/supabase-js';
import FullPageSpinner from 'components/fullPage/Spinner';
import { initGoogleTagManager } from 'services/gtm';
import { initLogRocket } from 'services/logrocket';
import { BaseComponentProps } from 'types';
import { useUserStore } from './User/useUserContextStore';

// Put global initializing code early. The LogRocket one _MUST_ be done
//  before the `createClient` call made below for Supabase
initLogRocket();
initGoogleTagManager();

if (
    !import.meta.env.VITE_SUPABASE_URL ||
    !import.meta.env.VITE_SUPABASE_ANON_KEY
) {
    throw new Error(
        'You must set the Supabase url and anon key in the env settings.'
    );
}

const supabaseSettings = {
    url: import.meta.env.VITE_SUPABASE_URL,
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
};

export const supabaseClient = createClient(
    supabaseSettings.url,
    supabaseSettings.anonKey
);

// This is not a normal provider... more like a guard... kind of. This is here so that we know createClient is called early and also
//  so it is called in a somewhat consistent order. This is also waiting until the client has been
//  constructed before letting the application start rendering.
function GlobalProviders({ children }: BaseComponentProps) {
    const initialized = useUserStore((state) => state.initialized);

    if (!initialized) {
        return <FullPageSpinner />;
    }

    // Only returning the child and need the JSX Fragment
    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{children}</>;
}

export default GlobalProviders;

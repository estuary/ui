import type { BaseComponentProps } from 'src/types';

import { createClient } from '@supabase/supabase-js';
import { enableMapSet, setAutoFreeze } from 'immer';

import FullPageSpinner from 'src/components/fullPage/Spinner';
import { useUserStore } from 'src/context/User/useUserContextStore';
import { initLogRocket } from 'src/services/logrocket';

// This is not a normal provider... more like a guard... kind of. This is here so that we know createClient is called early and also
//  so it is called in a somewhat consistent order. This is also waiting until the client has been
//  constructed before letting the application start rendering.

if (
    !import.meta.env.VITE_SUPABASE_URL ||
    !import.meta.env.VITE_SUPABASE_ANON_KEY ||
    !import.meta.env.VITE_GQL_URL
) {
    throw new Error(
        'Missing at least 1 environment config: [VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_GQL_URL]'
    );
}

// Put global initializing code early. The LogRocket one _MUST_ be done
//  before the `createClient` call made below for Supabase
initLogRocket();

// PostHog's init is in `ui/src/context/PostHog.tsx`

// Setup immer
enableMapSet();
setAutoFreeze(false);

// Setup Supabase
const supabaseSettings = {
    url: import.meta.env.VITE_SUPABASE_URL,
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
};

export const supabaseClient = createClient(
    supabaseSettings.url,
    supabaseSettings.anonKey
);

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

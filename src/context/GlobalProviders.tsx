import type { BaseComponentProps } from 'src/types';

import { createClient } from '@supabase/supabase-js';
import { enableMapSet, setAutoFreeze } from 'immer';

import { unauthenticatedRoutes } from 'src/app/routes';
import FullPageSpinner from 'src/components/fullPage/Spinner';
import { useUserStore } from 'src/context/User/useUserContextStore';
import { initLogRocket } from 'src/services/logrocket';
import { handleSsoRequired } from 'src/services/shared';

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

// Intercepts token refresh responses from Supabase to detect SSO requirements.
const ssoCheckingFetch: typeof fetch = async (input, init) => {
    const response = await fetch(input, init);

    if (!response.ok) {
        try {
            // clone here so we can pass the original response back to the caller unmodified
            const body = await response.clone().json();
            const message =
                body?.error_description ?? body?.message ?? body?.error;
            if (typeof message === 'string') {
                // handleSsoRequired redirects to SSO flow
                handleSsoRequired(message);
            }
        } catch {
            // Non-JSON response, skip
        }
    }

    return response;
};

export const supabaseClient = createClient(
    supabaseSettings.url,
    supabaseSettings.anonKey,
    { global: { fetch: ssoCheckingFetch } }
);

function GlobalProviders({ children }: BaseComponentProps) {
    const initialized = useUserStore((state) => state.initialized);
    const ssoNotSatisfied = useUserStore((state) => state.ssoNotSatisfied);

    if (!initialized) {
        return <FullPageSpinner />;
    }

    if (ssoNotSatisfied) {
        const params = new URLSearchParams({ domain: ssoNotSatisfied });
        window.location.href = `${unauthenticatedRoutes.ssoRequired.path}?${params}`;

        // show spinner momentarily while redirecting
        return <FullPageSpinner />;
    }

    // Only returning the child and need the JSX Fragment
    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{children}</>;
}

export default GlobalProviders;

import type { BaseComponentProps } from 'src/types';

import { createClient } from '@supabase/supabase-js';
import { enableMapSet, setAutoFreeze } from 'immer';

import { unauthenticatedRoutes } from 'src/app/routes';
import FullPageSpinner from 'src/components/fullPage/Spinner';
import { useUserStore } from 'src/context/User/useUserContextStore';
import { initLogRocket } from 'src/services/logrocket';
import { logRocketEvent } from 'src/services/shared';

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

// "sso_required:" is a special error message prefix defined in the `public.check_sso_requirement` SQL function
// that is configured in supabase as a custom Access Token (JWT) Claims hook
const SSO_REQUIRED_PREFIX = 'sso_required:';

// Intercepts Supabase responses to detect SSO requirements.
// When detected, redirects immediately to the SSO required page.
const ssoCheckingFetch: typeof fetch = async (input, init) => {
    const response = await fetch(input, init);

    if (!response.ok) {
        try {
            // clone so we don't consume the original body stream with json(),
            // preserving it for downstream code that expects to read the response body
            const body = await response.clone().json();
            const message = body?.message;
            if (
                typeof message === 'string' &&
                message.startsWith(SSO_REQUIRED_PREFIX)
            ) {
                const domain = message.slice(SSO_REQUIRED_PREFIX.length);
                logRocketEvent('Auth:SSORequired', { domain });
                const params = new URLSearchParams({ domain });

                window.location.href = `${unauthenticatedRoutes.ssoRequired.path}?${params}`;

                // Never resolve — we're navigating away, so prevent
                // downstream code from processing the error response
                // and flashing an error message before the redirect happens
                return new Promise<Response>(() => {});
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

    if (!initialized) {
        return <FullPageSpinner />;
    }

    // Only returning the child and need the JSX Fragment
    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{children}</>;
}

export default GlobalProviders;

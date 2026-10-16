import { createClient } from '@supabase/supabase-js';

import { unauthenticatedRoutes } from 'src/app/routes';
import { initLogRocket } from 'src/services/logrocket';
import { logRocketEvent } from 'src/services/shared';

// The app's single Supabase client. It lives in its own module so stores can
// import it without importing GlobalProviders (which imports those stores).

if (
    !import.meta.env.VITE_SUPABASE_URL ||
    !import.meta.env.VITE_SUPABASE_ANON_KEY ||
    !import.meta.env.VITE_ESTUARY_API_URL
) {
    throw new Error(
        'Missing at least 1 environment config: [VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_ESTUARY_API_URL]'
    );
}

// LogRocket must init before the `createClient` call below: LogRocket
//  instruments network calls at init, so a Supabase client created first would
//  make requests LogRocket never records or sanitizes.
initLogRocket();

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

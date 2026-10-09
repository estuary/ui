import type { CombinedError } from 'urql';

import { useEffect, useRef } from 'react';

import { usePostHog } from '@posthog/react';

import { logRocketEvent } from 'src/services/shared';

const EVENT_NAME = 'Tenant:OnboardingBlocked';

export function useOnboardingRequestError(
    resource: 'terms' | 'dataPlanes',
    loading: boolean,
    empty: boolean,
    error: CombinedError | undefined
) {
    const postHog = usePostHog();
    const lastReported = useRef<string | null>(null);
    const failed = Boolean(error);
    const networkError = Boolean(error?.networkError);

    useEffect(() => {
        if (loading) return;

        if (!failed && !empty) {
            lastReported.current = null;
            return;
        }

        const reason = failed ? 'request_failed' : 'empty_response';
        const errorType = failed
            ? networkError
                ? 'network'
                : 'graphql'
            : 'none';
        const key = `${resource}:${reason}:${errorType}`;

        // Report a persistent failure once, including across failed retries.
        // A successful response resets this so a later failure is reported.
        if (lastReported.current === key) return;
        lastReported.current = key;

        // Keep server messages and response bodies out of telemetry.
        const properties = { resource, reason, errorType };
        postHog.capture(EVENT_NAME, properties);
        logRocketEvent(EVENT_NAME, properties);
    }, [empty, failed, loading, networkError, postHog, resource]);
}

import type { BaseComponentProps } from 'src/types';

import { PostHogProvider } from '@posthog/react';
import posthog from 'posthog-js';

import { getPostHogSettings } from 'src/utils/env-utils';

(() => {
    const postHogSettings = getPostHogSettings();

    if (typeof window === 'undefined' || !postHogSettings) {
        return;
    }

    posthog.init(postHogSettings.publicToken, {
        api_host: postHogSettings.apiHost,
        defaults: '2025-11-30',
        cookieless_mode: 'always', // we do not have a cookie banner
        capture_performance: false, // we can monitor performance with LR
        disable_conversations: true, // do not use
        disable_product_tours: true, // do not use
        disable_session_recording: true, // do not use
        disable_surveys: true, // do not use
    });
})();

export function PHProvider({ children }: BaseComponentProps) {
    return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}

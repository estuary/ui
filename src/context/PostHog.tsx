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
        cookieless_mode: 'on_reject',
    });
})();

export function PHProvider({ children }: BaseComponentProps) {
    return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}

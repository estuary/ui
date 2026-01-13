import type { BaseComponentProps } from 'src/types';

import { PostHogProvider } from '@posthog/react';
import posthog from 'posthog-js';

import { getPostHogSettings } from 'src/utils/env-utils';

const postHogSettings = getPostHogSettings();

(() => {
    if (typeof window === 'undefined' || !postHogSettings) {
        return;
    }

    posthog.init(postHogSettings.publicToken, {
        api_host: postHogSettings.apiHost,
        defaults: '2025-05-24',
        cookieless_mode: 'on_reject',
        // TODO (PostHog)
        // https://posthog.com/docs/advanced/content-security-policy#supporting-nonce-directives
        // prepare_external_dependency_script: (script) => {
        //     script.nonce = '<your-nonce-value>';
        //     return script;
        // },
        // prepare_external_dependency_stylesheet: (stylesheet) => {
        //     stylesheet.nonce = '<your-nonce-value>';
        //     return stylesheet;
        // },
    });
})();

export function PHProvider({ children }: BaseComponentProps) {
    return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}

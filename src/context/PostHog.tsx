import type { BaseComponentProps } from 'src/types';

import { PostHogProvider } from '@posthog/react';
import posthog from 'posthog-js';

import {
    sanitizeCaptureResult,
    scrubPersistence,
} from 'src/services/posthogAllowlist';
import { purgeRetiredPostHogStorage } from 'src/services/posthogRetiredStorage';
import { getPostHogSettings } from 'src/utils/env-utils';

// Query params masked by the SDK itself. posthog-js applies this to the
// current URL only, not the stored referrer, so it is a first layer. Stored
// state is made safe by scrubPersistence, which runs in `loaded` and
// before_send, both ahead of the debounced write to storage. The allowlist in
// before_send is what decides what analytics receives.
const NEVER_STORED_PARAMS = [
    'grantToken',
    'redirect_to',
    'request',
    'code',
    'state',
    'orig_url',
    'google_login_hint',
    'ssoProviderId',
    'access_token',
    'refresh_token',
    'provider_token',
    'setup_intent',
    'setup_intent_client_secret',
    'token',
    'name',
    'domain',
];

(() => {
    const postHogSettings = getPostHogSettings();

    if (typeof window === 'undefined') {
        return;
    }

    // Runs even with analytics disabled, so retired cookies are still cleared
    purgeRetiredPostHogStorage();

    if (!postHogSettings) {
        return;
    }

    posthog.init(postHogSettings.publicToken, {
        api_host: postHogSettings.apiHost,
        // Pinned on purpose; privacy-relevant options are set explicitly below
        defaults: '2025-11-30',

        // URLs: only allowlisted paths and query params are sent (before_send).
        // The options below keep everything else out of stored SDK state.
        disable_capture_url_hashes: true,
        mask_personal_data_properties: true,
        custom_personal_data_properties: NEVER_STORED_PARAMS,
        persistence_save_debounce_ms: 250,
        loaded: (instance) => scrubPersistence(instance),
        before_send: (event) => {
            scrubPersistence(posthog);
            return sanitizeCaptureResult(event);
        },

        // Autocapture: record that a click happened, not what was on screen
        mask_all_text: true,
        mask_all_element_attributes: true,
        autocapture: {
            capture_copied_text: false,
            capture_value_css_selector_allowlist: [],
        },

        // Feature flags are not used
        advanced_disable_feature_flags: true,

        // These can be turned on from PostHog project settings, and their data
        // does not pass through before_send. A local false wins over the
        // remote setting for exceptions; console logs have no local off
        // switch, so every log record is dropped instead.
        capture_exceptions: false,
        logs: { beforeSend: () => null },

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

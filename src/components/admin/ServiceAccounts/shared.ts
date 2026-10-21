import type { Capability } from 'src/types';

import { DateTime, Duration } from 'luxon';

// Capabilities offered when granting access, ordered least- to most-privileged.
export const CAPABILITY_OPTIONS: Capability[] = ['read', 'admin'];

export const featureDescription = `Service accounts provide non-login identities for CI/CD pipelines, AI agents, and other programmatic integrations — including the Kafka-compatible API "dekaf".`;

// API key lifetimes. Values are ISO-8601 durations passed to createApiKey's
// required `validFor`. (The design's "No expiry" is omitted because the field
// is required.)
export interface LifetimeOption {
    label: string;
    value: string;
}

export const LIFETIME_OPTIONS: LifetimeOption[] = [
    { label: '30 days', value: 'P30D' },
    { label: '90 days', value: 'P90D' },
    { label: '180 days', value: 'P180D' },
    { label: '1 year', value: 'P1Y' },
];

export const DEFAULT_LIFETIME = 'P90D';

// The API returns only the secret on creation, not an expiry. Derive a
// human-readable expiry date from the ISO-8601 `validFor` for the reveal.
export function formatExpiryFromNow(validFor: string): string {
    const duration = Duration.fromISO(validFor);

    if (!duration.isValid) {
        return validFor;
    }

    return DateTime.now().plus(duration).toLocaleString(DateTime.DATE_MED);
}

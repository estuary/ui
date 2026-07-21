import type { Capability } from 'src/types';

import { DateTime, Duration } from 'luxon';

import { stringToColor } from 'src/utils/stableColor';

// A color valid for both <Chip color> and <ToggleButton color>.
export type CapabilityColor = 'info' | 'primary' | 'warning';

// How each capability reads. read is the gentlest (info), write is the working
// default (primary), admin is the most privileged (warning). Accepts a string
// since grant capabilities come from the GraphQL `Capability` enum, which also
// includes `none`.
const CAPABILITY_COLOR: Record<string, CapabilityColor> = {
    read: 'info',
    write: 'primary',
    admin: 'warning',
};

export function capabilityColor(capability: string): CapabilityColor {
    return CAPABILITY_COLOR[capability] ?? 'info';
}

// Capabilities offered when granting access, ordered least- to most-privileged.
export const CAPABILITY_OPTIONS: Capability[] = ['read', 'write', 'admin'];

// API key lifetimes. Values are ISO-8601 durations passed to
// createServiceAccountToken's required `validFor`. (The design's "No expiry"
// is omitted because the field is required.)
export interface LifetimeOption {
    label: string;
    value: string;
}

export const LIFETIME_OPTIONS: LifetimeOption[] = [
    { label: '30 days', value: 'P30D' },
    { label: '60 days', value: 'P60D' },
    { label: '90 days', value: 'P90D' },
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

// Split a catalog name into its containing prefix (including the trailing
// slash) and its leaf segment, e.g. "acmeCo/staging/ci-bot" ->
// { prefix: "acmeCo/staging/", leaf: "ci-bot" }.
export function splitCatalogName(catalogName: string): {
    prefix: string;
    leaf: string;
} {
    const trimmed = catalogName.replace(/\/$/, '');
    const lastSlash = trimmed.lastIndexOf('/');

    if (lastSlash === -1) {
        return { prefix: '', leaf: trimmed };
    }

    return {
        prefix: trimmed.slice(0, lastSlash + 1),
        leaf: trimmed.slice(lastSlash + 1),
    };
}

// Two-letter monogram for an account avatar, derived from its leaf name.
export function monogram(catalogName: string): string {
    const { leaf } = splitCatalogName(catalogName);
    const alphanumeric = leaf.replace(/[^a-z0-9]/gi, '');

    return (alphanumeric.slice(0, 1) || 'SA').toUpperCase();
}

// Stable per-account background color for the monogram avatar, derived from the
// catalog name. High lightness keeps dark monogram text readable across hues.
export function monogramColor(catalogName: string): string {
    return stringToColor(catalogName, { saturation: 80, lightness: 60 });
}

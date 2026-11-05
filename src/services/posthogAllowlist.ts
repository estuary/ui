import type { CaptureResult, PostHog, Properties } from 'posthog-js';

import { authenticatedRoutes, unauthenticatedRoutes } from 'src/app/routes';
import { GlobalSearchParams } from 'src/hooks/searchParams/useGlobalSearchParams';
import { TablePrefixes } from 'src/stores/Tables/hooks';

// Analytics only ever sees allowlisted paths and query params. Everything
// else is removed before an event leaves the browser. Add a param here only
// when analytics needs it.

const MAX_VALUE_LENGTH = 256;
export const UNMATCHED_PATH = '/__unmatched__';
export const INVALID_URL = '$invalid_url';

const CATALOG_NAME = /^[A-Za-z0-9_./-]{1,256}$/;
const FLOW_ID = /^[0-9a-fA-F:]{1,64}$/;
const IMAGE_PATH = /^[A-Za-z0-9_./:@-]{1,256}$/;
const BOOLEAN = /^(?:0|1|true|false)$/;
const DIALOG_IDS = ['create-storage-mapping', 'edit-storage-mapping'];

const anyValue = () => true;
const isCatalogName = (v: string) => CATALOG_NAME.test(v);
const isFlowId = (v: string) => FLOW_ID.test(v);

const VALUE_RULES: Record<string, (value: string) => boolean> = {
    [GlobalSearchParams.CATALOG_NAME]: isCatalogName,
    [GlobalSearchParams.PREFIX]: isCatalogName,
    tenant: isCatalogName,
    [GlobalSearchParams.LIVE_SPEC_ID]: isFlowId,
    [GlobalSearchParams.PREFILL_LIVE_SPEC_ID]: isFlowId,
    [GlobalSearchParams.DRAFT_ID]: isFlowId,
    [GlobalSearchParams.LAST_PUB_ID]: isFlowId,
    [GlobalSearchParams.DIFF_VIEW_MODIFIED]: isFlowId,
    [GlobalSearchParams.DIFF_VIEW_ORIGINAL]: isFlowId,
    [GlobalSearchParams.DATA_PLANE_ID]: isFlowId,
    [GlobalSearchParams.FORCED_SHARD_ENABLE]: (v) => BOOLEAN.test(v),
    [GlobalSearchParams.CONNECTOR_IMAGE_PATH]: (v) => IMAGE_PATH.test(v),
    [GlobalSearchParams.DIALOG]: (v) => DIALOG_IDS.includes(v),
    [GlobalSearchParams.PROVIDER]: (v) => v === 'google',
    utm_source: anyValue,
    utm_medium: anyValue,
    utm_campaign: anyValue,
    utm_content: anyValue,
    utm_term: anyValue,
};

// Table state params: <prefix>-p (page), -r (rows), -s (search), -c (sort
// column), -d (sort direction).
const TABLE_PARAM = new RegExp(
    `^(?:${Object.values(TablePrefixes).join('|')})-[prscd]$`
);

const isAllowedParam = (key: string, value: string): boolean => {
    if (value.length > MAX_VALUE_LENGTH) {
        return false;
    }

    if (TABLE_PARAM.test(key)) {
        return true;
    }

    return Object.hasOwn(VALUE_RULES, key) ? VALUE_RULES[key](value) : false;
};

const normalizePath = (path: string) => {
    if (path.length <= 1) {
        return path || '/';
    }

    return path.replace(/\/+$/, '') || '/';
};

const routeNodePath = (node: { path?: unknown; fullPath?: unknown }) => {
    if (typeof node.fullPath === 'string') {
        return node.fullPath;
    }

    if (typeof node.path === 'string') {
        return node.path.startsWith('/') ? node.path : `/${node.path}`;
    }

    return null;
};

const collectRoutePaths = (node: unknown, out: Set<string>) => {
    if (!node || typeof node !== 'object') {
        return;
    }

    const candidate = routeNodePath(node);
    if (candidate && !/[*:]/.test(candidate)) {
        out.add(normalizePath(candidate));
    }

    Object.values(node).forEach((child) => collectRoutePaths(child, out));
};

export const KNOWN_PATHS: ReadonlySet<string> = (() => {
    const paths = new Set<string>(['/', '/terms.html']);
    collectRoutePaths(authenticatedRoutes, paths);
    collectRoutePaths(unauthenticatedRoutes, paths);
    return paths;
})();

export const sanitizePath = (path: string): string => {
    const normalized = normalizePath(path);
    return KNOWN_PATHS.has(normalized) ? normalized : UNMATCHED_PATH;
};

const safeDecode = (raw: string): string | null => {
    try {
        return decodeURIComponent(raw.replace(/\+/g, ' '));
    } catch {
        return null;
    }
};

// Origin + allowlisted path + allowlisted query params. The fragment is always
// dropped. Kept params keep their original encoding so existing insights still
// match. Other origins are reduced to their origin.
export function sanitizeUrl(raw: string): string;
export function sanitizeUrl(raw: unknown): unknown;
export function sanitizeUrl(raw: unknown): unknown {
    if (typeof raw !== 'string' || raw === '' || raw === '$direct') {
        return raw;
    }

    let url: URL;
    try {
        url = new URL(raw, window.location.origin);
    } catch {
        return INVALID_URL;
    }

    if (url.origin === 'null') {
        return INVALID_URL;
    }

    if (url.origin !== window.location.origin) {
        return url.origin;
    }

    const kept = url.search
        .slice(1)
        .split('&')
        .filter((segment) => {
            if (!segment) {
                return false;
            }

            const eq = segment.indexOf('=');
            const key = safeDecode(eq === -1 ? segment : segment.slice(0, eq));
            const value = safeDecode(eq === -1 ? '' : segment.slice(eq + 1));

            return key !== null && value !== null && isAllowedParam(key, value);
        });

    const query = kept.length > 0 ? `?${kept.join('&')}` : '';

    return `${url.origin}${sanitizePath(url.pathname)}${query}`;
}

// Ad click ids and the referrer search keyword are never kept.
const CLICK_IDS =
    'gclid|gclsrc|dclid|gbraid|wbraid|fbclid|msclkid|twclid|li_fat_id|igshid|ttclid|rdt_cid|epik|qclid|sccid|oppref|bfcid|irclid|_kx';
const DROPPED_KEY = new RegExp(
    `^(?:\\$initial_|\\$session_entry_)?(?:${CLICK_IDS}|ph_keyword)$`
);
const URL_KEYS = new Set([
    '$current_url',
    '$referrer',
    '$session_entry_url',
    '$session_entry_referrer',
    '$initial_current_url',
    '$initial_referrer',
    '$external_click_url',
]);
const ABSOLUTE_URL = /^https?:\/\//i;

const isRecord = (value: unknown): value is Record<string, unknown> =>
    !!value && typeof value === 'object' && !Array.isArray(value);

const sanitizeProperties = (props: unknown) => {
    if (!isRecord(props)) {
        return;
    }

    Object.keys(props).forEach((key) => {
        // posthog-js drops an event whose token was removed in before_send
        if (key === 'token') {
            return;
        }

        const value = props[key];

        if (DROPPED_KEY.test(key)) {
            delete props[key];
        } else if (key === '$set' || key === '$set_once') {
            sanitizeProperties(value);
        } else if (key.endsWith('pathname') && typeof value === 'string') {
            props[key] = sanitizePath(value);
        } else if (
            typeof value === 'string' &&
            (URL_KEYS.has(key) || ABSOLUTE_URL.test(value))
        ) {
            // Any absolute URL in any top-level property is rebuilt, so URL
            // fields added by future SDK versions are covered as well.
            props[key] = sanitizeUrl(value);
        }
    });
};

const AUTOCAPTURE_EVENTS = new Set([
    '$autocapture',
    '$rageclick',
    '$dead_click',
    '$copy_autocapture',
]);
const AUTOCAPTURE_CONTENT_PROPS = [
    '$el_text',
    '$elements',
    '$external_click_url',
    '$selected_content',
    '$input_value',
];

// With mask_all_text and mask_all_element_attributes, each element in the
// chain is only its tag and position.
const CHAIN_ELEMENT = '[a-z][a-z0-9-]*:nth-child="\\d+"nth-of-type="\\d+"';
export const MINIMAL_CHAIN = new RegExp(
    `^${CHAIN_ELEMENT}(?:;${CHAIN_ELEMENT})*$`
);

const sanitizeHeatmapData = (data: Record<string, unknown>) => {
    const merged: Record<string, unknown[]> = {};

    Object.entries(data).forEach(([url, points]) => {
        const key = sanitizeUrl(url);
        merged[key] = [
            ...(merged[key] ?? []),
            ...(Array.isArray(points) ? points : []),
        ];
    });

    return merged;
};

export const sanitizeCaptureResult = (
    cr: CaptureResult | null
): CaptureResult | null => {
    if (!cr) {
        return cr;
    }

    const props = cr.properties;

    if (AUTOCAPTURE_EVENTS.has(cr.event)) {
        AUTOCAPTURE_CONTENT_PROPS.forEach((key) => {
            delete props[key];
        });

        const chain = props.$elements_chain;
        if (
            typeof chain === 'string' &&
            chain !== '' &&
            !MINIMAL_CHAIN.test(chain)
        ) {
            // Masking did not apply, so send nothing.
            return null;
        }
    }

    if (cr.event === '$$heatmap' && isRecord(props.$heatmap_data)) {
        props.$heatmap_data = sanitizeHeatmapData(props.$heatmap_data);
    }

    sanitizeProperties(props);
    sanitizeProperties(cr.$set);
    sanitizeProperties(cr.$set_once);

    return cr;
};

// posthog-js writes the first URL into persistence before before_send runs,
// and reads it back for $set_once. Rewrite the stored values through the same
// allowlist.
export const INITIAL_PERSON_INFO = '$initial_person_info'; // cookie
export const CLIENT_SESSION_PROPS = '$client_session_props'; // localStorage
export const LEGACY_INITIAL_REFERRER_INFO = '$initial_referrer_info';

const cleanStoredUrls = (info: Record<string, unknown>) => {
    const next = { ...info };

    if ('u' in info) {
        next.u = sanitizeUrl(info.u);
    }
    if ('r' in info) {
        next.r = sanitizeUrl(info.r);
    }
    if (typeof info.initialPathName === 'string') {
        next.initialPathName = sanitizePath(info.initialPathName);
    }

    const changed = Object.keys(next).some((key) => next[key] !== info[key]);

    return changed ? next : null;
};

export const scrubPersistence = (
    ph: Pick<PostHog, 'get_property' | 'register'> | undefined
) => {
    if (!ph) {
        return;
    }

    const updates: Properties = {};

    const info = ph.get_property(INITIAL_PERSON_INFO);
    if (isRecord(info)) {
        const next = cleanStoredUrls(info);
        if (next) {
            updates[INITIAL_PERSON_INFO] = next;
        }
    }

    const session = ph.get_property(CLIENT_SESSION_PROPS);
    if (isRecord(session) && isRecord(session.props)) {
        const next = cleanStoredUrls(session.props);
        if (next) {
            updates[CLIENT_SESSION_PROPS] = { ...session, props: next };
        }
    }

    const legacy = ph.get_property(LEGACY_INITIAL_REFERRER_INFO);
    if (isRecord(legacy) && typeof legacy.$referrer === 'string') {
        const referrer = sanitizeUrl(legacy.$referrer);
        if (referrer !== legacy.$referrer) {
            updates[LEGACY_INITIAL_REFERRER_INFO] = {
                ...legacy,
                $referrer: referrer,
            };
        }
    }

    if (Object.keys(updates).length > 0) {
        ph.register(updates);
    }
};

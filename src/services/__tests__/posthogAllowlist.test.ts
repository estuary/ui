import type { CaptureResult } from 'posthog-js';

import { authenticatedRoutes, unauthenticatedRoutes } from 'src/app/routes';
import {
    CLIENT_SESSION_PROPS,
    INITIAL_PERSON_INFO,
    INVALID_URL,
    KNOWN_PATHS,
    sanitizeCaptureResult,
    sanitizePath,
    sanitizeUrl,
    scrubPersistence,
    UNMATCHED_PATH,
} from 'src/services/posthogAllowlist';

const origin = window.location.origin;
const at = (pathAndQuery: string) => `${origin}${pathAndQuery}`;

const captureResult = (
    event: string,
    properties: Record<string, unknown>,
    extra: Partial<CaptureResult> = {}
): CaptureResult =>
    ({
        uuid: 'test-uuid',
        event,
        properties: { token: 'phc_test', ...properties },
        ...extra,
    }) as CaptureResult;

describe('sanitizeUrl', () => {
    test('drops the fragment', () => {
        expect(sanitizeUrl(at('/auth#access_token=X&refresh_token=Y'))).toBe(
            at('/auth')
        );
    });

    test('drops params that are not allowlisted', () => {
        expect(sanitizeUrl(at('/login?grantToken=X&ssoProviderId=Y'))).toBe(
            at('/login')
        );
    });

    test('keeps allowlisted params with their original encoding', () => {
        expect(
            sanitizeUrl(
                at(
                    '/captures?catalogName=a/b&cap-s=foo%20bar&draftId=not-an-id&zz=1'
                )
            )
        ).toBe(at('/captures?catalogName=a/b&cap-s=foo%20bar'));
    });

    test('keeps table state params for every table prefix', () => {
        expect(
            sanitizeUrl(
                at('/collections?col-p=%7B%7D&col-r=25&col-c=name&col-d=asc')
            )
        ).toBe(at('/collections?col-p=%7B%7D&col-r=25&col-c=name&col-d=asc'));
        expect(sanitizeUrl(at('/collections?xyz-s=foo'))).toBe(
            at('/collections')
        );
    });

    test('drops a catalogName that smuggles another param', () => {
        expect(
            sanitizeUrl(at('/captures?catalogName=a%3FgrantToken%3DX'))
        ).toBe(at('/captures'));
    });

    test('drops redirect_to entirely', () => {
        expect(
            sanitizeUrl(at('/login?redirect_to=%2Fcaptures%3FgrantToken%3DX'))
        ).toBe(at('/login'));
    });

    test('drops enum params with unknown values', () => {
        expect(sanitizeUrl(at('/admin/settings?dialog=evil'))).toBe(
            at('/admin/settings')
        );
        expect(
            sanitizeUrl(at('/admin/settings?dialog=create-storage-mapping'))
        ).toBe(at('/admin/settings?dialog=create-storage-mapping'));
        expect(sanitizeUrl(at('/login?provider=google'))).toBe(
            at('/login?provider=google')
        );
    });

    test('keeps prefix, tenant and id params with valid values', () => {
        const kept =
            '/captures?prefix=acmeCo/&tenant=acmeCo&draftId=0a1b2c3d4e5f6789&lastPubId=0a1b2c3d4e5f6789&diff_m=0a1b2c3d4e5f6789&diff_o=0a:1b:2c:3d&dataPlaneId=0a1b2c3d4e5f6789&forcedEnable=1';
        expect(sanitizeUrl(at(kept))).toBe(at(kept));
    });

    test('drops prefix, tenant and id params with invalid values', () => {
        expect(
            sanitizeUrl(
                at(
                    '/captures?prefix=a%3Fb%3Dc&tenant=a%20b&draftId=xyz&lastPubId=a/b&dataPlaneId=ops/us&forcedEnable=yes'
                )
            )
        ).toBe(at('/captures'));
    });

    test('drops params named after object prototype keys', () => {
        expect(
            sanitizeUrl(
                at(
                    '/captures?constructor=X&toString=Y&__proto__=Z&hasOwnProperty=W'
                )
            )
        ).toBe(at('/captures'));
    });

    test('drops values over the length limit', () => {
        expect(sanitizeUrl(at(`/captures?cap-s=${'a'.repeat(257)}`))).toBe(
            at('/captures')
        );
    });

    test('drops values that do not decode', () => {
        expect(sanitizeUrl(at('/captures?cap-s=%E0%A4%A'))).toBe(
            at('/captures')
        );
    });

    test('reduces other origins to the origin', () => {
        expect(sanitizeUrl('https://accounts.google.com/x?y=1#z')).toBe(
            'https://accounts.google.com'
        );
    });

    test('rejects URLs without an origin', () => {
        expect(sanitizeUrl('mailto:a@b')).toBe(INVALID_URL);
    });

    test('maps unknown paths to a placeholder', () => {
        expect(sanitizeUrl(at('/no/such/page?catalogName=a/b'))).toBe(
            at(`${UNMATCHED_PATH}?catalogName=a/b`)
        );
    });

    test('leaves non-URL values alone', () => {
        expect(sanitizeUrl('$direct')).toBe('$direct');
        expect(sanitizeUrl('')).toBe('');
        expect(sanitizeUrl(undefined)).toBeUndefined();
        expect(sanitizeUrl(42)).toBe(42);
    });
});

describe('sanitizePath', () => {
    const fullPaths: string[] = [];
    const collect = (node: unknown) => {
        if (!node || typeof node !== 'object') {
            return;
        }
        const { fullPath } = node as { fullPath?: unknown };
        if (typeof fullPath === 'string') {
            fullPaths.push(fullPath);
        }
        Object.values(node).forEach(collect);
    };
    collect(authenticatedRoutes);
    collect(unauthenticatedRoutes);

    test('finds the app routes', () => {
        expect(fullPaths.length).toBeGreaterThan(20);
        expect(KNOWN_PATHS.has('/captures/details/overview')).toBe(true);
    });

    test.each(fullPaths)('keeps the route %s', (path) => {
        expect(sanitizePath(path)).toBe(path);
    });

    test.each(['/', '/auth', '/login', '/sso-required', '/terms.html'])(
        'keeps the top-level route %s',
        (path) => {
            expect(sanitizePath(path)).toBe(path);
        }
    );

    test('ignores a trailing slash', () => {
        expect(sanitizePath('/captures/')).toBe('/captures');
    });

    test('maps unknown paths to a placeholder', () => {
        expect(sanitizePath('/acmeCo/secret-thing/404')).toBe(UNMATCHED_PATH);
    });
});

describe('sanitizeCaptureResult', () => {
    test('cleans every URL field on a pageview', () => {
        const dirty = at('/login?grantToken=X&catalogName=a/b#access_token=Y');
        const clean = at('/login?catalogName=a/b');

        const result = sanitizeCaptureResult(
            captureResult(
                '$pageview',
                {
                    $current_url: dirty,
                    $session_entry_url: dirty,
                    $referrer: dirty,
                    $pathname: '/acmeCo/thing',
                    $prev_pageview_pathname: '/login',
                    $host: 'localhost:3000',
                    ph_keyword: 'secret search',
                    gclid: 'click-id',
                    $session_entry_gclid: 'click-id',
                    utm_source: 'newsletter',
                },
                {
                    $set_once: {
                        $initial_current_url: dirty,
                        $current_url: dirty,
                        $initial_gclid: 'click-id',
                        $initial_pathname: '/acmeCo/thing',
                    },
                }
            )
        );

        expect(result?.properties).toEqual({
            token: 'phc_test',
            $current_url: clean,
            $session_entry_url: clean,
            $referrer: clean,
            $pathname: UNMATCHED_PATH,
            $prev_pageview_pathname: '/login',
            $host: 'localhost:3000',
            utm_source: 'newsletter',
        });
        expect(result?.$set_once).toEqual({
            $initial_current_url: clean,
            $current_url: clean,
            $initial_pathname: UNMATCHED_PATH,
        });
    });

    test('rebuilds absolute URLs in any property', () => {
        const result = sanitizeCaptureResult(
            captureResult('Custom_Event', {
                $future_url_field: at('/login?grantToken=X'),
                $set: { $some_url: 'https://example.com/a?b=c' },
                plain: 'not a url',
            })
        );

        expect(result?.properties.$future_url_field).toBe(at('/login'));
        expect(result?.properties.$set).toEqual({
            $some_url: 'https://example.com',
        });
        expect(result?.properties.plain).toBe('not a url');
    });

    test('never removes the token', () => {
        const result = sanitizeCaptureResult(
            captureResult('$pageview', { $current_url: at('/') })
        );
        expect(result?.properties.token).toBe('phc_test');
    });

    test('merges heatmap data whose URLs collapse to the same key', () => {
        const result = sanitizeCaptureResult(
            captureResult('$$heatmap', {
                $heatmap_data: {
                    [at('/auth#access_token=X')]: [{ x: 1 }],
                    [at('/auth?grantToken=Y')]: [{ x: 2 }],
                },
            })
        );

        expect(result?.properties.$heatmap_data).toEqual({
            [at('/auth')]: [{ x: 1 }, { x: 2 }],
        });
    });

    test('drops autocapture events that carry element content', () => {
        expect(
            sanitizeCaptureResult(
                captureResult('$autocapture', {
                    $elements_chain:
                        'span:text="Invite Link"nth-child="1"nth-of-type="1"attr__aria-label="https://x"',
                })
            )
        ).toBeNull();
        expect(
            sanitizeCaptureResult(
                captureResult('$rageclick', {
                    $elements_chain: 'a:href="/x"nth-child="1"nth-of-type="1"',
                })
            )
        ).toBeNull();
    });

    test('keeps masked autocapture events without their text', () => {
        const chain =
            'button:nth-child="2"nth-of-type="1";div:nth-child="1"nth-of-type="1"';
        const result = sanitizeCaptureResult(
            captureResult('$autocapture', {
                $elements_chain: chain,
                $el_text: 'user@example.com',
                $elements: [{ tag_name: 'button' }],
                $external_click_url: 'https://example.com/x',
                label: 'KEEP_LABEL',
            })
        );

        expect(result?.properties).toEqual({
            token: 'phc_test',
            $elements_chain: chain,
            label: 'KEEP_LABEL',
        });
    });

    test('passes null through', () => {
        expect(sanitizeCaptureResult(null)).toBeNull();
    });
});

describe('scrubPersistence', () => {
    const fakePostHog = (props: Record<string, unknown>) => ({
        get_property: vi.fn((key: string) => props[key]),
        register: vi.fn(),
    });

    test('uses the posthog-js persistence key names', () => {
        expect(INITIAL_PERSON_INFO).toBe('$initial_person_info');
        expect(CLIENT_SESSION_PROPS).toBe('$client_session_props');
    });

    test('rewrites stored URLs through the allowlist', () => {
        const ph = fakePostHog({
            [INITIAL_PERSON_INFO]: {
                u: at('/auth?grantToken=X#access_token=Y'),
                r: '$direct',
            },
            [CLIENT_SESSION_PROPS]: {
                sessionId: 'session',
                props: {
                    u: at('/captures?catalogName=a/b&draftId=not-an-id'),
                    r: 'https://www.google.com/search?q=secret',
                },
            },
            $initial_referrer_info: {
                $referrer: 'https://example.com/path?x=1',
                $referring_domain: 'example.com',
            },
        });

        scrubPersistence(ph);

        expect(ph.register).toHaveBeenCalledTimes(1);
        expect(ph.register).toHaveBeenCalledWith({
            [INITIAL_PERSON_INFO]: { u: at('/auth'), r: '$direct' },
            [CLIENT_SESSION_PROPS]: {
                sessionId: 'session',
                props: {
                    u: at('/captures?catalogName=a/b'),
                    r: 'https://www.google.com',
                },
            },
            $initial_referrer_info: {
                $referrer: 'https://example.com',
                $referring_domain: 'example.com',
            },
        });
    });

    test('rewrites the legacy session pathname', () => {
        const ph = fakePostHog({
            [CLIENT_SESSION_PROPS]: {
                sessionId: 'session',
                props: { initialPathName: '/acmeCo/x', utm_source: 'a' },
            },
        });

        scrubPersistence(ph);

        expect(ph.register).toHaveBeenCalledWith({
            [CLIENT_SESSION_PROPS]: {
                sessionId: 'session',
                props: { initialPathName: UNMATCHED_PATH, utm_source: 'a' },
            },
        });
    });

    test('does not write when everything is already clean', () => {
        const ph = fakePostHog({
            [INITIAL_PERSON_INFO]: { u: at('/captures'), r: '$direct' },
            [CLIENT_SESSION_PROPS]: {
                sessionId: 'session',
                props: { u: at('/'), r: '$direct' },
            },
        });

        scrubPersistence(ph);

        expect(ph.register).not.toHaveBeenCalled();
    });

    test('handles a missing instance', () => {
        expect(() => scrubPersistence(undefined)).not.toThrow();
    });
});

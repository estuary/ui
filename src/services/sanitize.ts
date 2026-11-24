import { isPlainObject } from 'lodash';

// Query params removed from recorded URLs
const strippedParams = ['grantToken', 'request', 'code', 'state'];

// Keys whose values are never recorded, at any depth. Compared case-insensitively.
const maskedKeys = new Set(
    [
        'access_token',
        'accessToken',
        'brokerToken',
        'client_secret',
        'clientSecret',
        'password',
        'provider_refresh_token',
        'provider_token',
        'reactorToken',
        'refresh_token',
        'refreshToken',
        'secret',
        'token',
    ].map((key) => key.toLowerCase())
);

// Removes the fragment and the stripped params. Returns the input unchanged
//  when there is nothing to remove or it does not parse as a URL.
export const sanitizeUrl = (url: string): string => {
    let parsed: URL;
    try {
        parsed = new URL(url);
    } catch {
        return url;
    }

    const params = strippedParams.filter((param) =>
        parsed.searchParams.has(param)
    );

    if (!parsed.hash && params.length === 0) {
        return url;
    }

    parsed.hash = '';
    params.forEach((param) => parsed.searchParams.delete(param));

    return parsed.toString();
};

// Walks arrays and plain objects, returning the same reference for anything
//  the visitor did not change.
const walk = (
    value: unknown,
    visit: (key: string | null, el: unknown) => unknown
): unknown => {
    if (Array.isArray(value)) {
        let changed = false;
        const next = value.map((el) => {
            const updated = visit(null, el);
            if (updated !== el) changed = true;
            return updated;
        });
        return changed ? next : value;
    }

    if (isPlainObject(value)) {
        let changed = false;
        const next: Record<string, unknown> = {};
        Object.entries(value as Record<string, unknown>).forEach(
            ([key, el]) => {
                const updated = visit(key, el);
                if (updated !== el) changed = true;
                next[key] = updated;
            }
        );
        return changed ? next : value;
    }

    return value;
};

// Replaces the value of every masked key with `mask`
export const maskKeys = <T>(value: T, mask: string): T => {
    const visit = (key: string | null, el: unknown): unknown =>
        key !== null &&
        maskedKeys.has(key.toLowerCase()) &&
        (typeof el === 'string' || typeof el === 'number')
            ? mask
            : walk(el, visit);

    return visit(null, value) as T;
};

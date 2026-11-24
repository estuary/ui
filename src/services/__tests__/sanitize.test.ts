import { describe, expect, it } from 'vitest';

import { maskKeys, sanitizeUrl } from 'src/services/sanitize';

const MASK = '**MASKED**';

describe('sanitizeUrl', () => {
    it('removes the fragment', () => {
        expect(sanitizeUrl('https://example.com/welcome#a=1&b=2')).toBe(
            'https://example.com/welcome'
        );
    });

    it('removes stripped params and keeps the rest', () => {
        expect(
            sanitizeUrl(
                'https://example.com/login?grantToken=abc&keep=1&code=x&state=y&request=z'
            )
        ).toBe('https://example.com/login?keep=1');
    });

    it('returns the input unchanged when there is nothing to remove', () => {
        const url = 'https://example.com/path?keep=a%20b';
        expect(sanitizeUrl(url)).toBe(url);
    });

    it('returns input that is not a URL unchanged', () => {
        expect(sanitizeUrl('not a url')).toBe('not a url');
    });
});

describe('maskKeys', () => {
    it('masks listed keys at any depth, ignoring case', () => {
        const input = {
            data: {
                items: {
                    edges: [{ node: { token: 'abc', detail: 'kept' } }],
                },
                result: { ClientSecret: 'xyz', id: 7 },
            },
        };

        expect(maskKeys(input, MASK)).toEqual({
            data: {
                items: {
                    edges: [{ node: { token: MASK, detail: 'kept' } }],
                },
                result: { ClientSecret: MASK, id: 7 },
            },
        });
    });

    it('walks into objects under a listed key instead of replacing them', () => {
        const input = { secret: { catalogName: 'a/b', secretId: '1' } };
        expect(maskKeys(input, MASK)).toBe(input);
    });

    it('does not modify the input', () => {
        const input = { token: 'abc' };
        maskKeys(input, MASK);
        expect(input.token).toBe('abc');
    });

    it('returns the same reference when nothing changes', () => {
        const input = { id: 1, logs_token: 'kept' };
        expect(maskKeys(input, MASK)).toBe(input);
    });
});

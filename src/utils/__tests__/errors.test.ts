import { AuthError, AuthSessionMissingError } from '@supabase/supabase-js';
import { CombinedError } from 'urql';
import { describe, expect, test } from 'vitest';

import { normalizeError } from 'src/utils/errors';

const SESSION_EXPIRED =
    'Your session expired. Please log in again to continue.';

describe('normalizeError', () => {
    describe('when the session has expired', () => {
        test('should explain on a 401 response', () => {
            const error = new CombinedError({ response: { status: 401 } });

            expect(normalizeError(error)?.message).toBe(SESSION_EXPIRED);
        });

        test('should explain when the request failed on a Supabase auth error', () => {
            const error = new CombinedError({
                networkError: new AuthSessionMissingError(),
            });

            expect(normalizeError(error)?.message).toBe(SESSION_EXPIRED);
        });

        test('should explain on a Supabase auth error', () => {
            const error = new AuthError('Refresh Token Not Found', 400);

            expect(normalizeError(error)?.message).toBe(SESSION_EXPIRED);
        });
    });

    describe('for a GraphQL request', () => {
        test('should return the first GraphQL error', () => {
            const error = new CombinedError({
                graphQLErrors: [
                    { message: 'document is stale' },
                    { message: 'second error' },
                ],
            });

            expect(normalizeError(error)?.message).toBe('document is stale');
        });

        test('should return the network error when there are no GraphQL errors', () => {
            const networkError = new Error('Failed to fetch');
            const error = new CombinedError({ networkError });

            expect(normalizeError(error)).toBe(networkError);
        });

        test('should preserve other HTTP errors', () => {
            const error = new CombinedError({
                networkError: new Error('Forbidden'),
                response: { status: 403 },
            });

            expect(normalizeError(error)?.message).toBe('Forbidden');
        });
    });

    test('should return an Error unchanged', () => {
        const error = new Error('encryption failed');

        expect(normalizeError(error)).toBe(error);
    });

    test('should wrap a string in an Error', () => {
        const normalized = normalizeError('something broke');

        expect(normalized).toBeInstanceOf(Error);
        expect(normalized?.message).toBe('something broke');
    });

    // e.g. a PostgREST error
    test('should keep the message of a plain object error', () => {
        const normalized = normalizeError({
            message: 'relation "draft_specs" does not exist',
            code: '42P01',
            details: null,
            hint: null,
        });

        expect(normalized).toBeInstanceOf(Error);
        expect(normalized?.message).toBe(
            'relation "draft_specs" does not exist'
        );
    });

    test('should fall back to a generic Error for an object without a string message', () => {
        expect(normalizeError({ message: 42 })?.message).toBe('Unknown error');
    });

    test.each([
        ['null', null],
        ['undefined', undefined],
        ['an object', { reason: 'nope' }],
    ])('should fall back to a generic Error for %s', (_label, error) => {
        expect(normalizeError(error)?.message).toBe('Unknown error');
    });
});

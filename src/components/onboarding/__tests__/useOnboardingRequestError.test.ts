import { renderHook } from '@testing-library/react';
import { CombinedError } from 'urql';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { useOnboardingRequestError } from 'src/components/onboarding/useOnboardingRequestError';

const mocks = vi.hoisted(() => ({ capture: vi.fn(), log: vi.fn() }));

vi.mock('@posthog/react', () => ({
    usePostHog: () => ({ capture: mocks.capture }),
}));
vi.mock('src/services/shared', () => ({ logRocketEvent: mocks.log }));

const eventName = 'Tenant:OnboardingBlocked';
const networkError = () =>
    new CombinedError({ networkError: new Error('private server details') });

describe('onboarding request error logging', () => {
    beforeEach(() => vi.clearAllMocks());

    test.each(['terms', 'dataPlanes'] as const)(
        'logs failed and empty %s responses with safe properties',
        (resource) => {
            const { rerender } = renderHook(
                ({ error }) =>
                    useOnboardingRequestError(resource, false, true, error),
                {
                    initialProps: {
                        error: networkError() as CombinedError | undefined,
                    },
                }
            );
            const properties = {
                resource,
                reason: 'request_failed',
                errorType: 'network',
            };
            expect(mocks.capture).toHaveBeenCalledWith(eventName, properties);
            expect(mocks.log).toHaveBeenCalledWith(eventName, properties);

            rerender({ error: undefined });
            const emptyProperties = {
                resource,
                reason: 'empty_response',
                errorType: 'none',
            };
            expect(mocks.capture).toHaveBeenLastCalledWith(
                eventName,
                emptyProperties
            );
            expect(mocks.log).toHaveBeenLastCalledWith(
                eventName,
                emptyProperties
            );
        }
    );

    test('distinguishes GraphQL errors even when partial data is returned', () => {
        renderHook(() =>
            useOnboardingRequestError(
                'terms',
                false,
                false,
                new CombinedError({
                    graphQLErrors: ['private GraphQL details'],
                })
            )
        );
        expect(mocks.capture).toHaveBeenCalledWith(eventName, {
            resource: 'terms',
            reason: 'request_failed',
            errorType: 'graphql',
        });
        expect(mocks.log).toHaveBeenCalledWith(eventName, {
            resource: 'terms',
            reason: 'request_failed',
            errorType: 'graphql',
        });
    });

    test('does not report initial loading or successful responses', () => {
        const { rerender } = renderHook(
            ({ loading, empty }) =>
                useOnboardingRequestError(
                    'dataPlanes',
                    loading,
                    empty,
                    undefined
                ),
            { initialProps: { loading: true, empty: true } }
        );
        expect(mocks.capture).not.toHaveBeenCalled();
        rerender({ loading: false, empty: false });
        expect(mocks.capture).not.toHaveBeenCalled();
        expect(mocks.log).not.toHaveBeenCalled();
    });

    test('deduplicates rerenders and failed retries, but reports a failure after recovery', () => {
        const { rerender } = renderHook(
            ({ loading, error }) =>
                useOnboardingRequestError('terms', loading, false, error),
            {
                initialProps: {
                    loading: false,
                    error: networkError() as CombinedError | undefined,
                },
            }
        );
        rerender({ loading: false, error: networkError() });
        rerender({ loading: true, error: undefined });
        rerender({ loading: false, error: networkError() });
        expect(mocks.capture).toHaveBeenCalledTimes(1);
        expect(mocks.log).toHaveBeenCalledTimes(1);
        rerender({ loading: false, error: undefined });
        rerender({ loading: false, error: networkError() });
        expect(mocks.capture).toHaveBeenCalledTimes(2);
        expect(mocks.log).toHaveBeenCalledTimes(2);
    });

    test('reports both resources independently when both block onboarding', () => {
        renderHook(() => {
            useOnboardingRequestError('terms', false, true, undefined);
            useOnboardingRequestError('dataPlanes', false, true, undefined);
        });
        expect(mocks.capture).toHaveBeenCalledTimes(2);
        expect(mocks.log).toHaveBeenCalledTimes(2);
        expect(
            mocks.capture.mock.calls.map(
                ([, properties]) => properties.resource
            )
        ).toEqual(['terms', 'dataPlanes']);
    });
});

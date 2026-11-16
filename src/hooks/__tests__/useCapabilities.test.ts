import type { ReactNode } from 'react';
import type { CapabilityBundle } from 'src/gql-types/graphql';

import { createElement } from 'react';

import { act, renderHook, waitFor } from '@testing-library/react';
import { cacheExchange, Client, fetchExchange, Provider } from 'urql';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { useCapabilities } from 'src/hooks/useCapabilities';
import { graphql, HttpResponse, server } from 'src/test/server/test-server';
import { dropFetchSignals } from 'src/test/shared';
import { getGqlUrl } from 'src/utils/env-utils';

const api = graphql.link(getGqlUrl());
let client: Client;
let requests: string[][];
let rows: CapabilityBundle[][];

const data = (bundles: CapabilityBundle[][]) => ({
    prefixes: {
        edges: bundles.map((capabilities) => ({ node: { capabilities } })),
    },
});

const wrapper = ({ children }: { children: ReactNode }) =>
    createElement(Provider, { value: client }, children);

const renderCapabilities = (name: string) =>
    renderHook(({ name }) => useCapabilities(name), {
        initialProps: { name },
        wrapper,
    });

describe('useCapabilities', () => {
    beforeEach(() => {
        dropFetchSignals();
        client = new Client({
            url: getGqlUrl(),
            exchanges: [cacheExchange, fetchExchange],
        });
        requests = [];
        rows = [['EditSecret']];
        server.use(
            api.query('Capabilities', ({ variables }) => {
                requests.push(variables.prefixes);
                return HttpResponse.json({ data: data(rows) });
            })
        );
    });

    test.each([
        ['acmeCo/team/api-key', ['acmeCo/', 'acmeCo/team/']],
        ['acmeCo/', ['acmeCo/']],
    ])('queries every prefix %s sits under', async (name, prefixes) => {
        const { result } = renderCapabilities(name);
        expect(result.current).toEqual({
            capabilities: undefined,
            fetching: true,
            error: undefined,
        });

        await waitFor(() => expect(result.current.fetching).toBe(false));
        expect(requests).toEqual([prefixes]);
    });

    test('combines bundles from all returned prefixes', async () => {
        rows = [['Viewer'], ['EditSecret', 'ViewBilling']];
        const { result } = renderCapabilities('acmeCo/team/api-key');

        await waitFor(() =>
            expect(result.current.capabilities).toEqual([
                'Viewer',
                'EditSecret',
                'ViewBilling',
            ])
        );
    });

    test('returns no bundles when no prefix is returned', async () => {
        rows = [];
        const { result } = renderCapabilities('acmeCo/api-key');

        await waitFor(() => expect(result.current.capabilities).toEqual([]));
    });

    test('withholds the previous name until its own result, and treats a failure or a name without a prefix as unknown', async () => {
        let finishRequest!: () => void;
        const pending = new Promise<void>((resolve) => {
            finishRequest = resolve;
        });
        server.use(
            api.query('Capabilities', async ({ variables }) => {
                requests.push(variables.prefixes);
                if (variables.prefixes[0] !== 'bravoCo/') {
                    return HttpResponse.json({ data: data([['EditSecret']]) });
                }
                await pending;
                // A failed query can still carry data.
                return HttpResponse.json({
                    data: data([['ViewBilling']]),
                    errors: [{ message: 'unavailable' }],
                });
            })
        );
        const { result, rerender } = renderCapabilities('acmeCo/api-key');
        await waitFor(() =>
            expect(result.current.capabilities).toEqual(['EditSecret'])
        );

        rerender({ name: 'bravoCo/api-key' });
        expect(result.current).toEqual({
            capabilities: undefined,
            fetching: true,
            error: undefined,
        });
        await waitFor(() => expect(requests).toHaveLength(2));
        await act(async () => finishRequest());
        await waitFor(() =>
            expect(result.current.error?.message).toContain('unavailable')
        );
        expect(result.current.capabilities).toBeUndefined();
        expect(result.current.fetching).toBe(false);

        rerender({ name: 'api-key' });
        expect(result.current).toEqual({
            capabilities: undefined,
            fetching: false,
            error: undefined,
        });
        expect(requests).toHaveLength(2);
    });

    test('reuses results for names with the same prefixes, including network-only queries', async () => {
        const execute = vi.spyOn(client, 'executeQuery');
        const { result, rerender } = renderHook(
            ({ name }) =>
                useCapabilities(name, { requestPolicy: 'network-only' }),
            { initialProps: { name: 'acmeCo/first-key' }, wrapper }
        );
        await waitFor(() =>
            expect(result.current.capabilities).toEqual(['EditSecret'])
        );
        expect(execute).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({ requestPolicy: 'network-only' })
        );

        rerender({ name: 'acmeCo/second-key' });
        expect(result.current.capabilities).toEqual(['EditSecret']);
        expect(result.current.fetching).toBe(false);
        expect(requests).toEqual([['acmeCo/']]);
        expect(execute).toHaveBeenCalledTimes(1);
    });
});

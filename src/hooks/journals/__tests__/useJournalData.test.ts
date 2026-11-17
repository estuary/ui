import type { Session } from '@supabase/supabase-js';

import { act, renderHook } from '@testing-library/react';
import { JournalClient } from 'data-plane-gateway';
import { mock } from 'vitest-mock-extended';

import { useUserStore } from 'src/context/User/useUserContextStore';
import { useJournalsForCollection } from 'src/hooks/journals/useJournalData';
import * as services from 'src/services/shared';
import useJournalStore from 'src/stores/JournalData/Store';

const { useSWRMock } = vi.hoisted(() => ({ useSWRMock: vi.fn() }));

vi.mock(import('swr'), async (importOriginal) => ({
    ...(await importOriginal()),
    default: useSWRMock,
}));

const collectionName = 'acme/collection';
const refreshAuthToken = vi.fn();

beforeEach(() => {
    useUserStore.setState({
        session: mock<Session>({ access_token: 'access-token' }),
    });
    useJournalStore.setState({
        collectionBrokerAddress: 'https://broker.example/',
        collectionBrokerToken: 'broker-token',
        getAuthToken: refreshAuthToken,
    });
    useSWRMock.mockReturnValue({ error: undefined });
    vi.spyOn(services, 'logRocketConsole').mockImplementation(() => {});
});

test.each([
    { message: 'token is expired', refresh: true },
    { message: 'collection not found', refresh: false },
])(
    'preserves broker error "$message" for token refresh',
    async ({ message, refresh }) => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
            new Response(
                JSON.stringify({ error: { message, httpStatus: 401 } }),
                {
                    status: 401,
                }
            )
        );
        renderHook(() => useJournalsForCollection(collectionName));
        const [key, fetcher, { onError }] = useSWRMock.mock.calls[0];

        const error = await fetcher(key).catch((cause: unknown) => cause);
        expect(error).toEqual({ message });
        await act(async () => {
            await expect(onError(error)).rejects.toBe(error);
        });

        expect(refreshAuthToken).toHaveBeenCalledTimes(Number(refresh));
        if (refresh) {
            expect(refreshAuthToken).toHaveBeenCalledWith(
                'access-token',
                collectionName,
                true
            );
        }
        expect(services.logRocketConsole).not.toHaveBeenCalled();
    }
);

test('logs transport failures and preserves the fallback without refreshing auth', async () => {
    const failure = new TypeError('Failed to fetch');
    vi.spyOn(JournalClient.prototype, 'list').mockRejectedValueOnce(failure);
    renderHook(() => useJournalsForCollection(collectionName));
    const [key, fetcher, { onError }] = useSWRMock.mock.calls[0];

    const error = await fetcher(key).catch((cause: unknown) => cause);
    expect(error).toEqual({ message: services.FETCH_DEFAULT_ERROR });
    await act(async () => {
        await expect(onError(error)).rejects.toBe(error);
    });

    expect(services.logRocketConsole).toHaveBeenCalledExactlyOnceWith(
        'journals:list:error',
        failure
    );
    expect(refreshAuthToken).not.toHaveBeenCalled();
});

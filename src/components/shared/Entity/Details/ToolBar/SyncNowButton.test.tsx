import type * as SyncNowModule from 'src/api/syncNow';

import { act, fireEvent, render, screen } from '@testing-library/react';
import { IntlProvider } from 'react-intl';

import { syncNow, SyncNowError } from 'src/api/syncNow';
import SyncNowButton from 'src/components/shared/Entity/Details/ToolBar/SyncNowButton';
import { useEntityType } from 'src/context/EntityContext';
import { Details } from 'src/lang/en-US/Details';
import {
    useShardDetail_readDictionary,
    useShardDetail_runtimeV2,
} from 'src/stores/ShardDetail/hooks';

vi.mock('src/api/syncNow', async (importOriginal) => ({
    ...(await importOriginal<typeof SyncNowModule>()),
    syncNow: vi.fn(),
}));
vi.mock('src/context/EntityContext', () => ({ useEntityType: vi.fn() }));
vi.mock('src/stores/ShardDetail/hooks', () => ({
    useShardDetail_runtimeV2: vi.fn(),
    useShardDetail_readDictionary: vi.fn(),
}));

function view(taskName = 'acme/warehouse') {
    return (
        <IntlProvider locale="en" messages={Details}>
            <SyncNowButton taskName={taskName} />
        </IntlProvider>
    );
}

beforeEach(() => {
    vi.mocked(useEntityType).mockReturnValue('materialization');
    vi.mocked(useShardDetail_runtimeV2).mockReturnValue(true);
    vi.mocked(useShardDetail_readDictionary).mockReturnValue({
        disabled: false,
    } as ReturnType<typeof useShardDetail_readDictionary>);
});

test.each(['capture', 'collection'] as const)(
    'does not offer sync for %s',
    (type) => {
        vi.mocked(useEntityType).mockReturnValue(type);
        render(view());
        expect(screen.queryByRole('button', { name: 'Sync now' })).toBeNull();
    }
);

test('does not offer sync for a legacy runtime', () => {
    vi.mocked(useShardDetail_runtimeV2).mockReturnValue(false);
    render(view());
    expect(screen.queryByRole('button', { name: 'Sync now' })).toBeNull();
});

test('disables sync for disabled materializations', () => {
    vi.mocked(useShardDetail_readDictionary).mockReturnValue({
        disabled: true,
    } as ReturnType<typeof useShardDetail_readDictionary>);
    render(view());
    expect(
        (screen.getByRole('button', { name: 'Sync now' }) as HTMLButtonElement)
            .disabled
    ).toBe(true);
});

test('blocks duplicate submissions and shows success only when completion resolves', async () => {
    let finish!: () => void;
    vi.mocked(syncNow).mockImplementation(({ onProgress }) => {
        onProgress('waiting');
        return new Promise<void>((resolve) => {
            finish = resolve;
        });
    });
    render(view());
    fireEvent.click(screen.getByRole('button', { name: 'Sync now' }));
    expect(
        (screen.getByRole('button', { name: 'Syncing…' }) as HTMLButtonElement)
            .disabled
    ).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: 'Syncing…' }));
    expect(syncNow).toHaveBeenCalledTimes(1);
    expect(screen.queryByText(Details['syncNow.success'])).toBeNull();
    await act(async () => finish());
    expect(screen.getByText(Details['syncNow.success'])).toBeTruthy();
});

test('stop waiting aborts the request and late completion cannot claim success', async () => {
    let finish!: () => void;
    vi.mocked(syncNow).mockImplementation(({ onProgress }) => {
        onProgress('waiting');
        return new Promise<void>((resolve) => {
            finish = resolve;
        });
    });
    render(view());
    fireEvent.click(screen.getByRole('button', { name: 'Sync now' }));
    fireEvent.click(screen.getByRole('button', { name: 'Stop waiting' }));
    expect(vi.mocked(syncNow).mock.calls[0][0].signal.aborted).toBe(true);
    await act(async () => finish());
    expect(screen.getByText(Details['syncNow.stopped'])).toBeTruthy();
    expect(screen.queryByText(Details['syncNow.success'])).toBeNull();
});

test('navigation aborts the old task and resets status for the new one', () => {
    vi.mocked(syncNow).mockImplementation(({ onProgress }) => {
        onProgress('waiting');
        return new Promise(() => {});
    });
    const { rerender } = render(view());
    fireEvent.click(screen.getByRole('button', { name: 'Sync now' }));
    rerender(view('acme/other'));
    expect(vi.mocked(syncNow).mock.calls[0][0].signal.aborted).toBe(true);
    expect(
        (screen.getByRole('button', { name: 'Sync now' }) as HTMLButtonElement)
            .disabled
    ).toBe(false);
    expect(screen.queryByText(Details['syncNow.waiting'])).toBeNull();
});

test.each([
    [5, 'syncNow.unavailable'],
    [7, 'syncNow.unauthorized'],
    [16, 'syncNow.unauthorized'],
    [3, 'syncNow.error'],
] as const)(
    'shows useful error for code %s and permits retry',
    async (code, message) => {
        vi.mocked(syncNow).mockRejectedValue(
            new SyncNowError('Rejected', code)
        );
        render(view());
        fireEvent.click(screen.getByRole('button', { name: 'Sync now' }));
        expect(await screen.findByText(Details[message])).toBeTruthy();
        expect(
            (
                screen.getByRole('button', {
                    name: 'Sync now',
                }) as HTMLButtonElement
            ).disabled
        ).toBe(false);
    }
);

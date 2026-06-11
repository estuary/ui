import { act, renderHook } from '@testing-library/react';

import {
    OAUTH_BROADCAST_CHANNEL,
    OAUTH_RESPONSE,
    POPUP_RESULT_TIMEOUT,
} from 'src/hooks/forks/react-use-oauth2/components/constants';
import useOAuth2 from 'src/hooks/forks/react-use-oauth2/components/use-oauth2';

// jsdom does not implement BroadcastChannel so use a minimal in-memory stand-in
class MockBroadcastChannel {
    static instances: MockBroadcastChannel[] = [];

    onmessage: ((ev: { data: any }) => any) | null = null;

    closed = false;

    constructor(public name: string) {
        MockBroadcastChannel.instances.push(this);
    }

    postMessage(data: any) {
        MockBroadcastChannel.instances.forEach((instance) => {
            if (
                instance !== this &&
                instance.name === this.name &&
                !instance.closed
            ) {
                instance.onmessage?.({ data });
            }
        });
    }

    close() {
        this.closed = true;
    }
}

const STATE = 'test-state';
const CODE_VERIFIER = 'test-code-verifier';

// What the /oauth pop-up page does after the provider redirects back to it.
//  It normally sends over both paths; COOP-severed openers only get the channel.
const popupReportsBack = (body: any, channelOnly?: boolean) => {
    const message = { ...body, type: OAUTH_RESPONSE };

    const channel = new MockBroadcastChannel(OAUTH_BROADCAST_CHANNEL);
    channel.postMessage(message);
    channel.close();

    if (!channelOnly) {
        window.dispatchEvent(new MessageEvent('message', { data: message }));
    }
};

const mockPopup = (closed: boolean) => {
    const popup: any = { closed, close: vi.fn() };
    popup.window = popup;
    return popup;
};

describe('useOAuth2', () => {
    let onSuccess: ReturnType<typeof vi.fn>;
    let onError: ReturnType<typeof vi.fn>;

    const getAuth = (popup: any) => {
        vi.spyOn(window, 'open').mockReturnValue(popup);

        const { result } = renderHook(() => useOAuth2({ onError, onSuccess }));
        act(() => {
            result.current.getAuth(
                'https://example.com/authorize',
                STATE,
                CODE_VERIFIER
            );
        });

        return result;
    };

    beforeEach(() => {
        vi.useFakeTimers();
        vi.stubGlobal('BroadcastChannel', MockBroadcastChannel);
        MockBroadcastChannel.instances = [];
        onSuccess = vi.fn();
        onError = vi.fn();
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
    });

    test('delivers success over the BroadcastChannel even when window.opener messaging is unavailable', async () => {
        // A COOP-severed handle reads as closed the entire time the user is logging in
        getAuth(mockPopup(true));

        const payload = { code: 'auth-code', state: STATE };
        await act(async () => {
            popupReportsBack({ payload }, true);
        });

        expect(onSuccess).toHaveBeenCalledWith(payload, CODE_VERIFIER);
        expect(onError).not.toHaveBeenCalled();
    });

    test('processes the response only once when both delivery paths fire', async () => {
        // With a healthy opener the pop-up's message arrives via both the
        //  message event and the BroadcastChannel
        getAuth(mockPopup(false));

        const payload = { code: 'auth-code', state: STATE };
        await act(async () => {
            popupReportsBack({ payload });
            popupReportsBack({ payload });
        });

        expect(onSuccess).toHaveBeenCalledTimes(1);
        expect(onError).not.toHaveBeenCalled();
    });

    test('a retry detaches the previous attempt listener so only the new state is accepted', async () => {
        const popup = mockPopup(false);
        const result = getAuth(popup);

        // Retry with a fresh state before the first attempt completed
        act(() => {
            result.current.getAuth(
                'https://example.com/authorize',
                'retry-state',
                CODE_VERIFIER
            );
        });

        await act(async () => {
            popupReportsBack({
                payload: { code: 'auth-code', state: 'retry-state' },
            });
        });

        // The first attempt's listener (expecting STATE) must not fire an error
        expect(onSuccess).toHaveBeenCalledTimes(1);
        expect(onError).not.toHaveBeenCalled();
    });

    test('rejects a payload whose state does not match', async () => {
        getAuth(mockPopup(false));

        await act(async () => {
            popupReportsBack({
                payload: { code: 'auth-code', state: 'forged' },
            });
        });

        expect(onSuccess).not.toHaveBeenCalled();
        expect(onError).toHaveBeenCalledWith('OAuth error: State mismatch.');
    });

    test('errors right away when the pop-up never opened', async () => {
        getAuth(null);

        await act(async () => {
            await vi.advanceTimersByTimeAsync(250);
        });

        expect(onError).toHaveBeenCalledWith(
            expect.stringContaining('Your browser may be blocking it')
        );
    });

    test('a closed reading alone does not error until the grace period lapses', async () => {
        getAuth(mockPopup(true));

        await act(async () => {
            await vi.advanceTimersByTimeAsync(POPUP_RESULT_TIMEOUT - 1000);
        });
        expect(onError).not.toHaveBeenCalled();

        // The grace timer is armed by the first poller tick, so overshoot
        //  by more than one polling interval
        await act(async () => {
            await vi.advanceTimersByTimeAsync(2000);
        });
        expect(onError).toHaveBeenCalledWith(
            expect.stringContaining('did not receive a response')
        );
        expect(onSuccess).not.toHaveBeenCalled();
    });

    test('a response arriving during the grace period cancels the timeout error', async () => {
        getAuth(mockPopup(true));

        await act(async () => {
            await vi.advanceTimersByTimeAsync(1000);
            popupReportsBack({ payload: { code: 'auth-code', state: STATE } });
            await vi.advanceTimersByTimeAsync(POPUP_RESULT_TIMEOUT);
        });

        expect(onSuccess).toHaveBeenCalled();
        expect(onError).not.toHaveBeenCalled();
    });
});

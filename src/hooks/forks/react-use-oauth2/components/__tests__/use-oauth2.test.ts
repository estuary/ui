import { act, renderHook } from '@testing-library/react';

import { OAUTH_RESPONSE } from 'src/hooks/forks/react-use-oauth2/components/constants';
import useOAuth2 from 'src/hooks/forks/react-use-oauth2/components/use-oauth2';

const AUTHORIZE_URL = 'https://provider.example/authorize';
const VICTIM_STATE = 'victim-state-4d2e';
const CODE_VERIFIER = 'legit-verifier';

// window.open is stubbed with a stand-in popup so the hook has a source window
// to compare incoming messages against.
const popup = { close: vi.fn(), closed: false, window: {} } as any;

const post = (data: any, source: any, origin = window.location.origin) => {
    const message = new MessageEvent('message', { data, origin });

    // jsdom will not let `source` be an arbitrary object through the
    // constructor, so it is attached after the fact.
    Object.defineProperty(message, 'source', { value: source });

    act(() => {
        window.dispatchEvent(message);
    });
};

describe('useOAuth2 message listener', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.spyOn(window, 'open').mockReturnValue(popup);
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    const startFlow = () => {
        const onSuccess = vi.fn();
        const onError = vi.fn();
        const { result } = renderHook(() => useOAuth2({ onSuccess, onError }));

        act(() => {
            result.current.getAuth(AUTHORIZE_URL, VICTIM_STATE, CODE_VERIFIER);
        });

        return { onError, onSuccess };
    };

    test('accepts a response from the popup it opened', () => {
        const { onError, onSuccess } = startFlow();

        post(
            {
                type: OAUTH_RESPONSE,
                payload: { state: VICTIM_STATE, code: 'legit-code' },
            },
            popup
        );

        expect(onSuccess).toHaveBeenCalledWith(
            { state: VICTIM_STATE, code: 'legit-code' },
            CODE_VERIFIER
        );
        expect(onError).not.toHaveBeenCalled();
    });

    test('ignores a response from a window other than the popup', () => {
        const { onError, onSuccess } = startFlow();

        post(
            {
                type: OAUTH_RESPONSE,
                payload: { state: VICTIM_STATE, code: 'attacker-code' },
            },
            { name: 'connector docs iframe' },
            'https://go.estuary.dev.attacker.example'
        );

        expect(onSuccess).not.toHaveBeenCalled();
        expect(onError).not.toHaveBeenCalled();
    });

    test('ignores a response carrying a state other than the one saved for the flow', () => {
        const { onError, onSuccess } = startFlow();

        post(
            {
                type: OAUTH_RESPONSE,
                payload: { state: 'attacker-state', code: 'attacker-code' },
            },
            popup
        );

        expect(onSuccess).not.toHaveBeenCalled();
        expect(onError).not.toHaveBeenCalled();
    });
});

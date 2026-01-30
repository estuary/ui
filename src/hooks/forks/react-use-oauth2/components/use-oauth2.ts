// Heavily edited version of https://github.com/tasoskakour/react-use-oauth2
/* eslint-disable @typescript-eslint/no-invalid-void-type */
import { useCallback, useRef, useState } from 'react';

import {
    MESSAGE_KEY,
    OAUTH_RESPONSE,
    OAUTH_STATE_KEY,
    POPUP_HEIGHT,
    POPUP_WIDTH,
} from 'src/hooks/forks/react-use-oauth2/components/constants';

export type AuthTokenPayload = {
    token_type: string;
    expires_in: number;
    access_token: string;
    scope: string;
    refresh_token: string;
};

export type Oauth2Props<TData = AuthTokenPayload> = {
    onError: (error: string) => void | Promise<any> | PromiseLike<any>;
    onSuccess: (
        payload: TData,
        codeVerifier: string
    ) => void | Promise<any> | PromiseLike<any>;
};

const saveState = (state: string) => {
    sessionStorage.setItem(OAUTH_STATE_KEY, state);
};

const removeState = () => {
    sessionStorage.removeItem(OAUTH_STATE_KEY);
};

const openPopup = (url: string) => {
    // To fix issues with window.screen in multi-monitor setups, the easier option is to
    // center the pop-up over the parent window.
    const top = window.outerHeight / 2 + window.screenY - POPUP_HEIGHT / 2;
    const left = window.outerWidth / 2 + window.screenX - POPUP_WIDTH / 2;
    return window.open(
        url,
        'Estuary OAuth',
        `height=${POPUP_HEIGHT},width=${POPUP_WIDTH},top=${top},left=${left}`
    );
};

const closePopup = (
    popupRef: React.MutableRefObject<Window | null | undefined>
) => {
    popupRef.current?.close();
};

const cleanup = (
    intervalRef: React.MutableRefObject<any>,
    popupRef: React.MutableRefObject<Window | null | undefined>,
    handleMessageListener: any
) => {
    clearInterval(intervalRef.current);
    closePopup(popupRef);
    removeState();
    window.removeEventListener(MESSAGE_KEY, handleMessageListener);
};

export type State<TData = AuthTokenPayload> = TData | null;

const useOAuth2 = <TData = AuthTokenPayload>(props: Oauth2Props<TData>) => {
    const { onSuccess, onError } = props;

    const popupRef = useRef<Window | null>();
    const intervalRef = useRef<any>();
    const [loading, setLoading] = useState(false);

    const getAuth = useCallback(
        (authorizeUrl: string, state: string, codeVerifier: string) => {
            // 1. Init
            setLoading(true);

            // 2. Generate and save state
            saveState(state);

            // 3. Open popup
            popupRef.current = openPopup(authorizeUrl);

            // 4. Register message listener
            async function handleMessageListener(message: MessageEvent<any>) {
                try {
                    const type = message.data?.type;
                    if (type === OAUTH_RESPONSE) {
                        const errorMaybe = message.data?.error;
                        if (errorMaybe) {
                            await onError(errorMaybe);
                        } else {
                            const payload = message.data?.payload;
                            await onSuccess(payload, codeVerifier);
                        }
                        cleanup(intervalRef, popupRef, handleMessageListener);
                        setLoading(false);
                    }

                    // Not the best approach but just need to be safe since so much can go wrong
                } catch (genericError: unknown) {
                    await onError(String(genericError));
                    setLoading(false);
                    cleanup(intervalRef, popupRef, handleMessageListener);
                }
            }
            window.addEventListener(MESSAGE_KEY, handleMessageListener);

            // 4. Begin interval to check if popup was closed forcefully by the user
            intervalRef.current = setInterval(async () => {
                const popupClosed =
                    !popupRef.current?.window || popupRef.current.window.closed;
                if (popupClosed) {
                    // Popup was closed before completing auth...
                    setLoading(false);
                    await onError(
                        'Pop-up was closed before completing authentication. Your browser may be blocking it from opening. Please ensure your browser allows pop-ups.'
                    );
                    clearInterval(intervalRef.current);
                    removeState();
                    window.removeEventListener(
                        MESSAGE_KEY,
                        handleMessageListener
                    );
                }
            }, 250);

            // 5. Remove listener(s) on unmount
            return () => {
                window.removeEventListener(MESSAGE_KEY, handleMessageListener);
                if (intervalRef.current) clearInterval(intervalRef.current);
            };
        },
        [onError, onSuccess]
    );

    return { loading, getAuth };
};

export default useOAuth2;

// Heavily edited version of https://github.com/tasoskakour/react-use-oauth2
/* eslint-disable @typescript-eslint/no-invalid-void-type */
import { useCallback, useRef, useState } from 'react';

import {
    MESSAGE_KEY,
    OAUTH_BROADCAST_CHANNEL,
    OAUTH_RESPONSE,
    POPUP_HEIGHT,
    POPUP_RESULT_TIMEOUT,
    POPUP_WIDTH,
} from 'src/hooks/forks/react-use-oauth2/components/constants';
import { base64RemovePadding } from 'src/utils/misc-utils';

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

export type State<TData = AuthTokenPayload> = TData | null;

const useOAuth2 = <TData = AuthTokenPayload>(props: Oauth2Props<TData>) => {
    const { onSuccess, onError } = props;

    const popupRef = useRef<Window | null>();
    const intervalRef = useRef<any>();
    const timeoutRef = useRef<any>();
    const channelRef = useRef<BroadcastChannel | null>(null);
    const listenerRef = useRef<any>(null);
    const [loading, setLoading] = useState(false);

    const getAuth = useCallback(
        (authorizeUrl: string, state: string, codeVerifier: string) => {
            // 1. Init - tear down any previous attempt so a stale listener
            //  cannot process this attempt's response or close its channel
            clearInterval(intervalRef.current);
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
            channelRef.current?.close();
            channelRef.current = null;
            if (listenerRef.current) {
                window.removeEventListener(MESSAGE_KEY, listenerRef.current);
                listenerRef.current = null;
            }
            setLoading(true);

            // 2. Open popup
            popupRef.current = openPopup(authorizeUrl);

            const cleanup = () => {
                clearInterval(intervalRef.current);
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
                closePopup(popupRef);
                window.removeEventListener(MESSAGE_KEY, handleMessageListener);
                listenerRef.current = null;
                channelRef.current?.close();
                channelRef.current = null;
            };

            // 3. Register listeners for the response. Providers that enforce
            //  Cross-Origin-Opener-Policy on their login pages (ex: Microsoft)
            //  permanently null out the pop-up's window.opener, so the message
            //  event cannot deliver - the BroadcastChannel (same-origin
            //  messaging COOP cannot sever) is the path that works there.
            //  When the opener survives, both paths deliver - the responseHandled
            //  flag makes sure only the first one is processed.
            let responseHandled = false;
            async function handleMessageListener(message: MessageEvent<any>) {
                try {
                    const type = message.data?.type;
                    if (type === OAUTH_RESPONSE) {
                        if (responseHandled) {
                            return;
                        }
                        responseHandled = true;

                        const errorMaybe = message.data?.error;
                        if (errorMaybe) {
                            await onError(errorMaybe);
                        } else {
                            const payload = message.data?.payload;

                            // The pop-up cannot verify state itself (COOP can drop
                            //  its copy of sessionStorage) so verify it here where
                            //  the expected value is in scope
                            if (
                                base64RemovePadding(payload?.state ?? null) ===
                                base64RemovePadding(state)
                            ) {
                                await onSuccess(payload, codeVerifier);
                            } else {
                                await onError('OAuth error: State mismatch.');
                            }
                        }
                        cleanup();
                        setLoading(false);
                    }

                    // Not the best approach but just need to be safe since so much can go wrong
                } catch (genericError: unknown) {
                    await onError(String(genericError));
                    setLoading(false);
                    cleanup();
                }
            }
            try {
                channelRef.current = new BroadcastChannel(
                    OAUTH_BROADCAST_CHANNEL
                );
                channelRef.current.onmessage = handleMessageListener;
            } catch {
                // No BroadcastChannel support - the opener path below can
                //  still deliver for providers that do not enforce COOP
                channelRef.current = null;
            }

            window.addEventListener(MESSAGE_KEY, handleMessageListener);
            listenerRef.current = handleMessageListener;

            // 4. Begin interval to check if popup was closed forcefully by the user.
            //  A closed reading is ambiguous - COOP-severed handles read as closed
            //  while the user is still logging in - so it only starts a grace timer
            //  instead of erroring right away.
            intervalRef.current = setInterval(async () => {
                if (!popupRef.current?.window) {
                    // window.open returned nothing at all - the pop-up truly never opened
                    setLoading(false);
                    await onError(
                        'Pop-up was closed before completing authentication. Your browser may be blocking it from opening. Please ensure your browser allows pop-ups.'
                    );
                    cleanup();
                    return;
                }

                if (popupRef.current.window.closed && !timeoutRef.current) {
                    // Stop polling: every read of a COOP-severed handle logs a
                    //  console warning, and closed will never read false again.
                    clearInterval(intervalRef.current);

                    timeoutRef.current = setTimeout(async () => {
                        setLoading(false);
                        await onError(
                            'We did not receive a response from the authentication pop-up. If you closed it before finishing, or the provider could not complete your login, please try authenticating again.'
                        );
                        cleanup();
                    }, POPUP_RESULT_TIMEOUT);
                }
            }, 250);

            // 5. Remove listener(s) on unmount
            return () => {
                window.removeEventListener(MESSAGE_KEY, handleMessageListener);
                listenerRef.current = null;
                if (intervalRef.current) clearInterval(intervalRef.current);
                if (timeoutRef.current) clearTimeout(timeoutRef.current);
                channelRef.current?.close();
                channelRef.current = null;
            };
        },
        [onError, onSuccess]
    );

    return { loading, getAuth };
};

export default useOAuth2;

import FullPageSpinner from 'components/fullPage/Spinner';
import { useEffect } from 'react';
import { base64RemovePadding } from 'utils/misc-utils';
import { OAUTH_RESPONSE, OAUTH_STATE_KEY } from './constants';

const checkState = (receivedState: string) => {
    const state = sessionStorage.getItem(OAUTH_STATE_KEY);
    return base64RemovePadding(state) === base64RemovePadding(receivedState);
};

const queryToObject = (query: string) => {
    const parameters = new URLSearchParams(query);
    return Object.fromEntries(parameters.entries());
};

type Props = {
    Component?: React.ReactElement;
};

const sendMessage = (body: any) => {
    window.opener.postMessage({
        ...body,
        type: OAUTH_RESPONSE,
    });
};

const OAuthPopup = (props: Props) => {
    const { Component = <FullPageSpinner /> } = props;

    // On mount
    useEffect(() => {
        const payload = {
            ...queryToObject(window.location.search.split('?')[1]),
            ...queryToObject(window.location.hash.split('#')[1]),
        };
        const state = payload.state;
        const error = payload.error;

        if (!window.opener) {
            throw new Error('No window opener');
        }

        if (error) {
            sendMessage({
                error: decodeURI(error) || 'OAuth error: An error has occured.',
            });
        } else if (state && checkState(state)) {
            sendMessage({
                payload,
            });
        } else {
            sendMessage({
                error: 'OAuth error: State mismatch.',
            });
        }
    }, []);

    return Component;
};

export default OAuthPopup;

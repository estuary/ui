// Heavily edited version of https://github.com/tasoskakour/react-use-oauth2

import FullPageSpinner from 'components/fullPage/Spinner';
import OauthWindowOpenerMissing from 'components/shared/ErrorDialog/OauthWindowOpenerMissing';
import { useEffect, useState } from 'react';
import { logRocketEvent } from 'services/shared';
import { CustomEvents } from 'services/types';
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
    const [showError, setShowError] = useState(false);
    const { Component = <FullPageSpinner delay={0} /> } = props;

    // On mount
    useEffect(() => {
        const payload = {
            ...queryToObject(window.location.search.split('?')[1]),
            ...queryToObject(window.location.hash.split('#')[1]),
        };
        const { error, state } = payload;

        if (!window.opener) {
            logRocketEvent(CustomEvents.OAUTH_WINDOW_OPENER, {
                missing: true,
            });

            setShowError(true);
            return;
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

    if (showError) {
        return <OauthWindowOpenerMissing />;
    }

    return Component;
};

export default OAuthPopup;

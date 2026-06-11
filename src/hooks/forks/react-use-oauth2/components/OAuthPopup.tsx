// Heavily edited version of https://github.com/tasoskakour/react-use-oauth2

import { useEffect, useState } from 'react';

import { Box, Typography } from '@mui/material';

import { FormattedMessage } from 'react-intl';

import FullPageSpinner from 'src/components/fullPage/Spinner';
import OauthWindowOpenerMissing from 'src/components/shared/ErrorDialog/OauthWindowOpenerMissing';
import {
    OAUTH_BROADCAST_CHANNEL,
    OAUTH_RESPONSE,
} from 'src/hooks/forks/react-use-oauth2/components/constants';
import { logRocketEvent } from 'src/services/shared';
import { CustomEvents } from 'src/services/types';

const queryToObject = (query: string) => {
    const parameters = new URLSearchParams(query);
    return Object.fromEntries(parameters.entries());
};

const broadcastChannelSupported = typeof BroadcastChannel !== 'undefined';

type Props = {
    Component?: React.ReactElement;
};

// COOP-enforcing providers (ex: Microsoft) permanently null out this
//  pop-up's window.opener, so the result also goes over a BroadcastChannel
//  (same-origin messaging COOP cannot sever).
const sendMessage = (body: any) => {
    const message = {
        ...body,
        type: OAUTH_RESPONSE,
    };

    if (broadcastChannelSupported) {
        const channel = new BroadcastChannel(OAUTH_BROADCAST_CHANNEL);
        channel.postMessage(message);
        channel.close();
    }

    window.opener?.postMessage(message);
};

const OAuthPopup = (props: Props) => {
    const [showCloseHint, setShowCloseHint] = useState(false);
    const { Component = <FullPageSpinner delay={0} /> } = props;

    // With no opener and no BroadcastChannel there is no way to hand the
    //  result back, so show the dead-end error instead of spinning until the
    //  opener's grace timer fires.
    const undeliverable = !window.opener && !broadcastChannelSupported;

    // On mount
    useEffect(() => {
        if (undeliverable) {
            logRocketEvent(CustomEvents.OAUTH_WINDOW_OPENER, {
                missing: true,
            });
            return;
        }

        const payload = {
            ...queryToObject(window.location.search.split('?')[1]),
            ...queryToObject(window.location.hash.split('#')[1]),
        };
        const { error } = payload;

        if (!window.opener) {
            // Not fatal - the BroadcastChannel still delivers. Keeping the
            //  event so we can see how often COOP severs the opener.
            logRocketEvent(CustomEvents.OAUTH_WINDOW_OPENER, {
                missing: true,
            });
        }

        if (error) {
            sendMessage({
                error: decodeURI(error) || 'OAuth error: An error has occured.',
            });
        } else {
            // The opener verifies the state in this payload. This window cannot
            //  do it - the COOP context switch can drop its copy of sessionStorage
            sendMessage({
                payload,
            });
        }

        // In the normal flow the opener closes this window. A COOP-severed
        //  opener cannot, so close ourselves - and if the browser refuses,
        //  let the user know it is safe to do it manually.
        const timeout = setTimeout(() => {
            window.close();
            setShowCloseHint(true);
        }, 1000);

        return () => {
            clearTimeout(timeout);
        };
    }, [undeliverable]);

    if (undeliverable) {
        return <OauthWindowOpenerMissing />;
    }

    if (showCloseHint) {
        return (
            <Box sx={{ p: 3 }}>
                <Typography>
                    <FormattedMessage id="oauth.popup.complete" />
                </Typography>
            </Box>
        );
    }

    return Component;
};

export default OAuthPopup;

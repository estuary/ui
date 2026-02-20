import { useEffect, useRef, useState } from 'react';

import { Box, LinearProgress } from '@mui/material';

import { useShallow } from 'zustand/react/shallow';

import { FormattedMessage, useIntl } from 'react-intl';

import MessageWithLink from 'src/components/content/MessageWithLink';
import AlertBox from 'src/components/shared/AlertBox';
import { useColorMode } from 'src/context/Theme';
import { useSidePanelDocsStore } from 'src/stores/SidePanelDocs/Store';
import { getDocsSettings } from 'src/utils/env-utils';
import { hasLength } from 'src/utils/misc-utils';

const { origin } = getDocsSettings();

// Need to allow the iframe to run stuff. Should be safe as we'll only run Estuary doc links
const sandbox = ['allow-scripts', 'allow-same-origin', 'allow-popups'].join(
    ' '
);

// This must be kept in sync with the docs site in flow/site
const colorModeMessage = 'estuary.colorMode';

// This must be kept in sync with the docs site in flow/site
const hideNavBarMessage = 'estuary.docs.hideNavBar';

interface Props {
    show: boolean;
}

function SidePanelIframe({ show }: Props) {
    const intl = useIntl();
    const [disabled, setAnimateOpening, docsURL] = useSidePanelDocsStore(
        useShallow((state) => [state.disabled, state.setAnimateOpening, state.url])
    );

    const colorMode = useColorMode();
    const [loading, setLoading] = useState(true);
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const iframeCurrent = iframeRef.current;

    useEffect(() => {
        // When a connector is changed and the side panel is open make sure we show loading
        //  if we will be displaying an iFrame
        setLoading(!disabled);
    }, [disabled, docsURL]);

    useEffect(() => {
        // Keep the docs inline with the color mode of the application

        if (iframeCurrent?.contentWindow) {
            iframeCurrent.contentWindow.postMessage(
                { type: colorModeMessage, mode: colorMode.colorMode },
                origin
            );
        }
    }, [colorMode, iframeCurrent]);

    useEffect(() => {
        if (iframeCurrent && show && hasLength(docsURL)) {
            // When the iframe loads fire message to hide the navbar and breadcrumbs
            iframeCurrent.contentWindow?.postMessage(
                { type: hideNavBarMessage },
                origin
            );

            // Waiting a little bit to give the docs time to hide stuff we don't want showing
            //  also makes sure the loading has a little bit of time to show
            setTimeout(() => {
                setAnimateOpening(true);
                setLoading(false);
            }, 100);
        }
    }, [docsURL, iframeCurrent, setAnimateOpening, show]);

    // Make sure we don't include an iframe unless we actually need it
    if (!hasLength(docsURL) || !show) {
        return null;
    }

    // Handle when it is disabled so there is some messaging to the user to let them know how to view docs
    if (disabled) {
        return (
            <Box
                sx={{
                    p: 4,
                }}
            >
                <AlertBox
                    short
                    severity="info"
                    title={<FormattedMessage id="docs.iframe.disabled.title" />}
                >
                    <MessageWithLink
                        messageID="docs.iframe.disabled.message"
                        link={docsURL}
                    />
                </AlertBox>
            </Box>
        );
    }

    return (
        <>
            {loading ? <LinearProgress /> : null}
            <iframe
                ref={iframeRef}
                style={{
                    // This is here for safety on the rare chance that
                    //  someone is using darkmode in the app but their docs
                    //  load in as light mode. When in light mode Docusaurus
                    //  does not set a background and makes the text unreadable
                    backgroundColor: '#ffffff',
                    border: 'none',
                    height: '100%',
                    visibility: loading ? 'hidden' : 'visible',
                }}
                src={docsURL}
                sandbox={sandbox}
                title={intl.formatMessage({ id: 'docs.iframe.title' })}
            />
        </>
    );
}

export default SidePanelIframe;

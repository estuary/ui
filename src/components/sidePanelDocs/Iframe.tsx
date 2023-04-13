import { Box, LinearProgress } from '@mui/material';
import MessageWithLink from 'components/content/MessageWithLink';
import AlertBox from 'components/shared/AlertBox';
import { useColorMode } from 'context/Theme';
import { useEffect, useRef, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import {
    useSidePanelDocsStore_disabled,
    useSidePanelDocsStore_setAnimateOpening,
    useSidePanelDocsStore_url,
} from 'stores/SidePanelDocs/hooks';
import { getDocsSettings } from 'utils/env-utils';
import { hasLength } from 'utils/misc-utils';

const { origin } = getDocsSettings();

// Need to allow the iframe to run stuff. Should be safe as we'll only run Estuary doc links
const sandbox = ['allow-scripts', 'allow-same-origin', 'allow-popups'].join(
    ' '
);

// This must be kept in sync with the docs site in flow/site
const colorModeMessage = 'estuary.colorMode';

// This must be kept in sync with the docs site in flow/site
const hideNavBarMessage = 'estuary.docs.hideNavBar';

function SidePanelIframe() {
    const intl = useIntl();
    const docsURL = useSidePanelDocsStore_url();
    const disabled = useSidePanelDocsStore_disabled();
    const setAnimateOpening = useSidePanelDocsStore_setAnimateOpening();
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
        // When the iframe loads fire message to hide the navbar and breadcrumbs
        const hideNavBar = () => {
            iframeCurrent?.contentWindow?.postMessage(
                { type: hideNavBarMessage },
                origin
            );

            // Waiting a little bit to give the docs time to hide stuff we don't want showing
            //  also makes sure the loading has a little bit of time to show
            setTimeout(() => {
                setAnimateOpening(true);
                setLoading(false);
            }, 100);
        };
        iframeCurrent?.addEventListener('load', hideNavBar);

        return () => {
            iframeCurrent?.removeEventListener('load', hideNavBar);
        };
    }, [iframeCurrent, setAnimateOpening]);

    // Make sure we don't include an iframe unless we actually need it
    if (!hasLength(docsURL)) {
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

import { LinearProgress } from '@mui/material';
import { useColorMode } from 'context/Theme';
import { useEffect, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { useSidePanelDocsStore_url } from 'stores/SidePanelDocs/hooks';
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

function SidePanelConnectorDocs() {
    const intl = useIntl();
    const docsURL = useSidePanelDocsStore_url();
    const colorMode = useColorMode();
    const [loading, setLoading] = useState(true);
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const iframeCurrent = iframeRef.current;

    // When a connector is changed and the side panel is open make sure we show loading
    useEffect(() => {
        setLoading(true);
    }, [docsURL]);

    // Keep the docs inline with the color mode of the application
    useEffect(() => {
        if (iframeCurrent?.contentWindow) {
            iframeCurrent.contentWindow.postMessage(
                { type: colorModeMessage, mode: colorMode.colorMode },
                origin
            );
        }
    }, [colorMode, iframeCurrent]);

    // When the iframe loads fire message to hide the navbar and breadcrumbs
    useEffect(() => {
        const hideNavBar = () => {
            iframeCurrent?.contentWindow?.postMessage(
                { type: hideNavBarMessage },
                origin
            );

            // Waiting a little bit to give the docs time to hide stuff we don't want showing
            //  also makes sure the loading has a little bit of time to show
            setTimeout(() => setLoading(false), 100);
        };
        iframeCurrent?.addEventListener('load', hideNavBar);

        return () => {
            iframeCurrent?.removeEventListener('load', hideNavBar);
        };
    }, [iframeCurrent]);

    if (!hasLength(docsURL)) return null;

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

export default SidePanelConnectorDocs;

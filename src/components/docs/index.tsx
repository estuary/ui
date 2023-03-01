import { useDocs } from 'context/Docs';
import { useColorMode } from 'context/Theme';
import { useEffect, useRef } from 'react';
import { useIntl } from 'react-intl';
import { getDocsSettings } from 'utils/env-utils';

const { origin } = getDocsSettings();

// Need to allow the iframe to run stuff. Should be safe as we'll only run Estuary doc links
const sandbox = ['allow-scripts', 'allow-same-origin'].join(' ');

// This must be kept in sync with the docs site in flow/site
const messageType = 'estuary.colorMode';

function SidePanelConnectorDocs() {
    const intl = useIntl();
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const { docsURL } = useDocs();
    const colorMode = useColorMode();

    useEffect(() => {
        if (iframeRef.current?.contentWindow) {
            iframeRef.current.contentWindow.postMessage(
                { type: messageType, mode: colorMode.colorMode },
                origin
            );
        }
    }, [colorMode]);

    if (!docsURL) return null;

    return (
        <iframe
            ref={iframeRef}
            style={{ border: 'none', height: '100%' }}
            src={docsURL}
            sandbox={sandbox}
            title={intl.formatMessage({ id: 'docs.iframe.title' })}
        />
    );
}

export default SidePanelConnectorDocs;

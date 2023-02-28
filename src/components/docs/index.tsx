import { Toolbar } from '@mui/material';
import { useDocs } from 'context/Docs';
import { useColorMode } from 'context/Theme';
import { useEffect, useRef } from 'react';
import { useIntl } from 'react-intl';
import { getDocsSettings } from 'utils/env-utils';

const sandbox = ['allow-scripts', 'allow-same-origin'].join(' ');
const { origin } = getDocsSettings();

function SidePanelConnectorDocs() {
    const intl = useIntl();
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const { docsURL } = useDocs();
    const colorMode = useColorMode();

    useEffect(() => {
        if (iframeRef.current?.contentWindow) {
            iframeRef.current.contentWindow.postMessage(
                { type: 'estuary.colorMode', mode: colorMode.colorMode },
                origin
            );
        }
    }, [colorMode]);

    if (!docsURL) return null;

    return (
        <>
            <Toolbar />
            <iframe
                ref={iframeRef}
                style={{ border: 'none', height: '100%' }}
                src={docsURL}
                sandbox={sandbox}
                title={intl.formatMessage({ id: 'docs.iframe.title' })}
            />
        </>
    );
}

export default SidePanelConnectorDocs;

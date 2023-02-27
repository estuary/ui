import { Toolbar } from '@mui/material';
import { useDocs } from 'context/Docs';
import { useIntl } from 'react-intl';

const sandbox = ['allow-scripts', 'allow-same-origin'].join(' ');

function SidePanelConnectorDocs() {
    const intl = useIntl();
    const { docsURL } = useDocs();

    if (!docsURL) return null;

    return (
        <>
            <Toolbar />
            <iframe
                style={{ border: 'none', height: '100%' }}
                src={docsURL}
                sandbox={sandbox}
                title={intl.formatMessage({ id: 'docs.iframe.title' })}
            />
        </>
    );
}

export default SidePanelConnectorDocs;

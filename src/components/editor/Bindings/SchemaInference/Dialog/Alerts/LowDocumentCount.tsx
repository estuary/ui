import { FormattedMessage } from 'react-intl';

import { Typography } from '@mui/material';

import { useBindingsEditorStore_documentsRead } from 'components/editor/Bindings/Store/hooks';
import AlertBox from 'components/shared/AlertBox';

const DOCUMENT_THRESHOLD = 10000;

function LowDocumentCountAlert() {
    // Bindings Editor Store
    const documentsRead = useBindingsEditorStore_documentsRead();

    return documentsRead && documentsRead < DOCUMENT_THRESHOLD ? (
        <AlertBox
            severity="warning"
            short
            title={
                <Typography>
                    <FormattedMessage id="workflows.collectionSelector.schemaInference.alert.lowDocumentCount.header" />
                </Typography>
            }
        >
            <FormattedMessage id="workflows.collectionSelector.schemaInference.alert.lowDocumentCount.message" />
        </AlertBox>
    ) : null;
}

export default LowDocumentCountAlert;

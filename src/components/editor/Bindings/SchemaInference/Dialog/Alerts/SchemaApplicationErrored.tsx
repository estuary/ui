import { FormattedMessage } from 'react-intl';

import { Typography } from '@mui/material';

import MessageWithLink from 'components/content/MessageWithLink';
import { useBindingsEditorStore_inferredSchemaApplicationErrored } from 'components/editor/Bindings/Store/hooks';
import AlertBox from 'components/shared/AlertBox';

function SchemaApplicationErroredAlert() {
    // Bindings Editor Store
    const inferredSchemaApplicationErrored =
        useBindingsEditorStore_inferredSchemaApplicationErrored();

    return inferredSchemaApplicationErrored ? (
        <AlertBox
            severity="error"
            short
            title={
                <Typography>
                    <FormattedMessage id="workflows.collectionSelector.schemaInference.alert.generalError.header" />
                </Typography>
            }
        >
            <MessageWithLink messageID="workflows.collectionSelector.schemaInference.alert.patchService.message" />
        </AlertBox>
    ) : null;
}

export default SchemaApplicationErroredAlert;

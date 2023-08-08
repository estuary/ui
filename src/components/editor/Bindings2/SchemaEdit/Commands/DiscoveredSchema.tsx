import { Typography } from '@mui/material';
import SingleLineCode from 'components/content/SingleLineCode';
import {
    useEditorStore_id,
    useEditorStore_persistedDraftId,
} from 'components/editor/Store/hooks';
import { FormattedMessage, useIntl } from 'react-intl';

function DiscoveredSchemaCommands() {
    const intl = useIntl();

    const draftId = useEditorStore_id();
    const persistedDraftId = useEditorStore_persistedDraftId();

    const pullDraftCommand = intl.formatMessage(
        {
            id: 'workflows.collectionSelector.schemaEdit.discoveredCollection.command1',
        },
        {
            draftId: persistedDraftId ?? draftId,
        }
    );

    const pushLocalEditsCommand = intl.formatMessage({
        id: 'workflows.collectionSelector.schemaEdit.discoveredCollection.command2',
    });

    return (
        <>
            <Typography sx={{ mb: 3 }}>
                <FormattedMessage id="workflows.collectionSelector.schemaEdit.description" />
            </Typography>

            <Typography sx={{ mb: 1 }}>
                <FormattedMessage id="workflows.collectionSelector.schemaEdit.message1" />
            </Typography>

            <SingleLineCode value={pullDraftCommand} />

            <Typography sx={{ mt: 3, mb: 1 }}>
                <FormattedMessage id="workflows.collectionSelector.schemaEdit.message2" />
            </Typography>

            <SingleLineCode value={pushLocalEditsCommand} />
        </>
    );
}

export default DiscoveredSchemaCommands;

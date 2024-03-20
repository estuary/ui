import { Typography } from '@mui/material';
import SingleLineCode from 'components/content/SingleLineCode';
import {
    useEditorStore_id,
    useEditorStore_persistedDraftId,
} from 'components/editor/Store/hooks';
import { FormattedMessage, useIntl } from 'react-intl';
import { useBinding_currentCollection } from 'stores/Binding/hooks';

function ExistingSchemaCommands() {
    const intl = useIntl();

    // Binding Store
    const currentCollection = useBinding_currentCollection();

    // Draft Editor Store
    const draftId = useEditorStore_id();
    const persistedDraftId = useEditorStore_persistedDraftId();

    const pullDraftCommands = {
        1: intl.formatMessage(
            {
                id: 'workflows.collectionSelector.schemaEdit.existingCollection.command1',
            },
            {
                draftId: persistedDraftId ?? draftId,
            }
        ),
        2: intl.formatMessage(
            {
                id: 'workflows.collectionSelector.schemaEdit.existingCollection.command2',
            },
            {
                catalogName: currentCollection,
            }
        ),
    };

    const pushLocalEditsCommand = intl.formatMessage({
        id: 'workflows.collectionSelector.schemaEdit.existingCollection.command3',
    });

    return (
        <>
            <Typography sx={{ mb: 3 }}>
                <FormattedMessage id="workflows.collectionSelector.schemaEdit.description" />
            </Typography>

            <Typography sx={{ mb: 1 }}>
                <FormattedMessage id="workflows.collectionSelector.schemaEdit.message1" />
            </Typography>

            <SingleLineCode
                value={pullDraftCommands[1]}
                subsequentCommandExists={true}
            />

            <SingleLineCode value={pullDraftCommands[2]} />

            <Typography sx={{ mt: 3, mb: 1 }}>
                <FormattedMessage id="workflows.collectionSelector.schemaEdit.message2" />
            </Typography>

            <SingleLineCode value={pushLocalEditsCommand} />
        </>
    );
}

export default ExistingSchemaCommands;
